const Employee = require('../employee/employee.model');
const AttendanceRecord = require('../attendance/attendance.model');
const LeaveRequest = require('../leave/leaveRequest.model');
const LeaveBalance = require('../leave/leaveBalance.model');
const WorkflowRequest = require('../workflow/workflowRequest.model');
const User = require('../auth/auth.model');
const mongoose = require('mongoose');

const getHeadcountReport = async (tenantId, groupBy, filters = {}) => {
  const match = { tenantId: new mongoose.Types.ObjectId(tenantId), isDeleted: false };
  if (filters.status) match.status = filters.status;
  if (filters.departmentId) match['employment.departmentId'] = new mongoose.Types.ObjectId(filters.departmentId);
  if (filters.locationId) match['employment.locationId'] = new mongoose.Types.ObjectId(filters.locationId);

  let groupField = '$status';
  let lookupStage = null;
  let nameField = '$_id';

  if (groupBy === 'department') {
    groupField = '$employment.departmentId';
    lookupStage = { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'info' } };
    nameField = { $ifNull: [{ $arrayElemAt: ['$info.name', 0] }, 'Unassigned'] };
  } else if (groupBy === 'location') {
    groupField = '$employment.locationId';
    lookupStage = { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'info' } };
    nameField = { $ifNull: [{ $arrayElemAt: ['$info.name', 0] }, 'Unassigned'] };
  } else if (groupBy === 'designation') {
    groupField = '$employment.designationId';
    lookupStage = { $lookup: { from: 'designations', localField: '_id', foreignField: '_id', as: 'info' } };
    nameField = { $ifNull: [{ $arrayElemAt: ['$info.name', 0] }, 'Unassigned'] };
  } else if (groupBy === 'grade') {
    groupField = '$employment.gradeId';
    lookupStage = { $lookup: { from: 'grades', localField: '_id', foreignField: '_id', as: 'info' } };
    nameField = { $ifNull: [{ $arrayElemAt: ['$info.name', 0] }, 'Unassigned'] };
  }

  const pipeline = [
    { $match: match },
    { $group: { _id: groupField, count: { $sum: 1 } } }
  ];

  if (lookupStage) {
    pipeline.push(lookupStage);
  }

  pipeline.push({
    $project: {
      _id: 1,
      group: groupBy === 'status' ? '$_id' : nameField,
      count: 1
    }
  });

  return await Employee.aggregate(pipeline);
};

const getAttendanceSummaryReport = async (tenantId, month, departmentId) => {
  const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP' }).select('_id');
  const leadershipUserIds = leadershipUsers.map(u => u._id);
  const empQuery = { tenantId, isDeleted: false, userId: { $nin: leadershipUserIds } };
  if (departmentId) empQuery['employment.departmentId'] = departmentId;
  const employees = await Employee.find(empQuery, { _id: 1, employeeId: 1, personal: 1 });
  const employeeIds = employees.map(e => e._id);

  const [year, m] = month.split('-').map(Number);
  const startDate = new Date(year, m - 1, 1);
  const endDate = new Date(year, m, 0, 23, 59, 59);

  const pipeline = [
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        employeeId: { $in: employeeIds },
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$employeeId',
        presentDays: { $sum: { $cond: [{ $in: ['$status', ['PRESENT', 'REGULARIZED', 'LATE']] }, 1, 0] } },
        absentDays: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
        lateDays: { $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] } },
        halfDays: { $sum: { $cond: [{ $eq: ['$status', 'HALF_DAY'] }, 1, 0] } },
        overtimeMinutes: { $sum: '$overtimeMinutes' }
      }
    }
  ];

  const aggregationResults = await AttendanceRecord.aggregate(pipeline);

  return employees.map(emp => {
    const stats = aggregationResults.find(r => r._id.toString() === emp._id.toString()) || {
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      halfDays: 0,
      overtimeMinutes: 0
    };
    return {
      employeeId: emp.employeeId,
      name: `${emp.personal.firstName} ${emp.personal.lastName}`,
      presentDays: stats.presentDays,
      absentDays: stats.absentDays,
      lateDays: stats.lateDays,
      halfDays: stats.halfDays,
      overtimeHours: Number((stats.overtimeMinutes / 60).toFixed(2))
    };
  });
};

