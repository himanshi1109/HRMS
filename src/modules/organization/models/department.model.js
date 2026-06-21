const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    headId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    parentDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Department code unique per tenant
departmentSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
