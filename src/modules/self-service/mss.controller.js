const Employee = require('../employee/employee.model');
const AttendanceRecord = require('../attendance/attendance.model');
const LeaveRequest = require('../leave/leaveRequest.model');
const WorkflowRequest = require('../workflow/workflowRequest.model');
const workflowService = require('../workflow/workflow.service');
const auditService = require('../../audit/audit.service');
const { getPagination } = require('../../utils/pagination');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');

const getMssDashboard = async (req, res, next) => {
  try {
    const managerId = req.user.employeeId;
    if (!managerId) return errorResponse(res, 'User is not linked to an Employee profile', 400);

    const tenantId = req.tenantId;
    const userId = req.user.userId;

    // 1. Resolve pending WorkflowRequests where user is active approver
    const allPending = await WorkflowRequest.find({
      tenantId,
      status: 'PENDING',
      isDeleted: false,
      'levels.approverId': userId
    });

    const myPending = allPending.filter(reqDoc => {
      const activeLvl = reqDoc.levels.find(l => l.status === 'PENDING' && l.order === reqDoc.currentLevel);
      return activeLvl && activeLvl.approverId.toString() === userId.toString();
    });

    const leaveApprovalsCount = myPending.filter(r => r.requestType === 'LEAVE_REQUEST').length;
    const regularizationApprovalsCount = myPending.filter(r => r.requestType === 'ATTENDANCE_REGULARIZATION').length;
    const otherApprovalsCount = myPending.length - leaveApprovalsCount - regularizationApprovalsCount;

    // 2. Resolve team stats
    const teamMembers = await Employee.find({
      tenantId,
      'employment.reportingManagerId': managerId,
      isDeleted: false
    });

    const teamIds = teamMembers.map(emp => emp._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let presentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;
    let absentCount = 0;
    let teamOnLeaveToday = [];

    if (teamIds.length > 0) {
      const attendanceRecords = await AttendanceRecord.find({
        tenantId,
        employeeId: { $in: teamIds },
        date: today,
        isDeleted: false
      });

      presentCount = attendanceRecords.filter(r => ['PRESENT', 'LATE', 'REGULARIZED'].includes(r.status)).length;
      lateCount = attendanceRecords.filter(r => r.status === 'LATE').length;
      leaveCount = attendanceRecords.filter(r => r.status === 'ON_LEAVE').length;
      absentCount = teamMembers.length - presentCount - leaveCount;

      teamOnLeaveToday = attendanceRecords
        .filter(r => r.status === 'ON_LEAVE')
        .map(r => {
          const emp = teamMembers.find(e => e._id.toString() === r.employeeId.toString());
          return {
            employeeId: emp ? emp.employeeId : null,
            name: emp ? `${emp.personal.firstName} ${emp.personal.lastName}` : 'Unknown'
          };
        });
    }

    return successResponse(res, {
      pendingApprovals: {
        leave: leaveApprovalsCount,
        regularization: regularizationApprovalsCount,
        other: otherApprovalsCount,
        total: myPending.length
      },
      teamAttendanceToday: {
        totalTeamMembers: teamMembers.length,
        present: presentCount,
        absent: absentCount > 0 ? absentCount : 0,
        late: lateCount,
        onLeave: leaveCount
      },
      teamOnLeaveToday
    }, 'MSS Dashboard metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getMssApprovals = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const query = {
      tenantId: req.tenantId,
      status: 'PENDING',
      isDeleted: false,
      'levels.approverId': req.user.userId
    };

    const allRequests = await WorkflowRequest.find(query)
      .populate('requestedBy', 'email')
      .populate('requestedByEmployeeId', 'personal.firstName personal.lastName employeeId')
      .sort({ createdAt: -1 });

    const filteredRequests = allRequests.filter(reqDoc => {
      const activeLvl = reqDoc.levels.find(l => l.status === 'PENDING' && l.order === reqDoc.currentLevel);
      return activeLvl && activeLvl.approverId.toString() === req.user.userId.toString();
    });

    const total = filteredRequests.length;
    const paginated = filteredRequests.slice(skip, skip + limit);

    return paginatedResponse(res, paginated, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const approveRequest = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const { requestId } = req.params;
    const request = await workflowService.approveLevel(req.tenantId, requestId, req.user.userId, comment);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'APPROVE',
      resourceType: 'WorkflowRequest',
      resourceId: request._id,
      after: request.toObject(),
      req
    });

    return successResponse(res, request, 'Request approved successfully');
  } catch (error) {
    next(error);
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const { requestId } = req.params;
    const request = await workflowService.rejectLevel(req.tenantId, requestId, req.user.userId, comment);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'REJECT',
      resourceType: 'WorkflowRequest',
      resourceId: request._id,
      after: request.toObject(),
      req
    });

    return successResponse(res, request, 'Request rejected successfully');
  } catch (error) {
    next(error);
  }
};

