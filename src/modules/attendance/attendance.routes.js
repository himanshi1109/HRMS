const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roles');

// Shift Management Routes (HR_ADMIN)
router.post('/shifts', verifyToken, checkRole(['HR_ADMIN']), attendanceController.createShift);
router.get('/shifts', verifyToken, checkRole(['HR_ADMIN']), attendanceController.getShifts);
router.put('/shifts/:id', verifyToken, checkRole(['HR_ADMIN']), attendanceController.updateShift);
router.delete('/shifts/:id', verifyToken, checkRole(['HR_ADMIN']), attendanceController.deleteShift);
router.post('/shifts/:id/assign', verifyToken, checkRole(['HR_ADMIN']), attendanceController.assignShift);

// Holiday Management Routes (HR_ADMIN)
router.post('/holidays', verifyToken, checkRole(['HR_ADMIN']), attendanceController.createHoliday);
router.get('/holidays', verifyToken, attendanceController.getHolidays);
router.put('/holidays/:id', verifyToken, checkRole(['HR_ADMIN']), attendanceController.updateHoliday);
router.delete('/holidays/:id', verifyToken, checkRole(['HR_ADMIN']), attendanceController.deleteHoliday);

// Attendance Punch Clock & Reporting Routes
router.post('/punch', verifyToken, attendanceController.punch);
router.put('/:id', verifyToken, checkRole(['HR_ADMIN']), attendanceController.updateRecord);
router.get('/my', verifyToken, attendanceController.getMyAttendance);
router.get('/team', verifyToken, checkRole(['MANAGER', 'HR_ADMIN']), attendanceController.getTeamAttendance);
router.get('/all', verifyToken, checkRole(['HR_ADMIN', 'LEADERSHIP']), attendanceController.getAllAttendance);
router.get('/summary', verifyToken, checkRole(['HR_ADMIN', 'MANAGER', 'LEADERSHIP']), attendanceController.getAttendanceSummary);
router.get('/dashboard', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'EMPLOYEE', 'LEADERSHIP']), attendanceController.getDashboard);
router.get('/muster', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'EMPLOYEE', 'LEADERSHIP']), attendanceController.getMuster);

// Attendance Regularization Request Routes
router.post('/regularize', verifyToken, attendanceController.regularize);
router.get('/regularize/my', verifyToken, attendanceController.getMyRegularizations);
router.get('/regularize/pending', verifyToken, checkRole(['MANAGER', 'HR_ADMIN']), attendanceController.getPendingRegularizations);
router.put('/regularize/:id/approve', verifyToken, checkRole(['MANAGER', 'HR_ADMIN']), attendanceController.approveRegularization);
router.put('/regularize/:id/reject', verifyToken, checkRole(['MANAGER', 'HR_ADMIN']), attendanceController.rejectRegularization);

module.exports = router;
