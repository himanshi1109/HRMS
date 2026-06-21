const Notification = require('./notification.model');
const NotificationPreference = require('./notificationPreference.model');
const { getPagination } = require('../../utils/pagination');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');

const getMyNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { isRead } = req.query;

    const query = {
      tenantId: req.tenantId,
      recipientId: req.user.userId,
      channel: 'IN_APP',
      isDeleted: false
    };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const items = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, recipientId: req.user.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notif) return errorResponse(res, 'Notification not found', 404);
    return successResponse(res, notif, 'Notification marked as read successfully');
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { tenantId: req.tenantId, recipientId: req.user.userId, channel: 'IN_APP', isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return successResponse(res, null, 'All notifications marked as read successfully');
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      tenantId: req.tenantId,
      recipientId: req.user.userId,
      channel: 'IN_APP',
      isRead: false,
      isDeleted: false
    });
    return successResponse(res, { unreadCount: count }, 'Unread notifications count fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getPreferences = async (req, res, next) => {
  try {
    let pref = await NotificationPreference.findOne({ tenantId: req.tenantId, userId: req.user.userId });
    if (!pref) {
      // Create empty defaults
      pref = new NotificationPreference({
        tenantId: req.tenantId,
        userId: req.user.userId,
        preferences: []
      });
      await pref.save();
    }
    return successResponse(res, pref, 'Notification preferences fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body; // Array of preferences object: { event, emailEnabled, inAppEnabled }
    const pref = await NotificationPreference.findOneAndUpdate(
      { tenantId: req.tenantId, userId: req.user.userId },
      { preferences },
      { new: true, upsert: true }
    );
    return successResponse(res, pref, 'Notification preferences updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getPreferences,
  updatePreferences
};
