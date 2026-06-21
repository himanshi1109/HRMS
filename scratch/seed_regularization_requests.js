const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const Tenant = require('../src/modules/tenant/tenant.model');
  const User = require('../src/modules/auth/auth.model');
  const Employee = require('../src/modules/employee/employee.model');
  const RegularizationRequest = require('../src/modules/attendance/regularizationRequest.model');
  const WorkflowRequest = require('../src/modules/workflow/workflowRequest.model');

  const tenants = await Tenant.find();

  for (const tenant of tenants) {
    console.log(`Processing Tenant: ${tenant.name} (${tenant.slug})`);
    
    // Find HR Admin or Leadership users to act as approvers
    const approver = await User.findOne({ tenantId: tenant._id, role: { $in: ['HR_ADMIN', 'LEADERSHIP'] } });
    if (!approver) {
      console.log(`  No HR Admin/Leadership found for tenant ${tenant.name}. Skipping...`);
      continue;
    }

    // Find standard employees (excluding CEO / HR)
    const employees = await Employee.find({ 
      tenantId: tenant._id, 
      isDeleted: false 
    }).populate('userId');

    const standardEmps = employees.filter(e => {
      const role = e.userId?.role || '';
      return role === 'EMPLOYEE';
    });

    if (standardEmps.length === 0) {
      console.log(`  No standard employees found for tenant ${tenant.name}. Skipping...`);
      continue;
    }

    // Create 2 pending correction requests per tenant for demonstration
    const targets = standardEmps.slice(0, 2);
    for (const emp of targets) {
      console.log(`  Adding example punch correction request for: ${emp.personal?.firstName} ${emp.personal?.lastName}`);
      
      const date1 = new Date('2026-06-18');
      const date2 = new Date('2026-06-19');

      const dates = [
        { date: date1, reason: 'Forgot to punch out due to urgent work delivery', in: '09:00', out: '18:30' },
        { date: date2, reason: 'Out of office client meetings, missed punch in', in: '10:15', out: '19:00' }
      ];

      for (const d of dates) {
        const midnight = new Date(d.date);
        midnight.setHours(0,0,0,0);

        // Check if matching regularization request already exists
        const existing = await RegularizationRequest.findOne({
          tenantId: tenant._id,
          employeeId: emp._id,
          date: midnight,
          isDeleted: false
        });

        if (existing) continue;

        const punchIn = new Date(d.date);
        const [inH, inM] = d.in.split(':');
        punchIn.setHours(inH, inM, 0);

        const punchOut = new Date(d.date);
        const [outH, outM] = d.out.split(':');
        punchOut.setHours(outH, outM, 0);

        const regReq = new RegularizationRequest({
          tenantId: tenant._id,
          employeeId: emp._id,
          date: midnight,
          requestedPunchIn: punchIn,
          requestedPunchOut: punchOut,
          reason: d.reason,
          status: 'PENDING',
          createdBy: emp.userId?._id || approver._id
        });
        await regReq.save();

        const flowReq = new WorkflowRequest({
          tenantId: tenant._id,
          requestType: 'ATTENDANCE_REGULARIZATION',
          referenceId: regReq._id,
          referenceModel: 'RegularizationRequest',
          requestedBy: emp.userId?._id || approver._id,
          requestedByEmployeeId: emp._id,
          status: 'PENDING',
          currentLevel: 1,
          levels: [
            {
              order: 1,
              approverId: approver._id,
              approverName: approver.email,
              status: 'PENDING',
              notifiedAt: new Date(),
              slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
          ],
          createdBy: emp.userId?._id || approver._id
        });
        await flowReq.save();

        regReq.workflowRequestId = flowReq._id;
        await regReq.save();
      }
    }
  }

  console.log('Successfully seeded example punch correction requests.');
  await mongoose.disconnect();
}

run().catch(console.error);