const getLateReport = async (tenantId, month, departmentId) => {
  const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP' }).select('_id');
  const leadershipUserIds = leadershipUsers.map(u => u._id);
  const empQuery = { tenantId, isDeleted: false, userId: { $nin: leadershipUserIds } };
  if (departmentId) empQuery['employment.departmentId'] = departmentId;
  const employees = await Employee.find(empQuery, { _id: 1, employeeId: 1, personal: 1 });
  const employeeIds = employees.map(e => e._id);

  const [year, m] = month.split('-').map(Number);
  const startDate = new Date(year, m - 1, 1);
  const endDate = new Date(year, m, 0, 23, 59, 59);

  const records = await AttendanceRecord.find({
    tenantId,
    employeeId: { $in: employeeIds },
    date: { $gte: startDate, $lte: endDate },
    status: 'LATE',
    isDeleted: false
  }).sort({ date: 1 });

  const grouped = {};
  employees.forEach(emp => {
    const empRecords = records.filter(r => r.employeeId.toString() === emp._id.toString());
    if (empRecords.length > 0) {
      grouped[emp._id] = {
        employeeId: emp.employeeId,
        name: `${emp.personal.firstName} ${emp.personal.lastName}`,
        lateCount: empRecords.length,
        dates: empRecords.map(r => r.date.toISOString().split('T')[0])
      };
    }
  });

  return Object.values(grouped);
};

const getAbsentReport = async (tenantId, month, departmentId) => {
  const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP' }).select('_id');
  const leadershipUserIds = leadershipUsers.map(u => u._id);
  const empQuery = { tenantId, isDeleted: false, userId: { $nin: leadershipUserIds } };
  if (departmentId) empQuery['employment.departmentId'] = departmentId;
  const employees = await Employee.find(empQuery, { _id: 1, employeeId: 1, personal: 1 });
  const employeeIds = employees.map(e => e._id);

  const [year, m] = month.split('-').map(Number);
  const startDate = new Date(year, m - 1, 1);
  const endDate = new Date(year, m, 0, 23, 59, 59);

  const records = await AttendanceRecord.find({
    tenantId,
    employeeId: { $in: employeeIds },
    date: { $gte: startDate, $lte: endDate },
    status: 'ABSENT',
    isDeleted: false
  }).sort({ date: 1 });

  const grouped = {};
  employees.forEach(emp => {
    const empRecords = records.filter(r => r.employeeId.toString() === emp._id.toString());
    if (empRecords.length > 0) {
      grouped[emp._id] = {
        employeeId: emp.employeeId,
        name: `${emp.personal.firstName} ${emp.personal.lastName}`,
        absentCount: empRecords.length,
        dates: empRecords.map(r => r.date.toISOString().split('T')[0])
      };
    }
  });

  return Object.values(grouped);
};

const getOvertimeReport = async (tenantId, month) => {
  const [year, m] = month.split('-').map(Number);
  const startDate = new Date(year, m - 1, 1);
  const endDate = new Date(year, m, 0, 23, 59, 59);

  const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP' }).select('_id');
  const leadershipUserIds = leadershipUsers.map(u => u._id);
  const employees = await Employee.find({ tenantId, isDeleted: false, userId: { $nin: leadershipUserIds } }).select('_id');
  const employeeIds = employees.map(e => e._id);

  const pipeline = [
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        employeeId: { $in: employeeIds },
        date: { $gte: startDate, $lte: endDate },
        overtimeMinutes: { $gt: 0 },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$employeeId',
        totalOvertimeMinutes: { $sum: '$overtimeMinutes' }
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'emp'
      }
    },
    { $unwind: '$emp' },
    {
      $project: {
        _id: 0,
        employeeId: '$emp.employeeId',
        name: { $concat: ['$emp.personal.firstName', ' ', '$emp.personal.lastName'] },
        overtimeHours: { $round: [{ $divide: ['$totalOvertimeMinutes', 60] }, 2] }
      }
    },
    { $sort: { overtimeHours: -1 } }
  ];

  return await AttendanceRecord.aggregate(pipeline);
};

