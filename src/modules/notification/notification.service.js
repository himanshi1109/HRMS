const NotificationTemplate = require('./notificationTemplate.model');
const Notification = require('./notification.model');
const NotificationPreference = require('./notificationPreference.model');
const User = require('../auth/auth.model');
const emailService = require('../../utils/emailService');

const CRITICAL_EVENTS = ['WELCOME', 'PASSWORD_RESET', 'ACCOUNT_LOCKED', 'SLA_BREACH'];

// Simple template engine using regex replacement
const renderTemplate = (templateStr, data) => {
  if (!templateStr) return '';
  let result = templateStr;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value !== undefined && value !== null ? value : '');
  }
  return result;
};

const sendNotification = async (tenantId, recipientUserId, event, data) => {
  try {
    const user = await User.findOne({ _id: recipientUserId, tenantId, isDeleted: false });
    if (!user) return;

    let emailEnabled = true;
    let inAppEnabled = true;

    // Check preferences unless the event is critical
    if (!CRITICAL_EVENTS.includes(event)) {
      const pref = await NotificationPreference.findOne({ tenantId, userId: recipientUserId });
      if (pref) {
        const eventPref = pref.preferences.find(p => p.event === event);
        if (eventPref) {
          emailEnabled = eventPref.emailEnabled;
          inAppEnabled = eventPref.inAppEnabled;
        }
      }
    }

    // Fetch template (prioritizing tenant-specific over null/global defaults)
    const templates = await NotificationTemplate.find({
      event,
      isActive: true,
      isDeleted: false,
      $or: [{ tenantId }, { tenantId: null }]
    });

    // Sort to put tenant-specific templates (non-null tenantId) first
    templates.sort((a, b) => (b.tenantId ? 1 : 0) - (a.tenantId ? 1 : 0));

    const emailTemplate = templates.find(t => t.channel === 'EMAIL');
    const inAppTemplate = templates.find(t => t.channel === 'IN_APP');

    // 1. Process IN_APP Notification
    if (inAppEnabled && inAppTemplate) {
      const subject = renderTemplate(inAppTemplate.subject, data);
      const body = renderTemplate(inAppTemplate.body, data);

      const notif = new Notification({
        tenantId,
        recipientId: recipientUserId,
        event,
        channel: 'IN_APP',
        subject,
        body,
        deliveryStatus: 'SENT'
      });
      await notif.save();
    }

    // 2. Process EMAIL Notification
    if (emailEnabled && emailTemplate) {
      const subject = renderTemplate(emailTemplate.subject, data);
      const body = renderTemplate(emailTemplate.body, data);

      const notif = new Notification({
        tenantId,
        recipientId: recipientUserId,
        event,
        channel: 'EMAIL',
        subject,
        body,
        deliveryStatus: 'PENDING'
      });
      await notif.save();

      try {
        await emailService.sendEmail({
          to: user.email,
          subject,
          html: body
        });
        notif.deliveryStatus = 'SENT';
      } catch (err) {
        notif.deliveryStatus = 'FAILED';
        notif.metadata = { error: err.message };
      }
      await notif.save();
    }
  } catch (error) {
    console.error('Notification dispatcher error:', error);
  }
};

module.exports = {
  renderTemplate,
  sendNotification
};
