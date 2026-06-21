const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    logo: { type: String },
    industry: { type: String },
    size: { type: Number },
    timezone: { type: String, default: 'Asia/Kolkata' },
    fiscalYearStart: { type: Number, default: 4, min: 1, max: 12 },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pincode: { type: String }
    },
    website: { type: String },
    phone: { type: String },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
