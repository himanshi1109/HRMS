const employeeService = require('./employee.service');
const Employee = require('./employee.model');
const User = require('../auth/auth.model');
const AuditLog = require('../../audit/audit.model');
const auditService = require('../../audit/audit.service');
const workflowService = require('../workflow/workflow.service');
const { getPagination } = require('../../utils/pagination');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');
const { Parser } = require('json2csv');
const { parse } = require('csv-parse/sync');
const fs = require('fs');

const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.tenantId, req.body, req.user.userId);
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'CREATE',
      resourceType: 'Employee',
      resourceId: employee._id,
      after: employee,
      req
    });
    return successResponse(res, employee, 'Employee created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filters = {
      search: req.query.search,
      departmentId: req.query.departmentId,
      locationId: req.query.locationId,
      designationId: req.query.designationId,
      status: req.query.status,
      reportingManagerId: req.query.reportingManagerId,
      role: req.query.role
    };

    const { items, total } = await employeeService.getEmployees(
      req.tenantId,
      filters,
      { skip, limit },
      req.user.role,
      req.user.employeeId
    );

    let finalItems = items;
    if (req.user.role !== 'HR_ADMIN') {
      finalItems = items.map(item => {
        const obj = item.toObject();
        if (obj.employment) {
          delete obj.employment.salary;
        }
        delete obj.statutory;
        delete obj.documents;
        return obj;
      });
    }

    return paginatedResponse(res, finalItems, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, employeeId } = req.user;

    const employee = await employeeService.getEmployeeById(req.tenantId, id);
    if (!employee) {
      return errorResponse(res, 'Employee not found', 404);
    }

    // If not HR Admin, and not viewing their own profile:
    if (role !== 'HR_ADMIN' && employeeId?.toString() !== id) {
      const redactedEmployee = employee.toObject();
      if (redactedEmployee.employment) {
        delete redactedEmployee.employment.salary;
      }
      delete redactedEmployee.statutory;
      delete redactedEmployee.documents;
      return successResponse(res, redactedEmployee, 'Employee retrieved successfully');
    }

    return successResponse(res, employee, 'Employee retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const beforeObj = await Employee.findOne({ _id: req.params.id, tenantId: req.tenantId, isDeleted: false });
    if (!beforeObj) return errorResponse(res, 'Employee not found', 404);

    const employee = await employeeService.updateEmployee(req.tenantId, req.params.id, req.body, req.user.userId);
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
    return successResponse(res, employee, 'Employee updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateEmployeePersonal = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.employeeId?.toString() !== id) {
      return errorResponse(res, 'Forbidden: You can only update your own profile details', 403);
    }

    const beforeObj = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
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

    const employee = await employeeService.updateEmployee(req.tenantId, id, updatePayload, req.user.userId);
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

    return successResponse(res, employee, 'Personal profile updated successfully');
  } catch (error) {
    next(error);
  }
};

const updateEmployeeSensitive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    // Create workflow request for sensitive change
    const workflowRequest = await workflowService.createWorkflowRequest(
      req.tenantId,
      'SENSITIVE_DATA_CHANGE',
      employee._id,
      'Employee',
      req.user.userId,
      req.user.employeeId,
      { sensitiveData: req.body }
    );

    return successResponse(res, {
      message: 'Sensitive information change request submitted for approval',
      workflowRequestId: workflowRequest._id
    });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, name } = req.body;
    if (!req.file) return errorResponse(res, 'No file uploaded', 400);

    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    const documentEntry = {
      type: type || 'OTHER',
      name: name || req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date()
    };

    employee.documents.push(documentEntry);
    await employee.save();

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Employee',
      resourceId: employee._id,
      after: { action: 'Document upload', file: documentEntry.name },
      req
    });

    return successResponse(res, employee, 'Document uploaded successfully');
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    const docIndex = employee.documents.findIndex(d => d._id.toString() === docId && !d.isDeleted);
    if (docIndex === -1) return errorResponse(res, 'Document not found', 404);

    // Soft delete subdocument
    employee.documents[docIndex].isDeleted = true;
    await employee.save();

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Employee',
      resourceId: employee._id,
      after: { action: 'Document delete', docId },
      req
    });

    return successResponse(res, employee, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

const confirmEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    employee.status = 'CONFIRMED';
    employee.employment.dateOfConfirmation = new Date();
    await employee.save();

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Employee',
      resourceId: employee._id,
      after: { status: 'CONFIRMED', dateOfConfirmation: employee.employment.dateOfConfirmation },
      req
    });

    return successResponse(res, employee, 'Employee confirmation successful');
  } catch (error) {
    next(error);
  }
};

const transferEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    const { departmentId, locationId, reportingManagerId, effectiveDate, reason } = req.body;
    if (!departmentId || !locationId || !reportingManagerId) {
      return errorResponse(res, 'departmentId, locationId, and reportingManagerId are required', 400);
    }

    await employeeService.checkCircularHierarchy(req.tenantId, id, reportingManagerId);

    const workflowRequest = await workflowService.createWorkflowRequest(
      req.tenantId,
      'EMPLOYEE_TRANSFER',
      employee._id,
      'Employee',
      req.user.userId,
      req.user.employeeId,
      { departmentId, locationId, reportingManagerId, effectiveDate, reason }
    );

    return successResponse(res, {
      message: 'Employee transfer request submitted for approval',
      workflowRequestId: workflowRequest._id
    });
  } catch (error) {
    next(error);
  }
};

const promoteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    const { designationId, gradeId, effectiveDate, reason } = req.body;
    if (!designationId || !gradeId) {
      return errorResponse(res, 'designationId and gradeId are required', 400);
    }

    const workflowRequest = await workflowService.createWorkflowRequest(
      req.tenantId,
      'EMPLOYEE_PROMOTION',
      employee._id,
      'Employee',
      req.user.userId,
      req.user.employeeId,
      { designationId, gradeId, effectiveDate, reason }
    );

    return successResponse(res, {
      message: 'Employee promotion request submitted for approval',
      workflowRequestId: workflowRequest._id
    });
  } catch (error) {
    next(error);
  }
};

const exitEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);

    employee.status = 'EXITED';
    employee.exit = {
      ...req.body,
      exitDate: req.body.exitDate || new Date()
    };
    await employee.save();

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'Employee',
      resourceId: employee._id,
      after: { action: 'Exit processed', exit: employee.exit },
      req
    });

    return successResponse(res, employee, 'Employee exit processed successfully');
  } catch (error) {
    next(error);
  }
};

