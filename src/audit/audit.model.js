const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String },
    action: {
      type: String,
      enum: [
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'LOGIN_FAILED',
        'APPROVE',
        'REJECT',
        'EXPORT'
      ],
      required: true
    },
    resourceType: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: false }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
