const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
  const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));

  const tenants = await Tenant.find();
  for (const tenant of tenants) {
    console.log(`Tenant: ${tenant.name} (${tenant.slug}) - ${tenant._id}`);
    const employees = await Employee.find({ tenantId: tenant._id, isDeleted: false });
    console.log(`  Employees (${employees.length}):`);
    for (const emp of employees) {
      console.log(`    - [${emp.employeeId}] ${emp.personal?.firstName} ${emp.personal?.lastName} (${emp.contact?.officialEmail})`);
    }
  }
  await mongoose.disconnect();
}
run();
