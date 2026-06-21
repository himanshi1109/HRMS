const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
  const Organization = mongoose.model('Organization', new mongoose.Schema({}, { strict: false }));
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

  const tenants = await Tenant.find();
  console.log('--- Tenants ---');
  for (const t of tenants) {
    console.log(`ID: ${t._id}, Name: ${t.name}, Slug: ${t.slug}`);
  }

  const orgs = await Organization.find();
  console.log('\n--- Organizations ---');
  for (const o of orgs) {
    console.log(`ID: ${o._id}, tenantId: ${o.tenantId}, Name: ${o.name}, address: ${JSON.stringify(o.address)}`);
  }

  const users = await User.find({ role: 'HR_ADMIN' });
  console.log('\n--- HR_ADMIN Users ---');
  for (const u of users) {
    console.log(`ID: ${u._id}, Email: ${u.email}, tenantId: ${u.tenantId}, role: ${u.role}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
