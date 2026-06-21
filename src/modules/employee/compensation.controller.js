const Employee = require('./employee.model');
const AttendanceRecord = require('../attendance/attendance.model');
const { successResponse, errorResponse } = require('../../utils/response');

function calculateSalaryStructure(monthlyCTC) {
  let gross = 0;
  let employerPF = 0;
  let gratuity = 0;
  let employerESI = 0;

  // CTC = Gross + PF + Gratuity + ESI
  // If Gross <= 21000, ESI = 3.25% of Gross
  // PF = 12% of Basic (Basic = 50% of Gross) -> 6% of Gross (capped at 1800)
  // Gratuity = 4.81% of Basic (Basic = 50% of Gross) -> 2.405% of Gross

  // 1. Try Gross <= 21,000 (ESI applicable)
  let tempGross = monthlyCTC / 1.11655;
  if (tempGross <= 21000) {
    gross = tempGross;
    employerPF = gross * 0.06;
    gratuity = gross * 0.02405;
    employerESI = gross * 0.0325;
  } else {
    // 2. Gross > 21,000 (ESI not applicable)
    // Try Case A: Basic <= 15000 (Gross <= 30000)
    let tempGross2 = monthlyCTC / 1.08405;
    if (tempGross2 <= 30000) {
      gross = tempGross2;
      employerPF = gross * 0.06;
      gratuity = gross * 0.02405;
      employerESI = 0;
    } else {
      // Try Case B: Basic > 15000 (Gross > 30000)
      gross = (monthlyCTC - 1800) / 1.02405;
      employerPF = 1800;
      gratuity = gross * 0.02405;
      employerESI = 0;
    }
  }

  // Round components
  gross = Math.round(gross * 100) / 100;
  employerPF = Math.round(employerPF * 100) / 100;
  gratuity = Math.round(gratuity * 100) / 100;
  employerESI = Math.round(employerESI * 100) / 100;

  const basic = Math.round((gross * 0.50) * 100) / 100;
  const hra = Math.round((gross * 0.20) * 100) / 100;
  const specialAllowance = Math.round((gross * 0.20) * 100) / 100;
  const conveyance = Math.round((gross * 0.05) * 100) / 100;
  const otherAllowance = Math.round((gross * 0.05) * 100) / 100;

  // Employee Deductions
  const employeePF = Math.min(Math.round((basic * 0.12) * 100) / 100, 1800);
  const employeeESI = gross <= 21000 ? Math.round((gross * 0.0075) * 100) / 100 : 0;
  const professionalTax = gross > 15000 ? 200 : 0;

  return {
    monthlyCTC,
    gross,
    basic,
    hra,
    specialAllowance,
    conveyance,
    otherAllowance,
    employerPF,
    gratuity,
    employerESI,
    employeePF,
    employeeESI,
    professionalTax
  };
}

// Check if user has permission to view employee's compensation data
async function checkCompensationAccess(req, res, targetEmployeeId) {
  const { role, employeeId } = req.user;
  
  if (role === 'HR_ADMIN' || role === 'LEADERSHIP') {
    return true;
  }
  
  if (employeeId && employeeId.toString() === targetEmployeeId.toString()) {
    return true;
  }
  
  if (role === 'MANAGER') {
    // Verify target employee reports to this manager
    const target = await Employee.findOne({ _id: targetEmployeeId, tenantId: req.tenantId, isDeleted: false });
    if (target && target.employment?.reportingManagerId?.toString() === employeeId.toString()) {
      return true;
    }
  }
  
  return false;
}