const getLeaveBalancesReport = async (tenantId, year, departmentId, leaveTypeId) => {
  const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP' }).select('_id');
  const leadershipUserIds = leadershipUsers.map(u => u._id);
  const empQuery = { tenantId, isDeleted: false, userId: { $nin: leadershipUserIds } };
  if (departmentId) empQuery['employment.departmentId'] = departmentId;
  const employees = await Employee.find(empQuery, { _id: 1, employeeId: 1, personal: 1 });
  const employeeIds = employees.map(e => e._id);

  const balanceQuery = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    year: Number(year),
    employeeId: { $in: employeeIds }
  };
  if (leaveTypeId) balanceQuery.leaveTypeId = new mongoose.Types.ObjectId(leaveTypeId);

  const balances = await LeaveBalance.find(balanceQuery)
    .populate('leaveTypeId', 'name code')
    .populate('employeeId', 'personal.firstName personal.lastName employeeId');

  return balances.map(b => ({
    employeeId: b.employeeId?.employeeId,
    name: b.employeeId ? `${b.employeeId.personal.firstName} ${b.employeeId.personal.lastName}` : 'Unknown',
    leaveType: b.leaveTypeId?.name,
    leaveCode: b.leaveTypeId?.code,
    openingBalance: b.openingBalance,
    accrued: b.accrued,
    availed: b.availed,
    lopDays: b.lopDays,
    encashed: b.encashed,
    carriedForward: b.carriedForward,
    currentBalance: b.openingBalance + b.accrued - b.availed - b.lopDays - b.encashed
  }));
};

const getLeaveUsageReport = async (tenantId, year, departmentId) => {
  const start = new Date(Number(year), 0, 1);
  const end = new Date(Number(year), 11, 31, 23, 59, 59);

  const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP' }).select('_id');
  const leadershipUserIds = leadershipUsers.map(u => u._id);
  const empQuery = { tenantId, isDeleted: false, userId: { $nin: leadershipUserIds } };
  if (departmentId) empQuery['employment.departmentId'] = departmentId;
  const employees = await Employee.find(empQuery, { _id: 1, 'employment.departmentId': 1 });
  const employeeIds = employees.map(e => e._id);

  const pipeline = [
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        employeeId: { $in: employeeIds },
        startDate: { $gte: start, $lte: end },
        status: 'APPROVED',
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$leaveTypeId',
        totalDays: { $sum: '$durationDays' }
      }
    },
    {
      $lookup: {
        from: 'leavetypes',
        localField: '_id',
        foreignField: '_id',
        as: 'type'
      }
    },
    { $unwind: '$type' },
    {
      $project: {
        _id: 0,
        leaveType: '$type.name',
        leaveCode: '$type.code',
        totalDays: 1
      }
    },
    { $sort: { totalDays: -1 } }
  ];

  return await LeaveRequest.aggregate(pipeline);
};

const getLeaveLopReport = async (tenantId, month) => {
  const [year, m] = month.split('-').map(Number);
  const startDate = new Date(year, m - 1, 1);
  const endDate = new Date(year, m, 0, 23, 59, 59);

  const pipeline = [
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        startDate: { $gte: startDate, $lte: endDate },
        status: 'APPROVED',
        lopDays: { $gt: 0 },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$employeeId',
        totalLopDays: { $sum: '$lopDays' }
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'emp'
      }
    },
    { $unwind: '$emp' },
    {
      $project: {
        _id: 0,
        employeeId: '$emp.employeeId',
        name: { $concat: ['$emp.personal.firstName', ' ', '$emp.personal.lastName'] },
        totalLopDays: 1
      }
    },
    { $sort: { totalLopDays: -1 } }
  ];

  return await LeaveRequest.aggregate(pipeline);
};

