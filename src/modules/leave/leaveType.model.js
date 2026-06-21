const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    category: {
      type: String,
      enum: ['CASUAL', 'SICK', 'EARNED', 'COMP_OFF', 'MATERNITY', 'PATERNITY', 'LOSS_OF_PAY', 'CUSTOM'],
      required: true
    },
    isPaid: { type: Boolean, default: true },
    isCarryForwardable: { type: Boolean, default: false },
    color: { type: String, default: '#4CAF50' }, // HEX Color code
    isActive: { type: Boolean, default: true },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Leave type code unique per tenant
leaveTypeSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