// GET /api/employees/my/compensation
const getMyCompensation = async (req, res, next) => {
  try {
    const { employeeId } = req.user;
    if (!employeeId) {
      return errorResponse(res, 'User is not linked to an employee profile', 400);
    }
    
    const employee = await Employee.findOne({ _id: employeeId, tenantId: req.tenantId, isDeleted: false })
      .populate('employment.departmentId', 'name')
      .populate('employment.designationId', 'name');
      
    if (!employee) {
      return errorResponse(res, 'Employee not found', 404);
    }
    
    const annualCTC = employee.employment?.salary || 600000;
    const structure = calculateSalaryStructure(annualCTC / 12);
    
    return successResponse(res, { employee, structure }, 'Compensation retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// GET /api/employees/:id/compensation
const getEmployeeCompensation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const hasAccess = await checkCompensationAccess(req, res, id);
    if (!hasAccess) {
      return errorResponse(res, 'Forbidden: Insufficient permissions to view this compensation details', 403);
    }
    
    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false })
      .populate('employment.departmentId', 'name')
      .populate('employment.designationId', 'name');
      
    if (!employee) {
      return errorResponse(res, 'Employee not found', 404);
    }
    
    const annualCTC = employee.employment?.salary || 600000;
    const structure = calculateSalaryStructure(annualCTC / 12);
    
    return successResponse(res, { employee, structure }, 'Employee compensation retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Internal helper to calculate a monthly payslip details
async function calculateMonthlyPayslip(tenantId, employee, year, month) {
  const annualCTC = employee.employment?.salary || 600000;
  const structure = calculateSalaryStructure(annualCTC / 12);
  
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999));
  
  // Count Absent and Half Days from Attendance
  const attendanceRecords = await AttendanceRecord.find({
    tenantId,
    employeeId: employee._id,
    date: { $gte: startDate, $lte: endDate },
    status: { $in: ['ABSENT', 'HALF_DAY'] },
    isDeleted: false
  });
  
  let absentDays = 0;
  let halfDays = 0;
  attendanceRecords.forEach(rec => {
    if (rec.status === 'ABSENT') absentDays += 1;
    if (rec.status === 'HALF_DAY') halfDays += 1;
  });
  
  const unpaidDays = absentDays + (halfDays * 0.5);
  const lwpDeduction = Math.round(((structure.gross / daysInMonth) * unpaidDays) * 100) / 100;
  
  const totalDeductions = Math.round((structure.employeePF + structure.employeeESI + structure.professionalTax + lwpDeduction) * 100) / 100;
  const netSalary = Math.max(0, Math.round((structure.gross - totalDeductions) * 100) / 100);
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[month - 1];
  
  return {
    year,
    month,
    monthName,
    yearMonth: `${year}-${String(month).padStart(2, '0')}`,
    daysInMonth,
    unpaidDays,
    absentDays,
    halfDays,
    structure,
    lwpDeduction,
    totalDeductions,
    netSalary
  };
}

// GET /api/employees/:id/payslips
const getEmployeePayslips = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const hasAccess = await checkCompensationAccess(req, res, id);
    if (!hasAccess) {
      return errorResponse(res, 'Forbidden: Insufficient permissions to view payslips', 403);
    }
    
    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!employee) {
      return errorResponse(res, 'Employee not found', 404);
    }
    
    // We will generate the last 12 months dynamically starting from current month going back
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    
    const payslips = [];
    const dateOfJoining = employee.employment?.dateOfJoining ? new Date(employee.employment.dateOfJoining) : null;
    
    for (let i = 0; i < 12; i++) {
      let year = currentYear;
      let month = currentMonth - i;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      // Don't generate payslips for dates before joining
      if (dateOfJoining) {
        const firstOfMonth = new Date(year, month - 1, 1);
        const lastOfMonth = new Date(year, month, 0);
        if (dateOfJoining > lastOfMonth) {
          continue;
        }
      }
      
      const payslip = await calculateMonthlyPayslip(req.tenantId, employee, year, month);
      payslips.push(payslip);
    }
    
    return successResponse(res, payslips, 'Payslips retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// GET /api/employees/:id/payslips/:yearMonth
const getEmployeePayslipDetail = async (req, res, next) => {
  try {
    const { id, yearMonth } = req.params;
    
    const hasAccess = await checkCompensationAccess(req, res, id);
    if (!hasAccess) {
      return errorResponse(res, 'Forbidden: Insufficient permissions to view payslip details', 403);
    }
    
    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false })
      .populate('employment.departmentId', 'name')
      .populate('employment.designationId', 'name');
      
    if (!employee) {
      return errorResponse(res, 'Employee not found', 404);
    }
    
    const [yearStr, monthStr] = yearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return errorResponse(res, 'Invalid year-month format. Expected YYYY-MM', 400);
    }
    
    const payslip = await calculateMonthlyPayslip(req.tenantId, employee, year, month);
    
    return successResponse(res, payslip, 'Payslip details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCompensation,
  getEmployeeCompensation,
  getEmployeePayslips,
  getEmployeePayslipDetail
};
