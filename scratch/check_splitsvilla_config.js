const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
  
  const tenant = await Tenant.findOne({ slug: 'splitsvilla' });
  if (tenant) {
    console.log('Splitsvilla Tenant emailConfig:', tenant.emailConfig);
    if (tenant.emailConfig) {
      console.log('Clearing custom emailConfig from Splitsvilla to force fallback to working global credentials...');
      tenant.emailConfig = undefined;
      await tenant.save();
      console.log('Cleared successfully.');
    }
  } else {
    console.log('Tenant splitsvilla not found.');
  }

  await mongoose.disconnect();
}
run();
