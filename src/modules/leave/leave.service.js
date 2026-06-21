const LeaveType = require('./leaveType.model');
const LeavePolicy = require('./leavePolicy.model');
const LeaveBalance = require('./leaveBalance.model');
const LeaveRequest = require('./leaveRequest.model');
const Employee = require('../employee/employee.model');
const Holiday = require('../attendance/holiday.model');

// 1. Calculate actual leave duration (excluding weekends and holidays)
const calculateLeaveDuration = async (tenantId, employeeId, startDate, endDate, durationType) => {
  if (durationType === 'HALF_DAY_MORNING' || durationType === 'HALF_DAY_AFTERNOON') {
    return 0.5;
  }
  if (durationType === 'HOURLY') {
    return 0.2; // 0.2 days standard weight for hourly
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const employee = await Employee.findOne({ _id: employeeId, tenantId, isDeleted: false });
  const weeklyOffDays = employee?.employment?.weeklyOffDays || [0, 6];
  const locationId = employee?.employment?.locationId;

  // Get holidays in range
  const holidays = await Holiday.find({
    tenantId,
    date: { $gte: start, $lte: end },
    $or: [{ locationId: null }, { locationId }],
    isActive: true,
    isDeleted: false
  });
  const holidayStrings = holidays.map(h => h.date.toDateString());

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay(); // 0 = Sun, 6 = Sat
    const isOff = weeklyOffDays.includes(day);
    const isHoliday = holidayStrings.includes(current.toDateString());

    if (!isOff && !isHoliday) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// 2. Check if employee is eligible for a leave policy
const checkEligibility = async (tenantId, employeeId, policy) => {
  const employee = await Employee.findOne({ _id: employeeId, tenantId, isDeleted: false });
  if (!employee) return false;

  const { eligibility } = policy;
  if (!eligibility) return true;

  // Check service months
  if (eligibility.minServiceMonths && employee.employment?.dateOfJoining) {
    const months = Math.round((new Date() - new Date(employee.employment.dateOfJoining)) / (1000 * 60 * 60 * 24 * 30));
    if (months < eligibility.minServiceMonths) return false;
  }

  // Grade check
  if (eligibility.gradeIds && eligibility.gradeIds.length > 0) {
    if (!employee.employment?.gradeId || !eligibility.gradeIds.includes(employee.employment.gradeId.toString())) {
      return false;
    }
  }

  // Location check
  if (eligibility.locationIds && eligibility.locationIds.length > 0) {
    if (!employee.employment?.locationId || !eligibility.locationIds.includes(employee.employment.locationId.toString())) {
      return false;
    }
  }

  // Employment Type check
  if (eligibility.employmentTypes && eligibility.employmentTypes.length > 0) {
    if (!employee.employment?.employmentType || !eligibility.employmentTypes.includes(employee.employment.employmentType)) {
      return false;
    }
  }

  return true;
};

// 3. Get employee's current balance for a leave type
const getBalance = async (tenantId, employeeId, leaveTypeId, year) => {
  const balance = await LeaveBalance.findOne({ tenantId, employeeId, leaveTypeId, year });
  if (!balance) return 0;
  // balance = openingBalance + accrued - availed - lopDays - encashed
  return balance.openingBalance + balance.accrued - balance.availed - balance.lopDays - balance.encashed;
};

// 4. Check for overlapping leave requests
const checkOverlap = async (tenantId, employeeId, startDate, endDate, excludeId) => {
  const query = {
    tenantId,
    employeeId,
    status: { $in: ['PENDING', 'APPROVED'] },
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
    isDeleted: false
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await LeaveRequest.findOne(query);
};

// 5. Callback when Leave Request is approved
const handleLeaveApproved = async (leaveRequestId) => {
  const request = await LeaveRequest.findById(leaveRequestId);
  if (!request) return;

  request.status = 'APPROVED';

  // Deduct from LeaveBalance
  const currentYear = new Date(request.startDate).getFullYear();
  let balance = await LeaveBalance.findOne({
    tenantId: request.tenantId,
    employeeId: request.employeeId,
    leaveTypeId: request.leaveTypeId,
    year: currentYear
  });

  if (!balance) {
    balance = new LeaveBalance({
      tenantId: request.tenantId,
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
      year: currentYear
    });
  }

  const activeBalance = balance.openingBalance + balance.accrued - balance.availed - balance.lopDays - balance.encashed;
  let availed = request.durationDays;
  let lopDays = 0;

  if (activeBalance < availed) {
    lopDays = availed - activeBalance;
    availed = activeBalance;
  }

  balance.availed += availed;
  balance.lopDays += lopDays;
  await balance.save();

  request.lopDays = lopDays;

  // Mark attendance status as ON_LEAVE for all days in this range
  const start = new Date(request.startDate);
  const end = new Date(request.endDate);
  const current = new Date(start);

  const AttendanceRecord = require('../attendance/attendance.model');

  while (current <= end) {
    const currentDate = new Date(current);
    currentDate.setHours(0, 0, 0, 0);

    await AttendanceRecord.findOneAndUpdate(
      {
        tenantId: request.tenantId,
        employeeId: request.employeeId,
        date: currentDate
      },
      {
        status: 'ON_LEAVE',
        notes: `On approved leave. Reason: ${request.reason}`
      },
      { upsert: true }
    );

    current.setDate(current.getDate() + 1);
  }

  request.attendanceUpdated = true;
  await request.save();
};

// 6. Callback when Leave Withdrawal is approved
const handleLeaveWithdrawalApproved = async (leaveRequestId) => {
  const request = await LeaveRequest.findById(leaveRequestId);
  if (!request) return;

  request.status = 'WITHDRAWN';
  await request.save();

  // Restore balance
  const currentYear = new Date(request.startDate).getFullYear();
  const balance = await LeaveBalance.findOne({
    tenantId: request.tenantId,
    employeeId: request.employeeId,
    leaveTypeId: request.leaveTypeId,
    year: currentYear
  });

  if (balance) {
    balance.availed = Math.max(0, balance.availed - (request.durationDays - request.lopDays));
    balance.lopDays = Math.max(0, balance.lopDays - request.lopDays);
    await balance.save();
  }

  // Remove attendance records marked ON_LEAVE
  const start = new Date(request.startDate);
  const end = new Date(request.endDate);
  const current = new Date(start);

  const AttendanceRecord = require('../attendance/attendance.model');

  while (current <= end) {
    const currentDate = new Date(current);
    currentDate.setHours(0, 0, 0, 0);

    await AttendanceRecord.findOneAndDelete({
      tenantId: request.tenantId,
      employeeId: request.employeeId,
      date: currentDate,
      status: 'ON_LEAVE'
    });

    current.setDate(current.getDate() + 1);
  }
};

module.exports = {
  calculateLeaveDuration,
  checkEligibility,
  getBalance,
  checkOverlap,
  handleLeaveApproved,
  handleLeaveWithdrawalApproved
};
