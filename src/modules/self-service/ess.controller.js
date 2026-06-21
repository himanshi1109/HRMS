const Employee = require('../employee/employee.model');
const employeeService = require('../employee/employee.service');
const AttendanceRecord = require('../attendance/attendance.model');
const LeaveBalance = require('../leave/leaveBalance.model');
const WorkflowRequest = require('../workflow/workflowRequest.model');
const Holiday = require('../attendance/holiday.model');
const workflowService = require('../workflow/workflow.service');
const auditService = require('../../audit/audit.service');
const { successResponse, errorResponse } = require('../../utils/response');
const path = require('path');
const fs = require('fs');

const getDashboard = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const tenantId = req.tenantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Employee basic profile
    const profile = await Employee.findOne({ _id: employeeId, tenantId, isDeleted: false })
      .populate('employment.departmentId', 'name')
      .populate('employment.designationId', 'name');
    
    if (!profile) return errorResponse(res, 'Employee profile not found', 404);

    // 2. Today's attendance
    const attendance = await AttendanceRecord.findOne({ tenantId, employeeId, date: today, isDeleted: false });

    // 3. Leave balances (current year)
    const currentYear = new Date().getFullYear();
    const leaveBalances = await LeaveBalance.find({ tenantId, employeeId, year: currentYear })
      .populate('leaveTypeId', 'name code category');

    // 4. Pending workflow requests submitted by this employee
    const pendingWorkflows = await WorkflowRequest.find({
      tenantId,
      requestedBy: req.user.userId,
      status: 'PENDING',
      isDeleted: false
    });

    // 5. Upcoming holidays (next 30 days)
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    
    const locationId = profile.employment?.locationId;
    const upcomingHolidays = await Holiday.find({
      tenantId,
      date: { $gte: today, $lte: thirtyDaysLater },
      $or: [{ locationId: null }, { locationId }],
      isActive: true,
      isDeleted: false
    }).sort({ date: 1 });

    return successResponse(res, {
      profile,
      attendance,
      leaveBalances,
      pendingWorkflows,
      upcomingHolidays
    }, 'ESS Dashboard metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const beforeObj = await Employee.findOne({ _id: employeeId, tenantId: req.tenantId, isDeleted: false });
    if (!beforeObj) return errorResponse(res, 'Employee not found', 404);

    let personal = req.body.personal || {};
    let contact = req.body.contact || {};

    // Support flat fields
    if (req.body.name !== undefined) {
      const nameParts = (req.body.name || '').trim().split(/\s+/);
      personal.firstName = nameParts[0] || '';
      personal.lastName = nameParts.slice(1).join(' ') || '';
    }
    if (req.body.dateOfBirth !== undefined) {
      personal.dateOfBirth = req.body.dateOfBirth;
    }
    if (req.body.gender !== undefined) {
      personal.gender = req.body.gender;
    }
    if (req.body.address !== undefined) {
      personal.address = req.body.address;
    }
    if (req.body.phone !== undefined) {
      contact.personalPhone = req.body.phone;
    }

    const updatePayload = {};
    if (Object.keys(personal).length > 0) {
      updatePayload.personal = { ...beforeObj.personal, ...personal };
    }
    if (Object.keys(contact).length > 0) {
      updatePayload.contact = { ...beforeObj.contact, ...contact };
    }

    const employee = await employeeService.updateEmployee(req.tenantId, employeeId, updatePayload, req.user.userId);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Employee',
      resourceId: employee._id,
      before: beforeObj.toObject(),
      after: employee.toObject(),
      req
    });

    return successResponse(res, employee, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateProfileSensitive = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const employee = await Employee.findOne({ _id: employeeId, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee profile not found', 404);

    // Create workflow request of type SENSITIVE_DATA_CHANGE
    const workflowRequest = await workflowService.createWorkflowRequest(
      req.tenantId,
      'SENSITIVE_DATA_CHANGE',
      employee._id,
      'Employee',
      req.user.userId,
      employeeId,
      { sensitiveData: req.body }
    );

    return successResponse(res, {
      message: 'Sensitive profile details change request created successfully',
      workflowRequestId: workflowRequest._id
    });
  } catch (error) {
    next(error);
  }
};

const getPayslips = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const employee = await Employee.findOne({ _id: employeeId, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    const payslips = employee.documents.filter(doc => doc.type === 'PAYSLIP' && !doc.isDeleted);
    return successResponse(res, payslips, 'Payslips list retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const downloadPayslip = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const { docId } = req.params;

    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const employee = await Employee.findOne({ _id: employeeId, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    const payslip = employee.documents.find(doc => doc._id.toString() === docId && doc.type === 'PAYSLIP' && !doc.isDeleted);
    if (!payslip) return errorResponse(res, 'Payslip document not found', 404);

    const absolutePath = path.resolve(payslip.filePath);
    if (!fs.existsSync(absolutePath)) {
      return errorResponse(res, 'File not found on local disk storage', 404);
    }

    res.setHeader('Content-Disposition', `attachment; filename=payslip-${docId}.pdf`);
    return res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const employee = await Employee.findOne({ _id: employeeId, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee profile not found', 404);

    const docs = employee.documents.filter(doc => !doc.isDeleted);
    return successResponse(res, docs, 'Documents retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getHolidays = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const employee = await Employee.findOne({ _id: employeeId, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const locationId = employee.employment?.locationId;
    const holidays = await Holiday.find({
      tenantId: req.tenantId,
      date: { $gte: start, $lte: end },
      $or: [{ locationId: null }, { locationId }],
      isActive: true,
      isDeleted: false
    }).sort({ date: 1 });

    return successResponse(res, holidays, 'Holidays list retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  updateProfile,
  updateProfileSensitive,
  getPayslips,
  downloadPayslip,
  getDocuments,
  getHolidays
};
