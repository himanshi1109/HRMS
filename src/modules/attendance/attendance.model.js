const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true, index: true }, // Midnight Date (date-only)
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    
    punchIn: { type: Date },
    punchOut: { type: Date },
    punchInSource: {
      type: String,
      enum: ['WEB', 'MOBILE', 'BIOMETRIC', 'IP']
    },
    punchInLocation: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    punchInIp: { type: String },

    punchOutSource: {
      type: String,
      enum: ['WEB', 'MOBILE', 'BIOMETRIC', 'IP']
    },
    punchOutLocation: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    punchOutIp: { type: String },

    workingMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'HOLIDAY', 'WEEKLY_OFF', 'ON_LEAVE', 'SHORT_LEAVE', 'REGULARIZED'],
      default: 'ABSENT'
    },
    isRegularized: { type: Boolean, default: false },
    regularizationRequestId: { type: mongoose.Schema.Types.ObjectId },
    
    rawPunches: [
      {
        time: { type: Date, default: Date.now },
        source: { type: String },
        location: {
          latitude: { type: Number },
          longitude: { type: Number }
        },
        ip: { type: String }
      }
    ],
    notes: { type: String },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Unique index per tenant per employee per date
attendanceRecordSchema.index({ tenantId: 1, employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
