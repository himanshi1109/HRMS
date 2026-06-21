const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    preferences: [
      {
        event: { type: String, required: true },
        emailEnabled: { type: Boolean, default: true },
        inAppEnabled: { type: Boolean, default: true }
      }
    ]
  },
  { timestamps: true }
);

// Unique preference per user
notificationPreferenceSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