const getTimeline = async (req, res, next) => {
  try {
    const timeline = await AuditLog.find({
      tenantId: req.tenantId,
      resourceId: req.params.id
    }).sort({ timestamp: -1 });

    return successResponse(res, timeline, 'Employee timeline logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getDirectory = async (req, res, next) => {
  try {
    const query = { tenantId: req.tenantId, isDeleted: false };
    if (req.query.search) {
      query.$or = [
        { 'personal.firstName': { $regex: req.query.search, $options: 'i' } },
        { 'personal.lastName': { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.departmentId) query['employment.departmentId'] = req.query.departmentId;
    if (req.query.locationId) query['employment.locationId'] = req.query.locationId;

    const directory = await Employee.find(query, {
      'personal.firstName': 1,
      'personal.lastName': 1,
      'personal.photo': 1,
      'contact.officialEmail': 1,
      'contact.workPhone': 1,
      'employment.designationId': 1,
      'employment.departmentId': 1
    })
      .populate('employment.designationId', 'name')
      .populate('employment.departmentId', 'name');

    return successResponse(res, directory, 'Directory list fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getOrgChart = async (req, res, next) => {
  try {
    const employees = await Employee.find({ tenantId: req.tenantId, isDeleted: false }, {
      _id: 1,
      'personal.firstName': 1,
      'personal.lastName': 1,
      'personal.photo': 1,
      'contact.officialEmail': 1,
      'employment.reportingManagerId': 1,
      'employment.designationId': 1,
      'employment.departmentId': 1
    })
      .populate('employment.designationId', 'name')
      .populate('employment.departmentId', 'name');

    const map = {};
    employees.forEach(emp => {
      map[emp._id.toString()] = {
        id: emp._id,
        name: `${emp.personal.firstName} ${emp.personal.lastName}`,
        photo: emp.personal.photo,
        officialEmail: emp.contact.officialEmail,
        designation: emp.employment.designationId?.name,
        department: emp.employment.departmentId?.name,
        managerId: emp.employment.reportingManagerId?.toString(),
        children: []
      };
    });

    const roots = [];
    employees.forEach(emp => {
      const node = map[emp._id.toString()];
      if (node.managerId && map[node.managerId]) {
        map[node.managerId].children.push(node);
      } else {
        roots.push(node);
      }
    });

    return successResponse(res, roots, 'Org chart fetched successfully');
  } catch (error) {
    next(error);
  }
};

const bulkImport = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'CSV file is required', 400);

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    if (records.length > 500) {
      return errorResponse(res, 'File too large. Please split into files of max 500 rows.', 400);
    }

    let created = 0;
    let failed = 0;
    const errors = [];

    for (let index = 0; index < records.length; index++) {
      const row = records[index];
      try {
        // Map CSV headers to Employee schema format
        const employeePayload = {
          personal: {
            firstName: row.firstName,
            lastName: row.lastName,
            gender: row.gender
          },
          contact: {
            officialEmail: row.officialEmail,
            personalPhone: row.personalPhone
          },
          employment: {
            employmentType: row.employmentType || 'FULL_TIME',
            dateOfJoining: row.dateOfJoining ? new Date(row.dateOfJoining) : new Date()
          }
        };

        if (!employeePayload.personal.firstName || !employeePayload.personal.lastName || !employeePayload.contact.officialEmail) {
          throw new Error('firstName, lastName, and officialEmail are required');
        }

        await employeeService.createEmployee(req.tenantId, employeePayload, req.user.userId);
        created++;
      } catch (err) {
        failed++;
        errors.push({ row: index + 1, error: err.message });
      }
    }

    // Clean temp upload file
    fs.unlinkSync(req.file.path);

    return successResponse(res, { created, failed, errors }, 'Bulk import completed');
  } catch (error) {
    next(error);
  }
};

const exportEmployees = async (req, res, next) => {
  try {
    const query = { tenantId: req.tenantId, isDeleted: false };
    const employees = await Employee.find(query).limit(5000);

    const fields = [
      'employeeId',
      'personal.firstName',
      'personal.lastName',
      'contact.officialEmail',
      'status'
    ];
    
    const parser = new Parser({ fields });
    const csv = parser.parse(employees);

    res.header('Content-Type', 'text/csv');
    res.attachment(`employees-export-${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

const resetEmployeePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return errorResponse(res, 'New password is required', 400);

    const employee = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee not found', 404);
    if (!employee.userId) return errorResponse(res, 'Employee has no linked user account', 404);

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.updateOne(
      { _id: employee.userId },
      { 
        $set: { 
          passwordHash, 
          passwordHistory: [passwordHash], 
          passwordChangedAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null
        } 
      }
    );

    // Audit log
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'User',
      resourceId: employee.userId,
      after: { reason: 'Administrative password reset by HR' },
      req
    });

    return successResponse(res, null, 'Employee password reset successfully');
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const employee = await Employee.findOne({ userId, tenantId: req.tenantId, isDeleted: false })
      .populate('userId', 'email role isActive username')
      .populate('employment.departmentId', 'name code')
      .populate('employment.designationId', 'name code')
      .populate('employment.gradeId', 'name code')
      .populate('employment.locationId', 'name code')
      .populate('employment.reportingManagerId', 'personal.firstName personal.lastName employeeId')
      .populate('employment.secondaryManagerId', 'personal.firstName personal.lastName employeeId');

    if (!employee) {
      return errorResponse(res, 'Employee profile not found', 404);
    }

    return successResponse(res, employee, 'My profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const beforeObj = await Employee.findOne({ _id: id, tenantId: req.tenantId, isDeleted: false });
    if (!beforeObj) return errorResponse(res, 'Employee not found', 404);

    await employeeService.deleteEmployee(req.tenantId, id, req.user.userId);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'DELETE',
      resourceType: 'Employee',
      resourceId: id,
      before: beforeObj.toObject(),
      after: { ...beforeObj.toObject(), isDeleted: true, deletedAt: new Date() },
      req
    });

    return successResponse(res, null, 'Employee deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getMyProfile,
  updateEmployee,
  updateEmployeePersonal,
  updateEmployeeSensitive,
  uploadDocument,
  deleteDocument,
  confirmEmployee,
  transferEmployee,
  promoteEmployee,
  exitEmployee,
  getTimeline,
  getDirectory,
  getOrgChart,
  bulkImport,
  exportEmployees,
  resetEmployeePassword,
  deleteEmployee
};
