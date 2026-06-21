const mongoose = require('mongoose');
const Department = require('../organization/models/department.model');
const Designation = require('../organization/models/designation.model');
const Grade = require('../organization/models/grade.model');
const Location = require('../organization/models/location.model');
const Employee = require('./employee.model');
const User = require('../auth/auth.model');
const Sequence = require('./sequence.model');
const AuditLog = require('../../audit/audit.model');
const bcrypt = require('bcryptjs');
const emailService = require('../../utils/emailService');

// Circular reporting hierarchy detector
const checkCircularHierarchy = async (tenantId, employeeId, newManagerId) => {
  if (!newManagerId) return;
  if (employeeId && employeeId.toString() === newManagerId.toString()) {
    throw new Error('Circular reporting hierarchy detected: Employee cannot report to themselves.');
  }

  let currentId = newManagerId;
  const visited = new Set();
  while (currentId) {
    if (employeeId && currentId.toString() === employeeId.toString()) {
      throw new Error('Circular reporting hierarchy detected.');
    }
    if (visited.has(currentId.toString())) break;
    visited.add(currentId.toString());
    const manager = await Employee.findOne({ _id: currentId, tenantId, isDeleted: false });
    currentId = manager?.employment?.reportingManagerId;
  }
};

const createEmployee = async (tenantId, employeeData, createdByUserId) => {
  // If the request body is flat, convert it to the nested structure!
  if (employeeData.name || employeeData.email) {
    const nameParts = (employeeData.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || 'Unknown';
    
    employeeData.personal = {
      firstName,
      lastName,
      dateOfBirth: employeeData.dateOfBirth,
      gender: employeeData.gender?.toUpperCase() === 'MALE' ? 'MALE' : (employeeData.gender?.toUpperCase() === 'FEMALE' ? 'FEMALE' : (employeeData.gender ? 'OTHER' : undefined)),
      address: employeeData.address
    };
    employeeData.contact = {
      officialEmail: employeeData.email,
      personalPhone: employeeData.phone
    };
    employeeData.employment = {
      departmentId: employeeData.department || undefined,
      locationId: employeeData.location || undefined,
      dateOfJoining: employeeData.dateOfJoining || new Date(),
      employmentType: employeeData.employmentType?.toUpperCase() === 'FULL-TIME' ? 'FULL_TIME' : (employeeData.employmentType?.toUpperCase() === 'PART-TIME' ? 'PART_TIME' : (employeeData.employmentType ? employeeData.employmentType.toUpperCase() : 'FULL_TIME')),
      reportingManagerId: employeeData.reportingManager || undefined,
      shiftId: employeeData.shiftId || undefined,
      salary: Number(employeeData.salary) || 0
    };
  }

  const userEmail = (employeeData.email || employeeData.contact?.officialEmail || employeeData.contact?.personalEmail || '').toLowerCase();
  if (userEmail) {
    const existingUser = await User.findOne({ tenantId, email: userEmail, isDeleted: false });
    if (existingUser) {
      throw { statusCode: 400, message: `An account with email '${userEmail}' is already registered in this company.` };
    }
  }

  let designationId = employeeData.designation || (employeeData.employment && employeeData.employment.designationId);
  if (designationId && typeof designationId === 'string' && !mongoose.Types.ObjectId.isValid(designationId)) {
    const designationName = designationId.trim();
    const designationCode = designationName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'DSG';
    
    let desig = await Designation.findOne({ tenantId, name: designationName, isDeleted: false });
    if (!desig) {
      desig = new Designation({
        tenantId,
        name: designationName,
        code: designationCode,
        createdBy: createdByUserId
      });
      await desig.save();
    }
    if (employeeData.employment) {
      employeeData.employment.designationId = desig._id;
    } else {
      employeeData.employment = { designationId: desig._id };
    }
  }

  const password = employeeData.password || (employeeData.auth && employeeData.auth.password);
  const username = employeeData.username || (employeeData.auth && employeeData.auth.username);
  const restData = { ...employeeData };
  delete restData.password;
  delete restData.username;

  // 1. Generate unique employeeId
  const currentYear = new Date().getFullYear();
  const seq = await Sequence.findOneAndUpdate(
    { tenantId, name: 'employee' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const employeeId = `EMP-${currentYear}-${String(seq.seq).padStart(5, '0')}`;

  // 2. Validate Reporting Manager Hierarchy if provided
  if (restData.employment?.reportingManagerId) {
    await checkCircularHierarchy(tenantId, null, restData.employment.reportingManagerId);
  }

  // 3. Create Employee
  const doj = restData.employment?.dateOfJoining ? new Date(restData.employment.dateOfJoining) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  doj.setHours(0, 0, 0, 0);
  
  let initialStatus = 'ACTIVE';
  if (doj > today) {
    initialStatus = 'ONBOARDING';
  }

  const employee = new Employee({
    ...restData,
    status: initialStatus,
    tenantId,
    employeeId,
    createdBy: createdByUserId
  });
  await employee.save();

  // 4. Create associated User account
  
  // Custom username or generated default username
  let finalUsername = (username || '').trim().toLowerCase();
  if (!finalUsername) {
    const baseUsername = `${restData.personal?.firstName || 'emp'}.${restData.personal?.lastName || 'user'}`.toLowerCase().replace(/[^a-z0-9.]/g, '');
    finalUsername = baseUsername;
    
    // Check for username collisions
    let count = 0;
    let usernameExists = await User.findOne({ tenantId, username: finalUsername });
    while (usernameExists) {
      count++;
      finalUsername = `${baseUsername}${count}`;
      usernameExists = await User.findOne({ tenantId, username: finalUsername });
    }
  }

  const finalPassword = password || Math.random().toString(36).substring(2, 10);
  const passwordHash = await bcrypt.hash(finalPassword, 12);
  
  const user = new User({
    tenantId,
    employeeId: employee._id,
    email: userEmail,
    username: finalUsername,
    passwordHash,
    role: restData.role || employeeData.role || (employeeData.auth && employeeData.auth.role) || 'EMPLOYEE',
    passwordHistory: [passwordHash],
    passwordChangedAt: new Date(),
    createdBy: createdByUserId
  });
  await user.save();

  // Update Employee with its userId
  employee.userId = user._id;
  await employee.save();

  // 5. Send Welcome Email & Reset Password Prompt
  const crypto = require('crypto');
  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

  user.passwordResetToken = hashedResetToken;
  user.passwordResetExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const loginUrl = `${frontendUrl}/login`;
  const resetUrl = `${frontendUrl}/reset-password?token=${rawResetToken}`;

  const Organization = require('../organization/models/organization.model');
  const org = await Organization.findOne({ tenantId, isDeleted: false }).lean();
  const companyName = org?.name || 'Workly';

  await emailService.sendEmail({
    to: user.email,
    subject: `Welcome to ${companyName} - Your Workly HRMS Account Details`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to ${companyName}!</h2>
        <p>Dear ${restData.personal?.firstName || 'Employee'},</p>
        <p>Your official workspace profile has been created successfully in the Workly HRMS platform by your HR team.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; margin-bottom: 10px; color: #1f2937;">Your Credentials:</h4>
          <p style="margin: 5px 0;"><strong>Employee ID:</strong> ${employeeId}</p>
          <p style="margin: 5px 0;"><strong>Login Username:</strong> ${finalUsername}</p>
          <p style="margin: 5px 0;"><strong>Official Email:</strong> ${userEmail}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${finalPassword}</code></p>
        </div>

        <p style="color: #e11d48; font-weight: bold;">CRITICAL PRIVACY STEP:</p>
        <p>For security and privacy compliance, you are required to reset your password before logging into your workspace for the first time.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;" target="_blank">Reset Your Password Now</a>
        </div>

        <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
          Note: This secure reset link is valid for 48 hours. After resetting your password, you can access the system at <a href="${loginUrl}">${loginUrl}</a>.
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Generated automatically by Workly HRMS Notification System.</p>
      </div>
    `,
    tenantId
  });

  const result = employee.toObject();
  result.tempPassword = finalPassword;
  result.username = finalUsername;
  return result;
};

const getEmployees = async (tenantId, filters, { skip, limit }, userRole, userEmployeeId) => {
  const query = { tenantId, isDeleted: false };

  if (filters.reportingManagerId) {
    query['employment.reportingManagerId'] = filters.reportingManagerId;
  }

  if (filters.search) {
    query.$or = [
      { 'personal.firstName': { $regex: filters.search, $options: 'i' } },
      { 'personal.lastName': { $regex: filters.search, $options: 'i' } },
      { employeeId: { $regex: filters.search, $options: 'i' } }
    ];
  }

  if (filters.departmentId) query['employment.departmentId'] = filters.departmentId;
  if (filters.locationId) query['employment.locationId'] = filters.locationId;
  if (filters.designationId) query['employment.designationId'] = filters.designationId;
  if (filters.status) {
    query.status = filters.status;
  } else {
    query.status = { $ne: 'EXITED' };
  }

  if (filters.role) {
    const users = await User.find({ tenantId, role: filters.role, isDeleted: false }).select('employeeId');
    const employeeIds = users.map(u => u.employeeId).filter(Boolean);
    query._id = { $in: employeeIds };
  }

  const items = await Employee.find(query)
    .populate('userId', 'email role isActive username')
    .populate('employment.departmentId', 'name code')
    .populate('employment.designationId', 'name code')
    .populate('employment.gradeId', 'name code')
    .populate('employment.locationId', 'name code')
    .populate('employment.reportingManagerId', 'personal.firstName personal.lastName employeeId')
    .skip(skip)
    .limit(limit);

  const total = await Employee.countDocuments(query);
  return { items, total };
};

const getEmployeeById = async (tenantId, id) => {
  return await Employee.findOne({ _id: id, tenantId, isDeleted: false })
    .populate('userId', 'email role isActive username')
    .populate('employment.departmentId', 'name code')
    .populate('employment.designationId', 'name code')
    .populate('employment.gradeId', 'name code')
    .populate('employment.locationId', 'name code')
    .populate('employment.reportingManagerId', 'personal.firstName personal.lastName employeeId')
    .populate('employment.secondaryManagerId', 'personal.firstName personal.lastName employeeId');
};

const updateEmployee = async (tenantId, id, data, userId) => {
  // Protect CEO (LEADERSHIP role) from department and designation updates
  const targetEmployee = await Employee.findOne({ _id: id, tenantId, isDeleted: false }).populate('userId');
  if (targetEmployee && targetEmployee.userId?.role === 'LEADERSHIP') {
    if (data.employment) {
      delete data.employment.departmentId;
      delete data.employment.designationId;
      delete data.employment.departmentName;
      delete data.employment.designationName;
    }
    delete data.department;
    delete data.designation;
  }

  // If the request body is flat, convert it to the nested structure!
  if (data.name || data.email || data.phone || data.dateOfBirth || data.gender || data.address || data.department || data.designation || data.location || data.dateOfJoining || data.employmentType || data.reportingManager || data.salary !== undefined) {
    const nameParts = (data.name || '').trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    const personal = {};
    if (data.name) {
      personal.firstName = firstName;
      personal.lastName = lastName;
    }
    if (data.dateOfBirth) personal.dateOfBirth = data.dateOfBirth;
    if (data.gender) personal.gender = data.gender.toUpperCase() === 'MALE' ? 'MALE' : (data.gender.toUpperCase() === 'FEMALE' ? 'FEMALE' : 'OTHER');
    if (data.address) personal.address = data.address;

    const contact = {};
    if (data.email) contact.officialEmail = data.email;
    if (data.phone) contact.personalPhone = data.phone;

    const employment = {};
    if (data.department) employment.departmentId = data.department;
    if (data.designation) employment.designationId = data.designation;
    if (data.location) employment.locationId = data.location;
    if (data.dateOfJoining) employment.dateOfJoining = data.dateOfJoining;
    if (data.employmentType) employment.employmentType = data.employmentType.toUpperCase() === 'FULL-TIME' ? 'FULL_TIME' : (data.employmentType.toUpperCase() === 'PART-TIME' ? 'PART_TIME' : data.employmentType.toUpperCase());
    if (data.reportingManager) employment.reportingManagerId = data.reportingManager;
    if (data.shift) employment.shiftId = data.shift; // shift name or ID
    if (data.salary !== undefined) employment.salary = Number(data.salary);

    // Merge into data
    if (Object.keys(personal).length > 0) data.personal = { ...(data.personal || {}), ...personal };
    if (Object.keys(contact).length > 0) data.contact = { ...(data.contact || {}), ...contact };
    if (Object.keys(employment).length > 0) data.employment = { ...(data.employment || {}), ...employment };
  }

  let designationId = data.designation || (data.employment && data.employment.designationId);
  if (designationId && typeof designationId === 'string' && !mongoose.Types.ObjectId.isValid(designationId)) {
    const designationName = designationId.trim();
    const designationCode = designationName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'DSG';
    
    let desig = await Designation.findOne({ tenantId, name: designationName, isDeleted: false });
    if (!desig) {
      desig = new Designation({
        tenantId,
        name: designationName,
        code: designationCode,
        createdBy: userId
      });
      await desig.save();
    }
    if (data.employment) {
      data.employment.designationId = desig._id;
    } else {
      data.employment = { designationId: desig._id };
    }
  }

  if (data.employment?.reportingManagerId) {
    await checkCircularHierarchy(tenantId, id, data.employment.reportingManagerId);
  }

  const existingEmployee = await Employee.findOne({ _id: id, tenantId, isDeleted: false });
  if (existingEmployee && ['ONBOARDING', 'ACTIVE'].includes(existingEmployee.status)) {
    const dojDate = data.employment?.dateOfJoining ? new Date(data.employment.dateOfJoining) : (existingEmployee.employment?.dateOfJoining ? new Date(existingEmployee.employment.dateOfJoining) : null);
    if (dojDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dojDate.setHours(0, 0, 0, 0);
      if (dojDate > today) {
        data.status = 'ONBOARDING';
      } else {
        data.status = 'ACTIVE';
      }
    }
  }

  // Handle password and role updates on User model
  if (data.password || data.role) {
    const employee = existingEmployee;
    if (employee && employee.userId) {
      const updateFields = {};
      if (data.password) {
        const passwordHash = await bcrypt.hash(data.password, 12);
        updateFields.passwordHash = passwordHash;
        updateFields.passwordHistory = [passwordHash];
        updateFields.passwordChangedAt = new Date();
        updateFields.failedLoginAttempts = 0;
        updateFields.lockedUntil = null;
      }
      if (data.role) {
        updateFields.role = data.role;
      }
      await User.updateOne({ _id: employee.userId }, { $set: updateFields });
    }
  }

  const updatePayload = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'personal' || key === 'contact' || key === 'employment') {
      if (value && typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value)) {
          updatePayload[`${key}.${subKey}`] = subValue;
        }
      }
    } else {
      updatePayload[key] = value;
    }
  }
  updatePayload.updatedBy = userId;

  return await Employee.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { $set: updatePayload },
    { new: true }
  );
};

const handleSensitiveDataApproved = async (workflowRequest) => {
  const { tenantId, referenceId, metadata } = workflowRequest;
  const employee = await Employee.findOne({ _id: referenceId, tenantId, isDeleted: false });
  if (employee) {
    employee.statutory = {
      ...employee.statutory,
      ...metadata.sensitiveData
    };
    employee.updatedBy = workflowRequest.requestedBy;
    await employee.save();
  }
};

const handleTransferApproved = async (transferRequestId) => {
  // Logic executed by Workflow service callback
  // Retrieve target request, fetch details, apply changes
};

const deleteEmployee = async (tenantId, id, actorId) => {
  const employee = await Employee.findOne({ _id: id, tenantId, isDeleted: false });
  if (employee) {
    if (employee.userId) {
      await User.updateOne(
        { _id: employee.userId, tenantId },
        { $set: { isDeleted: true, deletedAt: new Date(), isActive: false, updatedBy: actorId } }
      );
    }
    await Employee.updateOne(
      { _id: id, tenantId },
      { $set: { isDeleted: true, deletedAt: new Date(), status: 'TERMINATED', updatedBy: actorId } }
    );
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  checkCircularHierarchy,
  handleSensitiveDataApproved,
  handleTransferApproved,
  deleteEmployee
};
