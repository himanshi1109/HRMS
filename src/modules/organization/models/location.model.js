const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pincode: { type: String }
    },
    timezone: { type: String, default: 'Asia/Kolkata' },
    gps: {
      latitude: { type: Number },
      longitude: { type: Number },
      radiusMeters: { type: Number, default: 200 }
    },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Location code unique per tenant
locationSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);
