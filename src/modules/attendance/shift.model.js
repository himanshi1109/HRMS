const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: {
      type: String,
      enum: ['FIXED', 'FLEXIBLE', 'ROTATIONAL'],
      default: 'FIXED'
    },
    startTime: { type: String, required: true }, // HH:mm format
    endTime: { type: String, required: true }, // HH:mm format
    totalMinutes: { type: Number }, // Auto-calculated
    graceMinutes: { type: Number, default: 15 },
    lateMarkAfterMinutes: { type: Number, default: 30 },
    halfDayThresholdMinutes: { type: Number, default: 240 },
    overtimeAfterMinutes: { type: Number, default: 480 },
    isNightShift: { type: Boolean, default: false },
    weeklyOffDays: { type: [Number], default: [0, 6] }, // 0 = Sunday, 6 = Saturday
    isActive: { type: Boolean, default: true },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Auto-calculate totalMinutes before saving
shiftSchema.pre('save', function (next) {
  if (this.startTime && this.endTime) {
    const [startH, startM] = this.startTime.split(':').map(Number);
    const [endH, endM] = this.endTime.split(':').map(Number);

    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff < 0) {
      // Handles overnight shifts
      diff += 24 * 60;
    }
    this.totalMinutes = diff;
  }
  next();
});

// Shift code unique per tenant
shiftSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Shift', shiftSchema);
