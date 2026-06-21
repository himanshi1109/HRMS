const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    year: { type: Number, required: true },
    openingBalance: { type: Number, default: 0 },
    accrued: { type: Number, default: 0 },
    availed: { type: Number, default: 0 },
    lopDays: { type: Number, default: 0 },
    encashed: { type: Number, default: 0 },
    carriedForward: { type: Number, default: 0 },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Virtual for calculating current active balance
leaveBalanceSchema.virtual('balance').get(function () {
  return this.openingBalance + this.accrued - this.availed - this.lopDays - this.encashed;
});

// Set toObject and toJSON options to include virtuals
leaveBalanceSchema.set('toObject', { virtuals: true });
leaveBalanceSchema.set('toJSON', { virtuals: true });

// Unique index per tenant per employee per leave type per year
leaveBalanceSchema.index({ tenantId: 1, employeeId: 1, leaveTypeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
