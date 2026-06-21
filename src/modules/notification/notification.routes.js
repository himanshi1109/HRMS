const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { verifyToken } = require('../../middleware/auth');

router.get('/my', verifyToken, notificationController.getMyNotifications);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.put('/read-all', verifyToken, notificationController.markAllAsRead);
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);
router.get('/preferences', verifyToken, notificationController.getPreferences);
router.put('/preferences', verifyToken, notificationController.updatePreferences);

module.exports = router;
