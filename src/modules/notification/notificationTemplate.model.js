const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true }, // null = system default template
    event: {
      type: String,
      enum: [
        'LEAVE_APPLIED',
        'LEAVE_APPROVED',
        'LEAVE_REJECTED',
        'REGULARIZATION_RAISED',
        'PUNCH_MISSED',
        'APPROVAL_PENDING',
        'SLA_BREACH',
        'PASSWORD_RESET',
        'WELCOME',
        'BIRTHDAY',
        'WORK_ANNIVERSARY',
        'PAYSLIP_GENERATED'
      ],
      required: true
    },
    channel: {
      type: String,
      enum: ['EMAIL', 'IN_APP'],
      required: true
    },
    subject: { type: String, required: true }, // supports {{variable}} placeholders
    body: { type: String, required: true }, // supports {{variable}} placeholders
    isActive: { type: Boolean, default: true },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
