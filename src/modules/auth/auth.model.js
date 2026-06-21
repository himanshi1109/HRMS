const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    email: { type: String, required: true, trim: true, lowercase: true },
    username: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'LEADERSHIP', 'SUPER_ADMIN'],
      required: true
    },
    isActive: { type: Boolean, default: true },
    isMfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String },
    ssoProvider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE', 'MICROSOFT'],
      default: 'LOCAL'
    },
    ssoId: { type: String },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    passwordHistory: [{ type: String }],
    refreshToken: { type: String },
    refreshTokenExpiresAt: { type: Date },
    
    // Reset password fields
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Create compound unique index on tenantId and email (so emails must be unique per tenant)
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, username: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
