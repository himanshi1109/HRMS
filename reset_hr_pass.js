const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function seedAcmeCorp() {
  console.log('--- SEEDING ACME CORP DATA & USERS ---');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[PASS] Connected to MongoDB Atlas.');

    const Tenant = require('./src/modules/tenant/tenant.model');
    const User = require('./src/modules/auth/auth.model');
    const Employee = require('./src/modules/employee/employee.model');
    const Department = require('./src/modules/organization/models/department.model');
    const Designation = require('./src/modules/organization/models/designation.model');
    const WorkflowConfig = require('./src/modules/workflow/workflowConfig.model');
    const LeaveType = require('./src/modules/leave/leaveType.model');
    const LeavePolicy = require('./src/modules/leave/leavePolicy.model');
    const LeaveBalance = require('./src/modules/leave/leaveBalance.model');
    const NotificationTemplate = require('./src/modules/notification/notificationTemplate.model');

    // 1. Create/Fetch Acme Corp Tenant
    let tenant = await Tenant.findOne({ slug: 'acme-corp' });
    if (!tenant) {
      tenant = new Tenant({
        name: 'Acme Corporation',
        slug: 'acme-corp',
        domain: 'acme.com',
        isActive: true
      });
      await tenant.save();
      console.log('[PASS] Created acme-corp tenant.');
    } else {
      tenant.isActive = true;
      await tenant.save();
      console.log('[INFO] Found acme-corp tenant.');
    }
    const tenantId = tenant._id;

    // Helper to find or create department
    const getDept = async (name, code) => {
      let dept = await Department.findOne({ tenantId, $or: [{ name }, { code }] });
      if (!dept) {
        dept = new Department({ tenantId, name, code });
        await dept.save();
      }
      return dept;
    };

    // Helper to find or create designation
    const getDesig = async (name, code) => {
      let desig = await Designation.findOne({ tenantId, $or: [{ name }, { code }] });
      if (!desig) {
        desig = new Designation({ tenantId, name, code });
        await desig.save();
      }
      return desig;
    };

    // 2. Create Departments & Designations
    const hrDept = await getDept('Human Resources', 'HR');
    const engDept = await getDept('Engineering', 'ENG');
    const mgmtDept = await getDept('Management', 'MGMT');

    const hrDesig = await getDesig('HR Admin', 'HRADM');
    const devDesig = await getDesig('Software Engineer', 'SWE');
    const ceoDesig = await getDesig('CEO', 'CEO');

    // 3. Setup Users & Linked Employees
    const accounts = [
      {
        email: 'hr@acme.com',
        username: 'hr',
        password: 'Admin@1234',
        role: 'HR_ADMIN',
        personal: { firstName: 'HR', lastName: 'Admin', gender: 'MALE' },
        employment: { departmentId: hrDept._id, designationId: hrDesig._id }
      },
      {
        email: 'ceo@acme.com',
        username: 'ceo',
        password: 'CEO@1234',
        role: 'LEADERSHIP',
        personal: { firstName: 'CEO', lastName: 'Leader', gender: 'FEMALE' },
        employment: { departmentId: mgmtDept._id, designationId: ceoDesig._id }
      },
      {
        email: 'himanshi.khatri@acme.com',
        username: 'himanshi',
        password: 'Employee@1234',
        role: 'EMPLOYEE',
        personal: { firstName: 'Himanshi', lastName: 'Khatri', gender: 'FEMALE' },
        employment: { departmentId: engDept._id, designationId: devDesig._id }
      }
    ];

    for (const acc of accounts) {
      let user = await User.findOne({ email: acc.email, tenantId });
      let emp = await Employee.findOne({ 'contact.officialEmail': acc.email, tenantId });
      const passwordHash = await bcrypt.hash(acc.password, 12);

      if (!emp) {
        emp = new Employee({
          tenantId,
          employeeId: acc.role === 'HR_ADMIN' ? 'EMP-HR-00001' : (acc.role === 'LEADERSHIP' ? 'EMP-CEO-00001' : 'EMP-DEV-00001'),
          status: 'ACTIVE',
          personal: acc.personal,
          contact: { officialEmail: acc.email },
          employment: {
            ...acc.employment,
            dateOfJoining: new Date()
          }
        });
        await emp.save();
      } else {
        emp.isDeleted = false;
        emp.status = 'ACTIVE';
        emp.employment.departmentId = acc.employment.departmentId;
        emp.employment.designationId = acc.employment.designationId;
        await emp.save();
      }

      if (!user) {
        user = new User({
          tenantId,
          employeeId: emp._id,
          email: acc.email,
          username: acc.username,
          passwordHash,
          role: acc.role,
          isActive: true,
          passwordHistory: [passwordHash],
          passwordChangedAt: new Date()
        });
        await user.save();
      } else {
        user.employeeId = emp._id;
        user.passwordHash = passwordHash;
        user.role = acc.role;
        user.isActive = true;
        user.isDeleted = false;
        await user.save();
      }

      emp.userId = user._id;
      await emp.save();

      console.log(`[PASS] Configured account: ${acc.email} | Password: ${acc.password} | Role: ${acc.role}`);
    }

    // 4. Setup Workflow Config for LEAVE_REQUEST
    let workflowConfig = await WorkflowConfig.findOne({ tenantId, requestType: 'LEAVE_REQUEST', isDeleted: false });
    if (!workflowConfig) {
      workflowConfig = new WorkflowConfig({
        tenantId,
        requestType: 'LEAVE_REQUEST',
        levels: [
          {
            order: 1,
            approverType: 'ROLE',
            approverRole: 'LEADERSHIP'
          }
        ],
        isActive: true
      });
      await workflowConfig.save();
      console.log('[PASS] Configured LEAVE_REQUEST workflow to route to LEADERSHIP role.');
    } else {
      workflowConfig.levels = [
        {
          order: 1,
          approverType: 'ROLE',
          approverRole: 'LEADERSHIP'
        }
      ];
      workflowConfig.isActive = true;
      await workflowConfig.save();
      console.log('[PASS] Updated LEAVE_REQUEST workflow to route to LEADERSHIP role.');
    }

    // 5. Setup LeaveTypes
    const leaveTypesData = [
      { name: 'Casual Leave', code: 'CL', category: 'CASUAL' },
      { name: 'Earned Leave', code: 'EL', category: 'EARNED' },
      { name: 'Sick Leave', code: 'SL', category: 'SICK' }
    ];

    for (const lt of leaveTypesData) {
      let ltype = await LeaveType.findOne({ tenantId, code: lt.code, isDeleted: false });
      if (!ltype) {
        ltype = new LeaveType({
          tenantId,
          name: lt.name,
          code: lt.code,
          category: lt.category,
          isActive: true
        });
        await ltype.save();
      }

      // Seed Leave Policy
      let lpolicy = await LeavePolicy.findOne({ tenantId, leaveTypeId: ltype._id, isDeleted: false });
      if (!lpolicy) {
        lpolicy = new LeavePolicy({
          tenantId,
          leaveTypeId: ltype._id,
          name: `${lt.name} Policy`,
          accrualType: 'UPFRONT',
          accrualAmount: 12,
          maxBalance: 30,
          isActive: true
        });
        await lpolicy.save();
      }

      // Seed Leave Balances for all 3 users
      const hrEmp = await Employee.findOne({ 'contact.officialEmail': 'hr@acme.com', tenantId });
      const empUser = await Employee.findOne({ 'contact.officialEmail': 'himanshi.khatri@acme.com', tenantId });
      
      const emps = [hrEmp, empUser].filter(Boolean);
      for (const e of emps) {
        let lbal = await LeaveBalance.findOne({ tenantId, employeeId: e._id, leaveTypeId: ltype._id });
        if (!lbal) {
          lbal = new LeaveBalance({
            tenantId,
            employeeId: e._id,
            leaveTypeId: ltype._id,
            year: 2026,
            openingBalance: 12,
            accrued: 0,
            availed: 0
          });
          await lbal.save();
        } else {
          lbal.openingBalance = 12;
          await lbal.save();
        }
      }
    }
    console.log('[PASS] Leave types, policies, and balances seeded.');

    // 6. Seed Notification Templates
    const notificationTemplatesData = [
      {
        event: 'APPROVAL_PENDING',
        channel: 'IN_APP',
        subject: 'New Approval Request: {{requestType}}',
        body: 'A new {{requestType}} is pending your approval.'
      },
      {
        event: 'APPROVAL_PENDING',
        channel: 'EMAIL',
        subject: 'New Approval Request - Action Required',
        body: '<p>Dear Approver,</p><p>A new {{requestType}} is pending your approval.</p>'
      },
      {
        event: 'LEAVE_APPROVED',
        channel: 'IN_APP',
        subject: 'Leave Request Approved',
        body: 'Your leave request has been approved.'
      },
      {
        event: 'LEAVE_REJECTED',
        channel: 'IN_APP',
        subject: 'Leave Request Rejected',
        body: 'Your leave request has been rejected.'
      }
    ];

    for (const tData of notificationTemplatesData) {
      let template = await NotificationTemplate.findOne({ tenantId, event: tData.event, channel: tData.channel, isDeleted: false });
      if (!template) {
        template = new NotificationTemplate({
          tenantId,
          ...tData,
          isActive: true
        });
        await template.save();
      }
    }
    console.log('[PASS] Notification templates seeded.');

    console.log('\n--- ACME CORP SEED COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('\n[FAIL] Seeding failed with error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedAcmeCorp();
