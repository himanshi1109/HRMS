const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
  const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));

  const users = await User.find();
  console.log('--- ALL USERS ---');
  for (const u of users) {
    const t = await Tenant.findById(u.tenantId);
    const emp = await Employee.findById(u.employeeId);
    console.log(`User ID: ${u._id}`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Role: ${u.role}`);
    console.log(`  Tenant: ${t ? t.name : 'Unknown'} (${u.tenantId})`);
    console.log(`  Employee: ${emp ? (emp.personal?.firstName + ' ' + emp.personal?.lastName) : 'None'} (${u.employeeId})`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
