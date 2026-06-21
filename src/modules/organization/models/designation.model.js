const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    level: { type: Number },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' },
    isActive: { type: Boolean, default: true },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Designation code unique per tenant
designationSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Designation', designationSchema);
