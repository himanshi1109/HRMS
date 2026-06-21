const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const Tenant = require('../src/modules/tenant/tenant.model');
  const User = require('../src/modules/auth/auth.model');
  const Employee = require('../src/modules/employee/employee.model');
  const Department = require('../src/modules/organization/models/department.model');
  const Designation = require('../src/modules/organization/models/designation.model');
  const employeeService = require('../src/modules/employee/employee.service');

  const tenant = await Tenant.findOne({ slug: 'splitsvilla' });
  if (!tenant) {
    console.error('Tenant splitsvilla not found');
    process.exit(1);
  }
  const tenantId = tenant._id;

  // Find any existing employee and user under this tenant with the email
  const email = 'rishisahu9695@gmail.com';
  
  const existingEmp = await Employee.findOne({ tenantId, 'contact.officialEmail': email });
  if (existingEmp) {
    console.log(`Deleting existing employee record ${existingEmp._id}`);
    await Employee.deleteOne({ _id: existingEmp._id });
  }

  const existingUser = await User.findOne({ tenantId, email });
  if (existingUser) {
    console.log(`Deleting existing user record ${existingUser._id}`);
    await User.deleteOne({ _id: existingUser._id });
  }

  // Get a department and designation
  const dept = await Department.findOne({ tenantId }) || new Department({ tenantId, name: 'General', code: 'GEN' });
  if (dept.isNew) await dept.save();

  const desig = await Designation.findOne({ tenantId }) || new Designation({ tenantId, name: 'Associate', code: 'ASSOC' });
  if (desig.isNew) await desig.save();

  // Find first HR ADMIN of Splitsvilla to act as creator
  const hrAdminUser = await User.findOne({ tenantId, role: 'HR_ADMIN' });
  const creatorId = hrAdminUser ? hrAdminUser._id : new mongoose.Types.ObjectId();

  const payload = {
    role: 'EMPLOYEE',
    password: 'iloveyou143',
    personal: {
      firstName: 'Rishi',
      lastName: 'Sahu',
      gender: 'MALE'
    },
    contact: {
      officialEmail: email
    },
    employment: {
      departmentId: dept._id,
      designationId: desig._id,
      dateOfJoining: new Date(),
      employmentType: 'FULL_TIME'
    }
  };

  console.log('Registering employee via service...');
  const result = await employeeService.createEmployee(tenantId, payload, creatorId);
  console.log('Employee successfully registered:', result);

  await mongoose.disconnect();
}

run().catch(console.error);
