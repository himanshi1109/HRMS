const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');
const Tenant = require('../tenant/tenant.model');
const Employee = require('../employee/employee.model');
const auditService = require('../../audit/audit.service');
const emailService = require('../../utils/emailService');

const registerTenant = async ({ name, slug, domain, email, password }, req) => {
  // 1. Create Tenant
  const tenant = new Tenant({
    name,
    slug: slug.toLowerCase(),
    domain
  });
  await tenant.save();

  // 2. Hash Password (saltRounds: 12)
  const passwordHash = await bcrypt.hash(password, 12);

  // 3. Create associated Employee record
  const employee = new Employee({
    tenantId: tenant._id,
    employeeId: 'EMP-HR-00001',
    status: 'ACTIVE',
    personal: {
      firstName: 'HR',
      lastName: 'Admin'
    },
    contact: {
      officialEmail: email.toLowerCase()
    },
    employment: {
      designationName: 'HR Admin',
      departmentName: 'Human Resources',
      dateOfJoining: new Date()
    }
  });
  await employee.save();

  // 4. Create HR_ADMIN User
  const user = new User({
    tenantId: tenant._id,
    employeeId: employee._id,
    email: email.toLowerCase(),
    username: email.toLowerCase().split('@')[0],
    passwordHash,
    role: 'HR_ADMIN',
    isActive: true,
    passwordHistory: [passwordHash],
    passwordChangedAt: new Date()
  });
  await user.save();

  employee.userId = user._id;
  await employee.save();

  // Send Welcome Email & Reset Password Prompt
  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

  user.passwordResetToken = hashedResetToken;
  user.passwordResetExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const loginUrl = `${frontendUrl}/login`;
  const resetUrl = `${frontendUrl}/reset-password?token=${rawResetToken}`;

  await emailService.sendEmail({
    to: user.email,
    subject: `Welcome to ${name} - Your Workly HRMS Account Details`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to ${name}!</h2>
        <p>Dear Admin,</p>
        <p>Your workspace has been successfully registered and your account is active.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; margin-bottom: 10px; color: #1f2937;">Your Credentials:</h4>
          <p style="margin: 5px 0;"><strong>Role:</strong> Administrator / Manager</p>
          <p style="margin: 5px 0;"><strong>Official Email/Username:</strong> ${email.toLowerCase()}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> Your chosen password</p>
        </div>

        <p style="color: #e11d48; font-weight: bold;">CRITICAL PRIVACY STEP:</p>
        <p>For security and privacy compliance, you can reset or update your password via the link below:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;" target="_blank">Reset Your Password Now</a>
        </div>

        <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
          Note: This secure reset link is valid for 48 hours. You can access the system at <a href="${loginUrl}">${loginUrl}</a>.
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Generated automatically by Workly HRMS Notification System.</p>
      </div>
    `,
    tenantId: tenant._id
  });

  // 4. Log to Audit
  await auditService.log({
    tenantId: tenant._id,
    actorId: user._id,
    actorRole: 'HR_ADMIN',
    action: 'CREATE',
    resourceType: 'Tenant',
    resourceId: tenant._id,
    after: { tenant: tenant.name, adminUser: email },
    req
  });

  return { tenant, user };
};

const login = async ({ email, password, tenantSlug }, req) => {
  let user;
  let tenant;

  if (!tenantSlug || tenantSlug.trim() === '') {
    // 1. Resolve tenant by looking up user globally by email or username
    user = await User.findOne({
      isDeleted: false,
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    });
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    tenant = await Tenant.findOne({ _id: user.tenantId, isActive: true, isDeleted: false });
    if (!tenant) {
      throw { statusCode: 400, message: 'Associated tenant is inactive or deleted' };
    }
  } else {
    // 1. Find Tenant by slug
    tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase(), isActive: true, isDeleted: false });
    if (!tenant) {
      throw { statusCode: 400, message: 'Invalid tenant slug or tenant is inactive' };
    }

    // 2. Find User by email or username within this tenant
    user = await User.findOne({
      tenantId: tenant._id,
      isDeleted: false,
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    });
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }
  }

  if (!user.isActive) {
    throw { statusCode: 403, message: 'Your account has been deactivated' };
  }

  // 3. Check Account Lock
  const now = new Date();
  if (user.lockedUntil && user.lockedUntil > now) {
    const remainingMs = user.lockedUntil - now;
    const remainingSecs = Math.ceil(remainingMs / 1000);
    if (remainingSecs > 60) {
      const remainingMins = Math.ceil(remainingSecs / 60);
      throw {
        statusCode: 423,
        message: `Account is temporarily locked. Try again after ${remainingMins} minutes.`
      };
    } else {
      throw {
        statusCode: 423,
        message: `Account is temporarily locked. Try again after ${remainingSecs} seconds.`
      };
    }
  }

  // 4. Compare Password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    // Increment failed attempts
    user.failedLoginAttempts += 1;
    const policy = tenant.authPolicy || { maxFailedAttempts: 5, lockoutDurationMinutes: 15 };
    
    if (user.failedLoginAttempts >= policy.maxFailedAttempts) {
      user.lockedUntil = new Date(now.getTime() + policy.lockoutDurationMinutes * 60 * 1000);
      await user.save();
      
      await auditService.log({
        tenantId: tenant._id,
        actorId: user._id,
        actorRole: user.role,
        action: 'LOGIN_FAILED',
        resourceType: 'User',
        resourceId: user._id,
        after: { reason: 'Account locked due to consecutive failures' },
        req
      });
      
      throw {
        statusCode: 423,
        message: `Account locked. Try again in ${policy.lockoutDurationMinutes} minutes.`
      };
    }

    await user.save();

    await auditService.log({
      tenantId: tenant._id,
      actorId: user._id,
      actorRole: user.role,
      action: 'LOGIN_FAILED',
      resourceType: 'User',
      resourceId: user._id,
      after: { reason: 'Incorrect password' },
      req
    });

    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  // 5. Password Success Login Reset
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = now;

  // Dynamic self-healing: if the user does not have a linked employeeId, create/link one now
  if (!user.employeeId) {
    let employee = await Employee.findOne({ 'contact.officialEmail': user.email, tenantId: tenant._id });
    if (!employee) {
      employee = new Employee({
        tenantId: tenant._id,
        employeeId: 'EMP-HR-00001',
        status: 'ACTIVE',
        personal: {
          firstName: 'HR',
          lastName: 'Admin'
        },
        contact: {
          officialEmail: user.email
        },
        employment: {
          designationName: 'HR Admin',
          departmentName: 'Human Resources',
          dateOfJoining: new Date()
        }
      });
      await employee.save();
    }
    user.employeeId = employee._id;
    await user.save();
    employee.userId = user._id;
    await employee.save();
  }

  // 6. Generate Tokens
  const accessToken = jwt.sign(
    {
      userId: user._id,
      tenantId: tenant._id,
      role: user.role,
      email: user.email,
      employeeId: user.employeeId
    },
    process.env.JWT_SECRET || 'supersecretkeychangeinproduction',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const rawRefreshToken = crypto.randomBytes(64).toString('hex');
  const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, 10);
  
  user.refreshToken = hashedRefreshToken;
  user.refreshTokenExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 Days
  await user.save();

  // 7. Audit log
  await auditService.log({
    tenantId: tenant._id,
    actorId: user._id,
    actorRole: user.role,
    action: 'LOGIN',
    resourceType: 'User',
    resourceId: user._id,
    req
  });

  const employeeObj = await Employee.findOne({ _id: user.employeeId, isDeleted: false });
  const employeeName = employeeObj ? `${employeeObj.personal?.firstName || ''} ${employeeObj.personal?.lastName || ''}`.trim() : null;

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      name: employeeName,
      companyName: tenant.name
    }
  };
};

const refresh = async ({ refreshToken, oldAccessToken }) => {
  // 1. Decode old token without verifying expiry
  let decoded;
  try {
    decoded = jwt.decode(oldAccessToken);
    if (!decoded || !decoded.userId) {
      throw new Error();
    }
  } catch (err) {
    throw { statusCode: 400, message: 'Invalid access token format' };
  }

  // 2. Find User
  const user = await User.findOne({ _id: decoded.userId, isDeleted: false });
  if (!user || !user.refreshToken || !user.refreshTokenExpiresAt) {
    throw { statusCode: 401, message: 'Unauthorized session' };
  }

  // 3. Check Expiry
  const now = new Date();
  if (user.refreshTokenExpiresAt < now) {
    throw { statusCode: 401, message: 'Session expired, please login again' };
  }

  // 4. Compare Refresh Token
  const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid refresh session' };
  }

  // 5. Issue New Access Token
  const newAccessToken = jwt.sign(
    {
      userId: user._id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      employeeId: user.employeeId
    },
    process.env.JWT_SECRET || 'supersecretkeychangeinproduction',
    { expiresIn: '15m' }
  );

  return { accessToken: newAccessToken };
};

const logout = async (userId, tenantId, role, req) => {
  const user = await User.findOne({ _id: userId, tenantId, isDeleted: false });
  if (user) {
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;
    await user.save();
  }

  await auditService.log({
    tenantId,
    actorId: userId,
    actorRole: role,
    action: 'LOGOUT',
    resourceType: 'User',
    resourceId: userId,
    req
  });
};

const forgotPassword = async ({ email, tenantSlug }, req) => {
  // Standard return so we do not leak email presence
  const successMsg = 'If the email exists in our records, a password reset link has been sent.';

  let tenant;
  if (tenantSlug) {
    tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase(), isActive: true, isDeleted: false });
  } else {
    // Resolve tenant by looking up user globally
    const userLookup = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (userLookup) {
      tenant = await Tenant.findOne({ _id: userLookup.tenantId, isActive: true, isDeleted: false });
    }
  }

  if (!tenant) return { message: successMsg };

  const user = await User.findOne({ email: email.toLowerCase(), tenantId: tenant._id, isDeleted: false });
  if (!user) return { message: successMsg };

  // Generate Reset Token
  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

  user.passwordResetToken = hashedResetToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Send Email
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawResetToken}`;
  await emailService.sendEmail({
    to: user.email,
    subject: 'HRMS Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to set a new password:</p>
           <a href="${resetUrl}" target="_blank">${resetUrl}</a>
           <p>This link will expire in 1 hour.</p>`,
    tenantId: tenant._id
  });

  return { message: successMsg };
};

const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
    isDeleted: false
  });

  if (!user) {
    throw { statusCode: 400, message: 'Invalid or expired password reset token' };
  }

  const tenant = await Tenant.findById(user.tenantId);
  const minLength = tenant?.authPolicy?.passwordMinLength || 8;

  if (newPassword.length < minLength) {
    throw { statusCode: 400, message: `Password must be at least ${minLength} characters long` };
  }

  // Check Password History
  for (const histHash of user.passwordHistory || []) {
    const isMatched = await bcrypt.compare(newPassword, histHash);
    if (isMatched) {
      throw { statusCode: 400, message: 'New password cannot be one of your last 5 passwords' };
    }
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  
  user.passwordHash = newHash;
  user.passwordChangedAt = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Track history
  if (!user.passwordHistory) user.passwordHistory = [];
  user.passwordHistory.push(newHash);
  if (user.passwordHistory.length > 5) {
    user.passwordHistory.shift();
  }

  await user.save();

  await auditService.log({
    tenantId: user.tenantId,
    actorId: user._id,
    actorRole: user.role,
    action: 'UPDATE',
    resourceType: 'User',
    resourceId: user._id,
    after: { action: 'Password reset' }
  });
};

const changePassword = async (userId, tenantId, role, { currentPassword, newPassword }) => {
  const user = await User.findOne({ _id: userId, tenantId, isDeleted: false });
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw { statusCode: 400, message: 'Incorrect current password' };
  }

  const tenant = await Tenant.findById(tenantId);
  const minLength = tenant?.authPolicy?.passwordMinLength || 8;

  if (newPassword.length < minLength) {
    throw { statusCode: 400, message: `Password must be at least ${minLength} characters long` };
  }

  // Check history
  for (const histHash of user.passwordHistory || []) {
    const isMatched = await bcrypt.compare(newPassword, histHash);
    if (isMatched) {
      throw { statusCode: 400, message: 'New password cannot be one of your last 5 passwords' };
    }
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = newHash;
  user.passwordChangedAt = new Date();

  if (!user.passwordHistory) user.passwordHistory = [];
  user.passwordHistory.push(newHash);
  if (user.passwordHistory.length > 5) {
    user.passwordHistory.shift();
  }

  await user.save();

  await auditService.log({
    tenantId,
    actorId: userId,
    actorRole: role,
    action: 'UPDATE',
    resourceType: 'User',
    resourceId: userId,
    after: { action: 'Password changed' }
  });
};

const setupCompany = async (data, req) => {
  const {
    companyName,
    industryType,
    companyLogo,
    fullName,
    email,
    mobileNumber,
    designation,
    password,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    annualLeaveDays,
    sickLeaveDays,
    casualLeaveDays,
    workDays,
    shiftStartTime,
    shiftEndTime,
    weeklyOffDays,
    departments,
    designations,
    senderEmail,
    senderPassword
  } = data;

  // 1. Create Tenant
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  const existingTenant = await Tenant.findOne({ slug });
  if (existingTenant) {
    throw { statusCode: 400, message: `A company with name '${companyName}' or slug '${slug}' is already registered.` };
  }

  const tenant = new Tenant({
    name: companyName,
    slug,
    logo: companyLogo || '',
    domain: `${slug}.com`,
    emailConfig: {
      senderEmail: senderEmail || '',
      senderPassword: senderPassword || ''
    }
  });
  await tenant.save();

  // 2. Create Organization
  const Organization = require('../organization/models/organization.model');
  const organization = new Organization({
    tenantId: tenant._id,
    name: companyName,
    logo: companyLogo || '',
    industry: industryType,
    address: {
      street: `${addressLine1} ${addressLine2 || ''}`.trim(),
      city,
      state,
      country
    }
  });
  await organization.save();

  // Create Custom Departments
  const Department = require('../organization/models/department.model');
  const deptsToCreate = Array.isArray(departments)
    ? departments
    : (departments ? String(departments).split(',').map(d => d.trim()).filter(Boolean) : []);

  // Ensure "Human Resources" or "HR" is present
  const hrDeptName = deptsToCreate.find(d => {
    const l = d.toLowerCase();
    return l === 'hr' || l === 'human resources' || l.includes('human resource');
  }) || 'Human Resources';

  if (!deptsToCreate.some(d => d.toLowerCase() === hrDeptName.toLowerCase())) {
    deptsToCreate.push(hrDeptName);
  }

  const deptMap = {}; // name -> _id
  for (const deptName of deptsToCreate) {
    const deptCode = deptName.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '').slice(0, 10) || 'DEPT';
    let uniqueCode = deptCode;
    let counter = 1;
    while (await Department.findOne({ tenantId: tenant._id, code: uniqueCode })) {
      uniqueCode = `${deptCode}${counter}`;
      counter++;
    }
    const newDept = new Department({
      tenantId: tenant._id,
      name: deptName,
      code: uniqueCode,
      isActive: true
    });
    await newDept.save();
    deptMap[deptName.toLowerCase()] = newDept._id;
  }

  // Create Custom Designations
  const Designation = require('../organization/models/designation.model');
  const desigsToCreate = Array.isArray(designations)
    ? designations
    : (designations ? String(designations).split(',').map(d => d.trim()).filter(Boolean) : []);

  // Ensure initial HR designation is present
  const hrDesigName = designation || 'HR Manager';
  if (!desigsToCreate.some(d => d.toLowerCase() === hrDesigName.toLowerCase())) {
    desigsToCreate.push(hrDesigName);
  }

  const desigMap = {}; // name -> _id
  for (const desigName of desigsToCreate) {
    const desigCode = desigName.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '').slice(0, 10) || 'DSG';
    let uniqueCode = desigCode;
    let counter = 1;
    while (await Designation.findOne({ tenantId: tenant._id, code: uniqueCode })) {
      uniqueCode = `${desigCode}${counter}`;
      counter++;
    }
    const newDesig = new Designation({
      tenantId: tenant._id,
      name: desigName,
      code: uniqueCode,
      isActive: true
    });
    await newDesig.save();
    desigMap[desigName.toLowerCase()] = newDesig._id;
  }

  // 3. Hash Password
  const passwordHash = await bcrypt.hash(password, 12);

  // 4. Create HR Employee
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || 'Admin';

  const hrDeptId = deptMap[hrDeptName.toLowerCase()];
  const hrDesigId = desigMap[hrDesigName.toLowerCase()];

  const employee = new Employee({
    tenantId: tenant._id,
    employeeId: 'EMP-HR-00001',
    status: 'ACTIVE',
    personal: {
      firstName,
      lastName
    },
    contact: {
      officialEmail: email.toLowerCase(),
      officialMobile: mobileNumber || ''
    },
    employment: {
      departmentId: hrDeptId,
      designationId: hrDesigId,
      dateOfJoining: new Date(),
      salary: 1200000
    }
  });
  await employee.save();

  // 5. Create HR User
  const user = new User({
    tenantId: tenant._id,
    employeeId: employee._id,
    email: email.toLowerCase(),
    username: email.toLowerCase().split('@')[0],
    passwordHash,
    role: 'HR_ADMIN',
    isActive: true,
    passwordHistory: [passwordHash],
    passwordChangedAt: new Date()
  });
  await user.save();

  // Associate creator user ID with created entities
  await Department.updateMany({ tenantId: tenant._id }, { createdBy: user._id });
  await Designation.updateMany({ tenantId: tenant._id }, { createdBy: user._id });

  employee.userId = user._id;
  await employee.save();

  // Send Welcome Email & Reset Password Prompt
  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

  user.passwordResetToken = hashedResetToken;
  user.passwordResetExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const loginUrl = `${frontendUrl}/login`;
  const resetUrl = `${frontendUrl}/reset-password?token=${rawResetToken}`;

  await emailService.sendEmail({
    to: user.email,
    subject: `Welcome to ${companyName} - Your Workly HRMS Account Details`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Welcome to ${companyName}!</h2>
        <p>Dear ${fullName || 'Manager'},</p>
        <p>Your workspace has been successfully registered and your account is active.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-top: 0; margin-bottom: 10px; color: #1f2937;">Your Credentials:</h4>
          <p style="margin: 5px 0;"><strong>Role:</strong> Administrator / Manager</p>
          <p style="margin: 5px 0;"><strong>Official Email/Username:</strong> ${email.toLowerCase()}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> Your chosen password</p>
        </div>

        <p style="color: #e11d48; font-weight: bold;">CRITICAL PRIVACY STEP:</p>
        <p>For security and privacy compliance, you can reset or update your password via the link below:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;" target="_blank">Reset Your Password Now</a>
        </div>

        <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
          Note: This secure reset link is valid for 48 hours. You can access the system at <a href="${loginUrl}">${loginUrl}</a>.
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Generated automatically by Workly HRMS Notification System.</p>
      </div>
    `,
    tenantId: tenant._id
  });

  // 6. Create Standard Shift
  const Shift = require('../attendance/shift.model');
  let parsedOffDays = [0, 6];
  if (Array.isArray(weeklyOffDays)) {
    parsedOffDays = weeklyOffDays.map(day => {
      if (typeof day === 'number') return day;
      const dayStr = String(day).toLowerCase();
      if (dayStr.includes('sun')) return 0;
      if (dayStr.includes('mon')) return 1;
      if (dayStr.includes('tue')) return 2;
      if (dayStr.includes('wed')) return 3;
      if (dayStr.includes('thu')) return 4;
      if (dayStr.includes('fri')) return 5;
      if (dayStr.includes('sat')) return 6;
      return 0;
    });
  }
  const shift = new Shift({
    tenantId: tenant._id,
    name: 'General Shift',
    code: 'SFT-GEN',
    startTime: shiftStartTime || '09:00',
    endTime: shiftEndTime || '18:00',
    weeklyOffDays: parsedOffDays,
    createdBy: user._id
  });
  await shift.save();

  // 7. Create Leave Types & Policies & Balances
  const LeaveType = require('../leave/leaveType.model');
  const LeavePolicy = require('../leave/leavePolicy.model');
  const LeaveBalance = require('../leave/leaveBalance.model');

  const leavesToCreate = [
    { name: 'Annual Leave', code: 'AL', category: 'EARNED', days: Number(annualLeaveDays) || 12, color: '#4CAF50' },
    { name: 'Sick Leave', code: 'SL', category: 'SICK', days: Number(sickLeaveDays) || 12, color: '#f44336' },
    { name: 'Casual Leave', code: 'CL', category: 'CASUAL', days: Number(casualLeaveDays) || 12, color: '#FF9800' }
  ];

  const currentYear = new Date().getFullYear();

  for (const item of leavesToCreate) {
    const leaveType = new LeaveType({
      tenantId: tenant._id,
      name: item.name,
      code: item.code,
      category: item.category,
      color: item.color,
      isActive: true,
      createdBy: user._id
    });
    await leaveType.save();

    const leavePolicy = new LeavePolicy({
      tenantId: tenant._id,
      leaveTypeId: leaveType._id,
      name: `${item.name} General Policy`,
      accrualType: 'UPFRONT',
      accrualAmount: item.days,
      maxBalance: item.days,
      carryForwardLimit: 0,
      isActive: true,
      createdBy: user._id
    });
    await leavePolicy.save();

    const leaveBalance = new LeaveBalance({
      tenantId: tenant._id,
      employeeId: employee._id,
      leaveTypeId: leaveType._id,
      year: currentYear,
      openingBalance: item.days,
      accrued: 0,
      availed: 0,
      lopDays: 0,
      encashed: 0,
      carriedForward: 0,
      createdBy: user._id
    });
    await leaveBalance.save();
  }

  await auditService.log({
    tenantId: tenant._id,
    actorId: user._id,
    actorRole: 'HR_ADMIN',
    action: 'CREATE',
    resourceType: 'Tenant',
    resourceId: tenant._id,
    after: { tenant: tenant.name, adminUser: email },
    req
  });

  return { tenant, user };
};

module.exports = {
  registerTenant,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  setupCompany
};