const getTeamMembers = async (req, res, next) => {
  try {
    const managerId = req.user.employeeId;
    if (!managerId) return errorResponse(res, 'User is not linked to an Employee profile', 400);

    const teamMembers = await Employee.find({
      tenantId: req.tenantId,
      'employment.reportingManagerId': managerId,
      isDeleted: false
    }).populate('employment.departmentId', 'name')
      .populate('employment.designationId', 'name');

    const teamIds = teamMembers.map(m => m._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecords = await AttendanceRecord.find({
      tenantId: req.tenantId,
      employeeId: { $in: teamIds },
      date: today,
      isDeleted: false
    });

    const result = teamMembers.map(emp => {
      const att = attendanceRecords.find(r => r.employeeId.toString() === emp._id.toString());
      return {
        employee: emp,
        todayAttendance: att || { status: 'ABSENT', workingMinutes: 0 }
      };
    });

    return successResponse(res, result, 'Team members retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getTeamAttendance = async (req, res, next) => {
  try {
    const managerId = req.user.employeeId;
    if (!managerId) return errorResponse(res, 'User is not linked to an Employee profile', 400);

    const { month } = req.query; // YYYY-MM
    if (!month) return errorResponse(res, 'month query parameter is required (format: YYYY-MM)', 400);

    const [year, m] = month.split('-').map(Number);
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0, 23, 59, 59);

    const teamMembers = await Employee.find({
      tenantId: req.tenantId,
      'employment.reportingManagerId': managerId,
      isDeleted: false
    });
    const teamIds = teamMembers.map(emp => emp._id);

    const records = await AttendanceRecord.find({
      tenantId: req.tenantId,
      employeeId: { $in: teamIds },
      date: { $gte: startDate, $lte: endDate },
      isDeleted: false
    }).populate('employeeId', 'personal.firstName personal.lastName employeeId')
      .sort({ date: 1 });

    return successResponse(res, records, 'Team monthly attendance records fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getTeamLeave = async (req, res, next) => {
  try {
    const managerId = req.user.employeeId;
    if (!managerId) return errorResponse(res, 'User is not linked to an Employee profile', 400);

    const { month } = req.query; // YYYY-MM
    const query = {
      tenantId: req.tenantId,
      isDeleted: false
    };

    const teamMembers = await Employee.find({
      tenantId: req.tenantId,
      'employment.reportingManagerId': managerId,
      isDeleted: false
    });
    const teamIds = teamMembers.map(emp => emp._id);
    query.employeeId = { $in: teamIds };

    if (month) {
      const [year, m] = month.split('-').map(Number);
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0, 23, 59, 59);
      query.$or = [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } }
      ];
    }

    const requests = await LeaveRequest.find(query)
      .populate('employeeId', 'personal.firstName personal.lastName employeeId')
      .populate('leaveTypeId', 'name code')
      .sort({ startDate: -1 });

    return successResponse(res, requests, 'Team leave requests fetched successfully');
  } catch (error) {
    next(error);
  }
};

const initiateTeamTransfer = async (req, res, next) => {
  try {
    const { employeeId, departmentId, locationId, reportingManagerId, effectiveDate, reason } = req.body;
    const managerId = req.user.employeeId;

    if (!managerId) return errorResponse(res, 'User is not linked to an Employee profile', 400);

    // Verify the employee reports to this manager
    const emp = await Employee.findOne({
      _id: employeeId,
      tenantId: req.tenantId,
      'employment.reportingManagerId': managerId,
      isDeleted: false
    });
    if (!emp) return errorResponse(res, 'Employee not found in your team', 404);

    // Create WorkflowRequest of type EMPLOYEE_TRANSFER
    const workflowReq = await workflowService.createWorkflowRequest(
      req.tenantId,
      'EMPLOYEE_TRANSFER',
      emp._id,
      'Employee',
      req.user.userId,
      managerId,
      { departmentId, locationId, reportingManagerId, effectiveDate, reason }
    );

    return successResponse(res, {
      message: 'Transfer request submitted for approval',
      workflowRequestId: workflowReq._id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMssDashboard,
  getMssApprovals,
  approveRequest,
  rejectRequest,
  getTeamMembers,
  getTeamAttendance,
  getTeamLeave,
  initiateTeamTransfer
};
