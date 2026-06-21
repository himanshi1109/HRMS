const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null }, // Null = applies to all locations
    name: { type: String, required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ['NATIONAL', 'REGIONAL', 'OPTIONAL'],
      required: true
    },
    isActive: { type: Boolean, default: true },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Date and name combination unique per tenant
holidaySchema.index({ tenantId: 1, date: 1, locationId: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);
