const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
  const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
  const AttendanceRecord = mongoose.model('AttendanceRecord', new mongoose.Schema({
    tenantId: mongoose.Schema.Types.ObjectId,
    employeeId: mongoose.Schema.Types.ObjectId,
    date: Date,
    shiftId: mongoose.Schema.Types.ObjectId,
    punchIn: Date,
    punchOut: Date,
    punchInSource: String,
    punchOutSource: String,
    workingMinutes: Number,
    overtimeMinutes: Number,
    status: String,
    isRegularized: Boolean,
    isDeleted: { type: Boolean, default: false }
  }, { strict: false }));

  const Shift = mongoose.model('Shift', new mongoose.Schema({}, { strict: false }));

  const tenants = await Tenant.find();
  const startDate = new Date('2026-05-01');
  const endDate = new Date('2026-06-21');

  let recordsAdded = 0;

  for (const tenant of tenants) {
    console.log(`Processing Tenant: ${tenant.name} (${tenant.slug})`);
    const employees = await Employee.find({ tenantId: tenant._id, isDeleted: false });
    
    // Find a shift for this tenant
    const shift = await Shift.findOne({ tenantId: tenant._id, isDeleted: false }) || { _id: null, startTime: '09:00', endTime: '18:00' };

    for (const emp of employees) {
      console.log(`  Seeding attendance for: ${emp.personal?.firstName} ${emp.personal?.lastName} (${emp.employeeId})`);
      
      // Loop over dates
      let curr = new Date(startDate);
      while (curr <= endDate) {
        const dateOnly = new Date(curr);
        dateOnly.setHours(0, 0, 0, 0);

        // Check if record exists
        const existing = await AttendanceRecord.findOne({
          tenantId: tenant._id,
          employeeId: emp._id,
          date: dateOnly,
          isDeleted: false
        });

        if (!existing) {
          const dayOfWeek = dateOnly.getDay(); // 0 = Sunday, 6 = Saturday
          let status = 'PRESENT';
          let punchIn = null;
          let punchOut = null;
          let workingMinutes = 0;

          if (dayOfWeek === 0 || dayOfWeek === 6) {
            status = 'WEEKLY_OFF';
          } else {
            // Randomly present (90%), late (8%), absent (2%)
            const rand = Math.random();
            if (rand < 0.02) {
              status = 'ABSENT';
            } else {
              // 09:00 plus some random minutes
              const startH = 9;
              const startM = rand < 0.1 ? Math.floor(Math.random() * 45) + 15 : Math.floor(Math.random() * 15); // 8% late (punched after 09:15)
              if (startM >= 15) {
                status = 'LATE';
              }
              
              punchIn = new Date(dateOnly);
              punchIn.setHours(startH, startM, Math.floor(Math.random() * 60));

              // Punch out (around 17:45 to 18:30)
              punchOut = new Date(dateOnly);
              punchOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

              workingMinutes = Math.round((punchOut - punchIn) / (1000 * 60));
            }
          }

          const record = new AttendanceRecord({
            tenantId: tenant._id,
            employeeId: emp._id,
            date: dateOnly,
            shiftId: shift._id,
            punchIn,
            punchOut,
            punchInSource: punchIn ? 'WEB' : undefined,
            punchOutSource: punchOut ? 'WEB' : undefined,
            workingMinutes,
            overtimeMinutes: workingMinutes > 480 ? workingMinutes - 480 : 0,
            status,
            isRegularized: false
          });

          await record.save();
          recordsAdded++;
        }

        curr.setDate(curr.getDate() + 1);
      }
    }
  }

  console.log(`Seeding completed. Added ${recordsAdded} attendance records.`);
  await mongoose.disconnect();
}

run().catch(console.error);
