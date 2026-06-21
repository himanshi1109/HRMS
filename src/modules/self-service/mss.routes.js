const express = require('express');
const router = express.Router();
const mssController = require('./mss.controller');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roles');

router.get('/dashboard', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'LEADERSHIP']), mssController.getMssDashboard);
router.get('/approvals', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'LEADERSHIP']), mssController.getMssApprovals);
router.post('/approvals/:requestId/approve', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'LEADERSHIP']), mssController.approveRequest);
router.post('/approvals/:requestId/reject', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'LEADERSHIP']), mssController.rejectRequest);
router.get('/team', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'LEADERSHIP']), mssController.getTeamMembers);
router.get('/team/attendance', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'LEADERSHIP']), mssController.getTeamAttendance);
router.get('/team/leave', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'LEADERSHIP']), mssController.getTeamLeave);
router.post('/team/transfer', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'LEADERSHIP']), mssController.initiateTeamTransfer);

module.exports = router;
