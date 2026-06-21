const Shift = require('./shift.model');
const Holiday = require('./holiday.model');
const AttendanceRecord = require('./attendance.model');
const RegularizationRequest = require('./regularizationRequest.model');
const Employee = require('../employee/employee.model');

// 1. Get employee's active shift for a date
const getEmployeeShift = async (tenantId, employeeId, date) => {
  const employee = await Employee.findOne({ _id: employeeId, tenantId, isDeleted: false });
  if (!employee || !employee.employment?.shiftId) {
    // Return a default fallback shift if none configured
    return await Shift.findOne({ tenantId, isActive: true, isDeleted: false });
  }
  return await Shift.findOne({ _id: employee.employment.shiftId, tenantId, isDeleted: false });
};

// 2. Calculate attendance status from punch data
const calculateAttendanceStatus = (shift, punchIn, punchOut) => {
  if (!punchIn) {
    return { status: 'ABSENT', workingMinutes: 0, overtimeMinutes: 0 };
  }

  // Parse punchIn date to extract the base date (e.g. YYYY-MM-DD)
  const baseDate = new Date(punchIn);
  const [startH, startM] = shift.startTime.split(':').map(Number);
  
  // Create expected shift start time on the same day as punchIn
  const shiftStart = new Date(baseDate);
  shiftStart.setHours(startH, startM, 0, 0);

  let status = 'PRESENT';
  
  // Calculate grace and late mark deadlines
  const graceLimit = new Date(shiftStart.getTime() + (shift.graceMinutes || 15) * 60 * 1000);
  const lateLimit = new Date(shiftStart.getTime() + (shift.lateMarkAfterMinutes || 30) * 60 * 1000);

  const punchInTime = new Date(punchIn);
  if (punchInTime > lateLimit) {
    status = 'LATE';
  } else if (punchInTime > graceLimit) {
    status = 'LATE';
  }

  let workingMinutes = 0;
  let overtimeMinutes = 0;

  if (punchOut) {
    const punchOutTime = new Date(punchOut);
    workingMinutes = Math.max(0, Math.round((punchOutTime - punchInTime) / (1000 * 60)));

    // Half day check
    if (workingMinutes < (shift.halfDayThresholdMinutes || 240)) {
      status = 'HALF_DAY';
    }

    // Overtime check
    if (workingMinutes > (shift.overtimeAfterMinutes || 480)) {
      overtimeMinutes = workingMinutes - (shift.overtimeAfterMinutes || 480);
    }
  }

  return { status, workingMinutes, overtimeMinutes };
};

// 3. Check if a date is a holiday for an employee's location
const isHoliday = async (tenantId, locationId, date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const query = {
    tenantId,
    date: targetDate,
    isActive: true,
    isDeleted: false
  };

  if (locationId) {
    query.$or = [{ locationId: null }, { locationId }];
  } else {
    query.locationId = null;
  }

  const holiday = await Holiday.findOne(query);
  return !!holiday;
};

// 4. Check if date is weekly off for employee
const isWeeklyOff = (weeklyOffDays, date) => {
  const day = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
  return weeklyOffDays.includes(day);
};

// 5. GPS geofence validation using Haversine formula
const isWithinGeofence = (punchLat, punchLng, locationLat, locationLng, radiusMeters = 200) => {
  if (!punchLat || !punchLng || !locationLat || !locationLng) return false;
  
  const R = 6371e3; // Earth radius in meters
  const phi1 = punchLat * Math.PI / 180;
  const phi2 = locationLat * Math.PI / 180;
  const deltaPhi = (locationLat - punchLat) * Math.PI / 180;
  const deltaLambda = (locationLng - punchLng) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusMeters;
};

// Callback from Workflow engine upon final approval of regularization
const handleRegularizationApproved = async (requestId) => {
  const request = await RegularizationRequest.findById(requestId);
  if (!request) return;

  request.status = 'APPROVED';
  request.approvedAt = new Date();
  await request.save();

  // Find or create attendance record for that date
  const targetDate = new Date(request.date);
  targetDate.setHours(0, 0, 0, 0);

  let record = await AttendanceRecord.findOne({
    tenantId: request.tenantId,
    employeeId: request.employeeId,
    date: targetDate,
    isDeleted: false
  });

  if (!record) {
    record = new AttendanceRecord({
      tenantId: request.tenantId,
      employeeId: request.employeeId,
      date: targetDate
    });
  }

  const shift = await getEmployeeShift(request.tenantId, request.employeeId, targetDate);

  record.punchIn = request.requestedPunchIn;
  record.punchOut = request.requestedPunchOut;
  record.isRegularized = true;
  record.regularizationRequestId = request._id;
  record.shiftId = shift ? shift._id : undefined;

  // Recalculate status
  const calc = calculateAttendanceStatus(shift, request.requestedPunchIn, request.requestedPunchOut);
  record.status = 'REGULARIZED'; // Set to REGULARIZED status as specified
  record.workingMinutes = calc.workingMinutes;
  record.overtimeMinutes = calc.overtimeMinutes;

  await record.save();
};

module.exports = {
  getEmployeeShift,
  calculateAttendanceStatus,
  isHoliday,
  isWeeklyOff,
  isWithinGeofence,
  handleRegularizationApproved
};
