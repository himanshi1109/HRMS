const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roles');

router.get('/headcount', verifyToken, checkRole(['HR_ADMIN', 'LEADERSHIP']), reportsController.getHeadcount);
router.get('/attendance/summary', verifyToken, checkRole(['HR_ADMIN', 'MANAGER', 'LEADERSHIP']), reportsController.getAttendanceSummary);
router.get('/attendance/late', verifyToken, checkRole(['HR_ADMIN', 'MANAGER', 'LEADERSHIP']), reportsController.getLateReport);
router.get('/attendance/absent', verifyToken, checkRole(['HR_ADMIN', 'MANAGER', 'LEADERSHIP']), reportsController.getAbsentReport);
router.get('/attendance/overtime', verifyToken, checkRole(['HR_ADMIN', 'LEADERSHIP']), reportsController.getOvertimeReport);
router.get('/leave/balances', verifyToken, checkRole(['HR_ADMIN', 'LEADERSHIP']), reportsController.getLeaveBalances);
router.get('/leave/usage', verifyToken, checkRole(['HR_ADMIN', 'LEADERSHIP']), reportsController.getLeaveUsage);
router.get('/leave/lop', verifyToken, checkRole(['HR_ADMIN', 'LEADERSHIP']), reportsController.getLeaveLop);
router.get('/attrition', verifyToken, checkRole(['HR_ADMIN', 'LEADERSHIP']), reportsController.getAttrition);
router.get('/dashboard/hr', verifyToken, checkRole(['HR_ADMIN', 'LEADERSHIP']), reportsController.getHrDashboard);
router.get('/dashboard/leadership', verifyToken, checkRole(['LEADERSHIP']), reportsController.getLeadershipDashboard);

module.exports = router;