const getAttritionReport = async (tenantId, year) => {
  const start = new Date(Number(year), 0, 1);
  const end = new Date(Number(year), 11, 31, 23, 59, 59);

  const pipeline = [
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        status: 'EXITED',
        'exit.exitDate': { $gte: start, $lte: end },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$exit.exitDate' },
          exitType: '$exit.exitType',
          departmentId: '$employment.departmentId'
        },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id.departmentId',
        foreignField: '_id',
        as: 'dept'
      }
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        exitType: '$_id.exitType',
        department: { $ifNull: [{ $arrayElemAt: ['$dept.name', 0] }, 'Unassigned'] },
        count: 1
      }
    },
    { $sort: { month: 1 } }
  ];

  return await Employee.aggregate(pipeline);
};

const getHrDashboardMetrics = async (tenantId) => {
  const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP' }).select('_id');
  const leadershipUserIds = leadershipUsers.map(u => u._id);
  const activeCount = await Employee.countDocuments({ tenantId, status: 'ACTIVE', isDeleted: false, userId: { $nin: leadershipUserIds } });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendanceRecords = await AttendanceRecord.find({ tenantId, date: today, isDeleted: false });
  const presentCount = attendanceRecords.filter(r => ['PRESENT', 'LATE', 'REGULARIZED'].includes(r.status)).length;
  
  const presencePercentage = activeCount > 0 ? Number(((presentCount / activeCount) * 100).toFixed(2)) : 0;

  const pendingApprovalsCount = await WorkflowRequest.countDocuments({ tenantId, status: 'PENDING', isDeleted: false });

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const joinersThisMonth = await Employee.countDocuments({
    tenantId,
    'employment.dateOfJoining': { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    isDeleted: false
  });

  const exitsThisMonth = await Employee.countDocuments({
    tenantId,
    status: 'EXITED',
    'exit.exitDate': { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    isDeleted: false
  });

  return {
    totalActiveEmployees: activeCount,
    todayPresencePercentage: presencePercentage,
    pendingApprovalsCount,
    joinersThisMonth,
    exitsThisMonth
  };
};

const getLeadershipDashboardMetrics = async (tenantId) => {
  const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP' }).select('_id');
  const leadershipUserIds = leadershipUsers.map(u => u._id);
  const activeCount = await Employee.countDocuments({ tenantId, status: 'ACTIVE', isDeleted: false, userId: { $nin: leadershipUserIds } });
  const headcountByDept = await getHeadcountReport(tenantId, 'department');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const totalPunches = await AttendanceRecord.countDocuments({
    tenantId,
    date: { $gte: thirtyDaysAgo },
    status: { $in: ['PRESENT', 'LATE', 'REGULARIZED'] },
    isDeleted: false
  });

  const avgPresencePerDay = totalPunches / 30;
  const avgAttendancePercentage = activeCount > 0 ? Number(((avgPresencePerDay / activeCount) * 100).toFixed(2)) : 0;

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const exitsThisYear = await Employee.countDocuments({
    tenantId,
    status: 'EXITED',
    'exit.exitDate': { $gte: startOfYear },
    isDeleted: false
  });
  const attritionRate = activeCount > 0 ? Number(((exitsThisYear / activeCount) * 100).toFixed(2)) : 0;

  const leaveUsage = await getLeaveUsageReport(tenantId, currentYear);

  return {
    headcountByDept,
    avgAttendancePercentage,
    attritionRate,
    leaveUsage
  };
};

module.exports = {
  getHeadcountReport,
  getAttendanceSummaryReport,
  getLateReport,
  getAbsentReport,
  getOvertimeReport,
  getLeaveBalancesReport,
  getLeaveUsageReport,
  getLeaveLopReport,
  getAttritionReport,
  getHrDashboardMetrics,
  getLeadershipDashboardMetrics
};
