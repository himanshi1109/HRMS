const express = require('express');
const router = express.Router();
const essController = require('./ess.controller');
const attendanceController = require('../attendance/attendance.controller');
const leaveController = require('../leave/leave.controller');
const { verifyToken } = require('../../middleware/auth');

router.get('/dashboard', verifyToken, essController.getDashboard);
router.put('/profile', verifyToken, essController.updateProfile);
router.put('/profile/sensitive', verifyToken, essController.updateProfileSensitive);
router.get('/payslips', verifyToken, essController.getPayslips);
router.get('/payslips/:docId/download', verifyToken, essController.downloadPayslip);
router.get('/documents', verifyToken, essController.getDocuments);
router.get('/holidays', verifyToken, essController.getHolidays);

// Proxies
router.post('/punch', verifyToken, attendanceController.punch);
router.post('/leave', verifyToken, leaveController.applyLeave);

module.exports = router;
