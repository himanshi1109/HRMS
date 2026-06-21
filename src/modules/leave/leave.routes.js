const express = require('express');
const router = express.Router();
const leaveController = require('./leave.controller');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roles');

// ==========================================
// Leave Type Routes
// ==========================================
router.post('/types', verifyToken, checkRole(['HR_ADMIN']), leaveController.createLeaveType);
router.get('/types', verifyToken, leaveController.getLeaveTypes);
router.get('/types/:id', verifyToken, leaveController.getLeaveTypeById);
router.put('/types/:id', verifyToken, checkRole(['HR_ADMIN']), leaveController.updateLeaveType);
router.delete('/types/:id', verifyToken, checkRole(['HR_ADMIN']), leaveController.deleteLeaveType);

// ==========================================
// Leave Policy Routes
// ==========================================
router.post('/policies', verifyToken, checkRole(['HR_ADMIN']), leaveController.createLeavePolicy);
router.get('/policies', verifyToken, leaveController.getLeavePolicies);
router.get('/policies/:id', verifyToken, leaveController.getLeavePolicyById);
router.put('/policies/:id', verifyToken, checkRole(['HR_ADMIN']), leaveController.updateLeavePolicy);
router.delete('/policies/:id', verifyToken, checkRole(['HR_ADMIN']), leaveController.deleteLeavePolicy);

// ==========================================
// Leave Balance Routes
// ==========================================
router.get('/balances/my', verifyToken, leaveController.getMyBalances);
router.get('/balances/employee/:id', verifyToken, checkRole(['HR_ADMIN', 'MANAGER']), leaveController.getEmployeeBalances);
router.get('/balances/team', verifyToken, checkRole(['MANAGER', 'HR_ADMIN']), leaveController.getTeamBalances);
router.put('/balances/:id/adjust', verifyToken, checkRole(['HR_ADMIN']), leaveController.adjustBalance);
router.post('/balances/accrue', verifyToken, checkRole(['HR_ADMIN']), leaveController.accrueBalances);
router.post('/balances/year-end', verifyToken, checkRole(['HR_ADMIN']), leaveController.yearEndProcess);

// ==========================================
// Leave Request Routes
// ==========================================
router.post('/requests', verifyToken, leaveController.applyLeave);
router.get('/requests/my', verifyToken, leaveController.getMyRequests);
router.get('/requests/team', verifyToken, checkRole(['MANAGER', 'HR_ADMIN']), leaveController.getTeamRequests);
router.get('/requests/all', verifyToken, checkRole(['HR_ADMIN']), leaveController.getAllRequests);
router.get('/requests/:id', verifyToken, leaveController.getRequestById);
router.put('/requests/:id/cancel', verifyToken, leaveController.cancelRequest);
router.put('/requests/:id/withdraw', verifyToken, leaveController.withdrawRequest);

// ==========================================
// Leave Calendar Routes
// ==========================================
router.get('/calendar/team', verifyToken, checkRole(['MANAGER', 'HR_ADMIN']), leaveController.getTeamCalendar);
router.get('/calendar/my', verifyToken, leaveController.getMyCalendar);

module.exports = router;
