const AttendanceRecord = require('./attendance.model');
const RegularizationRequest = require('./regularizationRequest.model');
const Shift = require('./shift.model');
const Holiday = require('./holiday.model');
const Employee = require('../employee/employee.model');
const User = require('../auth/auth.model');
const Location = require('../organization/models/location.model');
const attendanceService = require('./attendance.service');
const workflowService = require('../workflow/workflow.service');
const auditService = require('../../audit/audit.service');
const { getPagination } = require('../../utils/pagination');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');

const punch = async (req, res, next) => {
  try {
    const { source, location } = req.body;
    const employeeId = req.user.employeeId;

    const parseLocation = (loc) => {
      if (loc && typeof loc === 'object' && !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude))) {
        return {
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude)
        };
      }
      return undefined;
    };

    if (!employeeId) {
      return errorResponse(res, 'User profile is not associated with an Employee record', 400);
    }

    const employee = await Employee.findOne({ _id: employeeId, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    // 1. Holiday Check
    const holidayCheck = await attendanceService.isHoliday(req.tenantId, employee.employment?.locationId, todayMidnight);
    if (holidayCheck) {
      return errorResponse(res, 'Punches are not allowed. Today is configured as a public holiday', 400);
    }

    // 2. Resolve Active Shift
    const shift = await attendanceService.getEmployeeShift(req.tenantId, employeeId, todayMidnight);
    if (!shift) {
      return errorResponse(res, 'No active shift configuration resolved for employee today', 400);
    }

    // 3. Geofence validations if MOBILE
    if (source === 'MOBILE') {
      const empLocation = await Location.findOne({ _id: employee.employment?.locationId, tenantId: req.tenantId, isDeleted: false });
      if (empLocation && empLocation.gps?.latitude && empLocation.gps?.longitude) {
        const inside = attendanceService.isWithinGeofence(
          location?.latitude,
          location?.longitude,
          empLocation.gps.latitude,
          empLocation.gps.longitude,
          empLocation.gps.radiusMeters
        );
        if (!inside) {
          return errorResponse(res, 'Punch rejected: You are outside the allowed geofence boundary', 400);
        }
      }
    }

    // 4. Load attendance record
    let record = await AttendanceRecord.findOne({
      tenantId: req.tenantId,
      employeeId,
      date: todayMidnight,
      isDeleted: false
    });

    const now = new Date();

    if (!record || !record.punchIn) {
      // PUNCH IN
      const isNew = !record;
      if (isNew) {
        record = new AttendanceRecord({
          tenantId: req.tenantId,
          employeeId,
          date: todayMidnight,
          shiftId: shift._id,
          punchIn: now,
          punchInSource: source,
          punchInLocation: parseLocation(location),
          punchInIp: req.ip,
          rawPunches: [{ time: now, source, location: parseLocation(location), ip: req.ip }],
          status: 'PRESENT',
          createdBy: req.user.userId
        });
      } else {
        record.shiftId = shift._id;
        record.punchIn = now;
        record.punchInSource = source;
        record.punchInLocation = parseLocation(location);
        record.punchInIp = req.ip;
        record.rawPunches.push({ time: now, source, location: parseLocation(location), ip: req.ip });
        record.updatedBy = req.user.userId;
      }

      // Calculate initial status
      const calc = attendanceService.calculateAttendanceStatus(shift, now, null);
      record.status = calc.status;

      await record.save();

      await auditService.log({
        tenantId: req.tenantId,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: isNew ? 'CREATE' : 'UPDATE',
        resourceType: 'AttendanceRecord',
        resourceId: record._id,
        after: record.toObject(),
        req
      });

      return successResponse(res, record, 'Punched in successfully');
    } else {
      // Idempotency check: If punched within last 60 seconds, return same record
      const lastPunch = record.rawPunches[record.rawPunches.length - 1];
      if (lastPunch && (now - new Date(lastPunch.time)) < 60 * 1000) {
        return successResponse(res, record, 'Punch request processed (idempotency check)');
      }

      // Check if already punched out
      if (record.punchOut) {
        return errorResponse(res, 'Already punched out for today', 400);
      }

      // PUNCH OUT
      record.punchOut = now;
      record.punchOutSource = source;
      record.punchOutLocation = parseLocation(location);
      record.punchOutIp = req.ip;
      record.rawPunches.push({ time: now, source, location: parseLocation(location), ip: req.ip });

      // Recalculate status with punchOut
      const calc = attendanceService.calculateAttendanceStatus(shift, record.punchIn, now);
      
      // If today is weekly off, status remains weekly off or present? If weekly off but punches occur, status can be PRESENT.
      const weeklyOff = attendanceService.isWeeklyOff(employee.employment?.weeklyOffDays || [0, 6], todayMidnight);
      record.status = calc.status;
      record.workingMinutes = calc.workingMinutes;
      record.overtimeMinutes = calc.overtimeMinutes;

      await record.save();

      await auditService.log({
        tenantId: req.tenantId,
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: 'UPDATE',
        resourceType: 'AttendanceRecord',
        resourceId: record._id,
        after: record.toObject(),
        req
      });

      return successResponse(res, record, 'Punched out successfully');
    }
  } catch (error) {
    next(error);
  }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const { month } = req.query; // YYYY-MM
    const employeeId = req.user.employeeId;

    if (!employeeId) return errorResponse(res, 'User is not linked to an Employee profile', 400);

    const query = { tenantId: req.tenantId, employeeId, isDeleted: false };
    if (month) {
      const [year, m] = month.split('-').map(Number);
      query.date = {
        $gte: new Date(year, m - 1, 1),
        $lte: new Date(year, m, 0, 23, 59, 59)
      };
    }

    const records = await AttendanceRecord.find(query).sort({ date: 1 });
    return successResponse(res, records, 'My attendance records fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getTeamAttendance = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { startDate, endDate, departmentId, employeeName, status, employeeId } = req.query;
    const managerId = req.user.employeeId;

    if (!managerId) return errorResponse(res, 'User is not linked to an Employee profile', 400);

    // Get team members reporting to this manager
    const teamMembers = await Employee.find({
      tenantId: req.tenantId,
      'employment.reportingManagerId': managerId,
      isDeleted: false
    });

    const teamIds = teamMembers.map(m => m._id);

    const query = {
      tenantId: req.tenantId,
      isDeleted: false
    };

    if (employeeId) {
      const isMember = teamIds.some(id => id.toString() === employeeId.toString());
      if (!isMember) {
        return errorResponse(res, 'Access Denied: This employee is not in your team', 403);
      }
      query.employeeId = employeeId;
    } else {
      query.employeeId = { $in: teamIds };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (status) query.status = status;

    // Filter by employee parameters
    if (departmentId || employeeName) {
      const empQuery = {
        tenantId: req.tenantId,
        _id: { $in: teamIds },
        isDeleted: false
      };
      if (departmentId) empQuery['employment.departmentId'] = departmentId;
      if (employeeName) {
        const nameRegex = new RegExp(employeeName, 'i');
        empQuery.$or = [
          { 'personal.firstName': nameRegex },
          { 'personal.lastName': nameRegex }
        ];
      }

      const matchedEmps = await Employee.find(empQuery);
      const matchedIds = matchedEmps.map(e => e._id);
      
      if (query.employeeId.$in) {
        query.employeeId.$in = query.employeeId.$in.filter(id => matchedIds.some(mid => mid.toString() === id.toString()));
      } else {
        query.employeeId = matchedIds.some(mid => mid.toString() === query.employeeId.toString()) ? query.employeeId : null;
      }
    }

    const items = await AttendanceRecord.find(query)
      .populate({
        path: 'employeeId',
        select: 'personal.firstName personal.lastName employeeId employment.departmentId',
        populate: {
          path: 'employment.departmentId',
          select: 'name code'
        }
      })
      .populate('shiftId', 'name startTime endTime')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AttendanceRecord.countDocuments(query);
    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const getAllAttendance = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { startDate, endDate, month, departmentId, locationId, status, employeeId, employeeName } = req.query;

    const query = { tenantId: req.tenantId, isDeleted: false };

    if (employeeId) query.employeeId = employeeId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    } else if (month) {
      const [year, m] = month.split('-').map(Number);
      query.date = {
        $gte: new Date(year, m - 1, 1),
        $lte: new Date(year, m, 0, 23, 59, 59)
      };
    }

    if (status) query.status = status;

    // Filter by employee parameters
    if (departmentId || locationId || employeeName) {
      const empQuery = { tenantId: req.tenantId, isDeleted: false };
      if (departmentId) empQuery['employment.departmentId'] = departmentId;
      if (locationId) empQuery['employment.locationId'] = locationId;
      if (employeeName) {
        const nameRegex = new RegExp(employeeName, 'i');
        empQuery.$or = [
          { 'personal.firstName': nameRegex },
          { 'personal.lastName': nameRegex }
        ];
      }

      const matchedEmps = await Employee.find(empQuery);
      const matchedIds = matchedEmps.map(e => e._id);

      if (query.employeeId) {
        if (query.employeeId.$in) {
          query.employeeId.$in = query.employeeId.$in.filter(id => matchedIds.some(mid => mid.toString() === id.toString()));
        } else {
          query.employeeId = matchedIds.some(mid => mid.toString() === query.employeeId.toString()) ? query.employeeId : null;
        }
      } else {
        query.employeeId = { $in: matchedIds };
      }
    }

    const items = await AttendanceRecord.find(query)
      .populate({
        path: 'employeeId',
        select: 'personal.firstName personal.lastName employeeId employment.departmentId',
        populate: {
          path: 'employment.departmentId',
          select: 'name code'
        }
      })
      .populate('shiftId', 'name startTime endTime')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AttendanceRecord.countDocuments(query);
    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, departmentId, employeeId, employeeName } = req.query;

    const query = { tenantId: req.tenantId, isDeleted: false };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Resolve employee scope
    const leadershipUsers = await User.find({ tenantId: req.tenantId, role: 'LEADERSHIP' }).select('_id');
    const leadershipUserIds = leadershipUsers.map(u => u._id);
    const empQuery = { tenantId: req.tenantId, isDeleted: false, userId: { $nin: leadershipUserIds } };
    if (req.user.role === 'EMPLOYEE') {
      empQuery._id = req.user.employeeId;
    } else if (req.user.role === 'MANAGER') {
      empQuery['employment.reportingManagerId'] = req.user.employeeId;
    }
    if (departmentId) {
      empQuery['employment.departmentId'] = departmentId;
    }
    if (employeeId) {
      empQuery._id = employeeId;
    }
    if (employeeName) {
      const nameRegex = new RegExp(employeeName, 'i');
      empQuery.$or = [
        { 'personal.firstName': nameRegex },
        { 'personal.lastName': nameRegex }
      ];
    }

    const employees = await Employee.find(empQuery)
      .populate('employment.departmentId', 'name code');

    const empIds = employees.map(e => e._id);
    query.employeeId = { $in: empIds };

    const records = await AttendanceRecord.find(query);

    const summary = employees.map(emp => {
      const empRecords = records.filter(r => r.employeeId.toString() === emp._id.toString());

      const totalDays = empRecords.length;
      const present = empRecords.filter(r => ['PRESENT', 'REGULARIZED'].includes(r.status)).length;
      const absent = empRecords.filter(r => r.status === 'ABSENT').length;
      const late = empRecords.filter(r => r.status === 'LATE').length;
      const halfDay = empRecords.filter(r => r.status === 'HALF_DAY').length;

      const totalMinutes = empRecords.reduce((sum, r) => sum + (r.workingMinutes || 0), 0);
      const totalHours = (totalMinutes / 60).toFixed(2);

      return {
        employeeId: emp._id,
        employeeName: `${emp.personal?.firstName} ${emp.personal?.lastName}`,
        empIdCode: emp.employeeId,
        department: emp.employment?.departmentId?.name || 'General',
        summary: {
          totalDays,
          present,
          absent,
          late,
          halfDay,
          totalHours: Number(totalHours)
        }
      };
    });

    return successResponse(res, summary, 'Attendance summary fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leadershipUsers = await User.find({ tenantId: req.tenantId, role: 'LEADERSHIP' }).select('_id');
    const leadershipUserIds = leadershipUsers.map(u => u._id);
    const empQuery = { tenantId: req.tenantId, status: { $in: ['ACTIVE', 'ONBOARDING'] }, isDeleted: false, userId: { $nin: leadershipUserIds } };
    const recordQuery = { tenantId: req.tenantId, date: today, isDeleted: false };

    if (req.user.role === 'EMPLOYEE') {
      empQuery._id = req.user.employeeId;
      recordQuery.employeeId = req.user.employeeId;
    } else if (req.user.role === 'MANAGER') {
      empQuery['employment.reportingManagerId'] = req.user.employeeId;
      
      const teamMembers = await Employee.find({
        tenantId: req.tenantId,
        'employment.reportingManagerId': req.user.employeeId,
        isDeleted: false,
        userId: { $nin: leadershipUserIds }
      });
      const teamIds = teamMembers.map(m => m._id);
      recordQuery.employeeId = { $in: teamIds };
    } else {
      const activeEmployees = await Employee.find(empQuery).select('_id');
      const activeEmpIds = activeEmployees.map(e => e._id);
      recordQuery.employeeId = { $in: activeEmpIds };
    }

    const activeCount = await Employee.countDocuments(empQuery);
    const records = await AttendanceRecord.find(recordQuery);

    const present = records.filter(r => ['PRESENT', 'LATE', 'REGULARIZED'].includes(r.status)).length;
    const late = records.filter(r => r.status === 'LATE').length;
    const leave = records.filter(r => r.status === 'ON_LEAVE').length;
    const absent = activeCount - present - leave;

    return successResponse(res, {
      totalEmployees: activeCount,
      present,
      absent: absent > 0 ? absent : 0,
      late,
      onLeave: leave
    }, 'Attendance dashboard metrics fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getMuster = async (req, res, next) => {
  try {
    const { month, departmentId } = req.query; // YYYY-MM
    if (!month) return errorResponse(res, 'month is required in query params (format: YYYY-MM)', 400);

    const [year, m] = month.split('-').map(Number);
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0); // Last day of month
    const daysInMonth = endDate.getDate();

    const leadershipUsers = await User.find({ tenantId: req.tenantId, role: 'LEADERSHIP' }).select('_id');
    const leadershipUserIds = leadershipUsers.map(u => u._id);
    const empQuery = { tenantId: req.tenantId, isDeleted: false, userId: { $nin: leadershipUserIds } };
    if (req.user.role === 'EMPLOYEE') {
      empQuery._id = req.user.employeeId;
    } else if (req.user.role === 'MANAGER') {
      empQuery['employment.reportingManagerId'] = req.user.employeeId;
    }
    if (departmentId) empQuery['employment.departmentId'] = departmentId;

    const employees = await Employee.find(empQuery, {
      _id: 1,
      employeeId: 1,
      'personal.firstName': 1,
      'personal.lastName': 1,
      userId: 1
    }).populate('userId', 'role');

    const records = await AttendanceRecord.find({
      tenantId: req.tenantId,
      date: { $gte: startDate, $lte: endDate },
      isDeleted: false
    });

    const grid = employees.map(emp => {
      const empRecords = records.filter(r => r.employeeId.toString() === emp._id.toString());
      const row = {
        employeeId: emp.employeeId,
        name: `${emp.personal.firstName} ${emp.personal.lastName}`,
        role: emp.userId?.role || ''
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const dayRecord = empRecords.find(r => r.date.getDate() === day);
        row[`day_${day}`] = dayRecord ? dayRecord.status : 'ABSENT';
      }
      return row;
    });

    return successResponse(res, grid, 'Muster register register sheets fetched successfully');
  } catch (error) {
    next(error);
  }
};

const regularize = async (req, res, next) => {
  try {
    const { date, requestedPunchIn, requestedPunchOut, reason } = req.body;
    const employeeId = req.user.employeeId;

    if (!employeeId) return errorResponse(res, 'User is not linked to an Employee profile', 400);

    // Validate range: current or previous calendar month only
    const punchDate = new Date(date);
    const now = new Date();
    const limitDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Start of previous month

    if (punchDate < limitDate) {
      return errorResponse(res, 'Regularization is only permitted for the current or previous calendar month', 400);
    }

    // Check existing pending requests
    const existingPending = await RegularizationRequest.findOne({
      tenantId: req.tenantId,
      employeeId,
      date: punchDate,
      status: 'PENDING',
      isDeleted: false
    });

    if (existingPending) {
      return errorResponse(res, 'A pending regularization request already exists for this date', 400);
    }

    const regularization = new RegularizationRequest({
      tenantId: req.tenantId,
      employeeId,
      date: punchDate,
      requestedPunchIn,
      requestedPunchOut,
      reason,
      createdBy: req.user.userId
    });
    await regularization.save();

    // Create WorkflowRequest
    const workflowReq = await workflowService.createWorkflowRequest(
      req.tenantId,
      'ATTENDANCE_REGULARIZATION',
      regularization._id,
      'RegularizationRequest',
      req.user.userId,
      req.user.employeeId,
      { date: punchDate, reason }
    );

    regularization.workflowRequestId = workflowReq._id;
    await regularization.save();

    return successResponse(res, regularization, 'Regularization request submitted for approval successfully');
  } catch (error) {
    next(error);
  }
};

const getMyRegularizations = async (req, res, next) => {
  try {
    const list = await RegularizationRequest.find({
      tenantId: req.tenantId,
      employeeId: req.user.employeeId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    return successResponse(res, list, 'My regularization list fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getPendingRegularizations = async (req, res, next) => {
  try {
    // Return regularizations pending approval for manager's team
    const managerId = req.user.employeeId;
    const team = await Employee.find({
      tenantId: req.tenantId,
      'employment.reportingManagerId': managerId,
      isDeleted: false
    });
    const teamIds = team.map(e => e._id);

    const pending = await RegularizationRequest.find({
      tenantId: req.tenantId,
      employeeId: { $in: teamIds },
      status: 'PENDING',
      isDeleted: false
    }).populate('employeeId', 'personal.firstName personal.lastName employeeId');

    return successResponse(res, pending, 'Pending team regularization requests fetched successfully');
  } catch (error) {
    next(error);
  }
};

const approveRegularization = async (req, res, next) => {
  try {
    const request = await RegularizationRequest.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      status: 'PENDING',
      isDeleted: false
    });

    if (!request) return errorResponse(res, 'Regularization request not found', 404);

    // Call workflow engine to execute approval level
    if (request.workflowRequestId) {
      await workflowService.approveLevel(req.tenantId, request.workflowRequestId, req.user.userId, 'Approved');
      return successResponse(res, null, 'Regularization request approved');
    }

    // Direct fallback if no approval levels configured
    await attendanceService.handleRegularizationApproved(request._id);
    return successResponse(res, null, 'Regularization request approved (Direct callback)');
  } catch (error) {
    next(error);
  }
};

const rejectRegularization = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) return errorResponse(res, 'rejectionReason is required', 400);

    const request = await RegularizationRequest.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      status: 'PENDING',
      isDeleted: false
    });

    if (!request) return errorResponse(res, 'Regularization request not found', 404);

    if (request.workflowRequestId) {
      await workflowService.rejectLevel(req.tenantId, request.workflowRequestId, req.user.userId, rejectionReason);
      return successResponse(res, null, 'Regularization request rejected');
    }

    request.status = 'REJECTED';
    request.rejectionReason = rejectionReason;
    request.approvedBy = req.user.userId;
    request.approvedAt = new Date();
    await request.save();

    return successResponse(res, null, 'Regularization request rejected successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Shift CRUD Controllers
// ==========================================
const createShift = async (req, res, next) => {
  try {
    const shift = new Shift({
      ...req.body,
      tenantId: req.tenantId,
      createdBy: req.user.userId
    });
    await shift.save();

    return successResponse(res, shift, 'Shift configuration created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find({ tenantId: req.tenantId, isDeleted: false });
    return successResponse(res, shifts, 'Shift list fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateShift = async (req, res, next) => {
  try {
    const shift = await Shift.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      { ...req.body, updatedBy: req.user.userId },
      { new: true }
    );
    if (!shift) return errorResponse(res, 'Shift not found', 404);
    return successResponse(res, shift, 'Shift updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteShift = async (req, res, next) => {
  try {
    const shift = await Shift.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), updatedBy: req.user.userId },
      { new: true }
    );
    if (!shift) return errorResponse(res, 'Shift not found', 404);
    return successResponse(res, null, 'Shift deleted successfully');
  } catch (error) {
    next(error);
  }
};

const assignShift = async (req, res, next) => {
  try {
    const { employeeIds } = req.body; // Array of employee document IDs
    const shiftId = req.params.id;

    const shift = await Shift.findOne({ _id: shiftId, tenantId: req.tenantId, isDeleted: false });
    if (!shift) return errorResponse(res, 'Shift not found', 404);

    await Employee.updateMany(
      { _id: { $in: employeeIds }, tenantId: req.tenantId, isDeleted: false },
      { 'employment.shiftId': shiftId }
    );

    return successResponse(res, null, 'Shift successfully assigned to employees');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Holiday CRUD Controllers
// ==========================================
const createHoliday = async (req, res, next) => {
  try {
    const holiday = new Holiday({
      ...req.body,
      tenantId: req.tenantId,
      createdBy: req.user.userId
    });
    await holiday.save();

    return successResponse(res, holiday, 'Holiday created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find({ tenantId: req.tenantId, isDeleted: false }).populate('locationId', 'name');
    return successResponse(res, holidays, 'Holidays fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      { ...req.body, updatedBy: req.user.userId },
      { new: true }
    );
    if (!holiday) return errorResponse(res, 'Holiday not found', 404);
    return successResponse(res, holiday, 'Holiday updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), updatedBy: req.user.userId },
      { new: true }
    );
    if (!holiday) return errorResponse(res, 'Holiday not found', 404);
    return successResponse(res, null, 'Holiday deleted successfully');
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { punchIn, punchOut, status } = req.body;
    
    const record = await AttendanceRecord.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!record) return errorResponse(res, 'Attendance record not found', 404);

    if (punchIn !== undefined) record.punchIn = punchIn ? new Date(punchIn) : null;
    if (punchOut !== undefined) record.punchOut = punchOut ? new Date(punchOut) : null;
    if (status !== undefined) record.status = status;

    // Recalculate duration/hours
    if (record.punchIn && record.punchOut) {
      record.workingMinutes = Math.max(0, Math.round((new Date(record.punchOut) - new Date(record.punchIn)) / (1000 * 60)));
      record.overtimeMinutes = record.workingMinutes > 480 ? record.workingMinutes - 480 : 0;
    } else {
      record.workingMinutes = 0;
      record.overtimeMinutes = 0;
    }

    await record.save();
    return successResponse(res, record, 'Attendance record updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  punch,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
  getAttendanceSummary,
  getDashboard,
  getMuster,
  regularize,
  getMyRegularizations,
  getPendingRegularizations,
  approveRegularization,
  rejectRegularization,
  updateRecord,
  
  createShift,
  getShifts,
  updateShift,
  deleteShift,
  assignShift,
  
  createHoliday,
  getHolidays,
  updateHoliday,
  deleteHoliday
};
