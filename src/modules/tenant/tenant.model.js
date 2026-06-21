const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    domain: { type: String },
    logo: { type: String },
    isActive: { type: Boolean, default: true },
    authPolicy: {
      passwordMinLength: { type: Number, default: 8 },
      passwordExpiryDays: { type: Number, default: 0 },
      sessionTimeoutMinutes: { type: Number, default: 480 },
      maxFailedAttempts: { type: Number, default: 5 },
      lockoutDurationMinutes: { type: Number, default: 15 },
      isMfaRequired: { type: Boolean, default: false }
    },
    emailConfig: {
      senderEmail: { type: String, default: '' },
      senderPassword: { type: String, default: '' }
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tenant', tenantSchema);
