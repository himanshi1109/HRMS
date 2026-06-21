const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    name: { type: String, required: true },
    accrualType: {
      type: String,
      enum: ['UPFRONT', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
      required: true
    },
    accrualAmount: { type: Number, required: true },
    maxBalance: { type: Number, required: true },
    carryForwardLimit: { type: Number, default: 0 },
    encashmentAllowed: { type: Boolean, default: false },
    encashmentMaxDays: { type: Number },
    maxConsecutiveDays: { type: Number },
    minNoticeDays: { type: Number, default: 0 },
    halfDayAllowed: { type: Boolean, default: true },
    hourlyAllowed: { type: Boolean, default: false },
    lopAfterBalanceExhausted: { type: Boolean, default: false },
    eligibility: {
      minServiceMonths: { type: Number, default: 0 },
      gradeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grade' }],
      locationIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
      employmentTypes: [{ type: String }] // FULL_TIME, CONTRACT, etc.
    },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
    isActive: { type: Boolean, default: true },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);
