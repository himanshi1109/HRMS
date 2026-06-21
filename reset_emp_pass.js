const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoUri = 'mongodb+srv://hrms-admin123:hrms123@hrms-cluster.gexutaj.mongodb.net/hrms?appName=hrms-cluster';

// Define User schema
const UserSchema = new mongoose.Schema({
  email: String,
  role: String,
  passwordHash: String,
  employeeId: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // List all users
    const users = await User.find({});
    console.log('\n--- ACTIVE ACCOUNTS ---');
    users.forEach(u => {
      console.log(`Email: ${u.email} | Role: ${u.role} | ID: ${u._id}`);
    });
    console.log('-----------------------\n');
    
    // Find the non-HR user (the newly created employee)
    const empUser = users.find(u => u.role === 'EMPLOYEE');
    if (empUser) {
      const newHash = await bcrypt.hash('password123', 12);
      empUser.passwordHash = newHash;
      await empUser.save();
      console.log(`Successfully reset password for employee "${empUser.email}" to "password123"`);
    } else {
      console.log('No EMPLOYEE accounts found to reset.');
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
