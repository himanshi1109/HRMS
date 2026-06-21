const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: { type: String, required: true },
    channel: {
      type: String,
      enum: ['EMAIL', 'IN_APP'],
      required: true
    },
    subject: { type: String, required: true },
    body: { type: String, required: true }, // Rendered body with placeholders replaced
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    referenceModel: { type: String },
    deliveryStatus: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      default: 'PENDING'
    },
    metadata: { type: mongoose.Schema.Types.Mixed },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
