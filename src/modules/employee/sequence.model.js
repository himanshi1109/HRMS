const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    seq: { type: Number, default: 0 }
  },
  { timestamps: false }
);

// Create compound index for unique sequence names per tenant
sequenceSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Sequence', sequenceSchema);
