const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    level: { type: Number },
    salaryRangeMin: { type: Number },
    salaryRangeMax: { type: Number },
    isActive: { type: Boolean, default: true },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Grade code unique per tenant
gradeSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
