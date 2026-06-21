const express = require('express');
const router = express.Router();
const employeeController = require('./employee.controller');
const compensationController = require('./compensation.controller');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roles');
const upload = require('../../config/multer');

// Standard routes mounted at /api/employees

router.get('/directory', verifyToken, employeeController.getDirectory);
router.get('/org-chart', verifyToken, employeeController.getOrgChart);
router.post('/bulk-import', verifyToken, checkRole(['HR_ADMIN']), upload.single('file'), employeeController.bulkImport);
router.get('/export', verifyToken, checkRole(['HR_ADMIN']), employeeController.exportEmployees);

router.post('/', verifyToken, checkRole(['HR_ADMIN']), employeeController.createEmployee);
router.get('/', verifyToken, checkRole(['HR_ADMIN', 'MANAGER', 'EMPLOYEE', 'LEADERSHIP']), employeeController.getEmployees);

router.get('/my', verifyToken, employeeController.getMyProfile);
router.get('/my/compensation', verifyToken, compensationController.getMyCompensation);
router.get('/:id/compensation', verifyToken, compensationController.getEmployeeCompensation);
router.get('/:id/payslips', verifyToken, compensationController.getEmployeePayslips);
router.get('/:id/payslips/:yearMonth', verifyToken, compensationController.getEmployeePayslipDetail);
router.get('/:id', verifyToken, employeeController.getEmployeeById);
router.put('/:id', verifyToken, checkRole(['HR_ADMIN']), employeeController.updateEmployee);
router.delete('/:id', verifyToken, checkRole(['HR_ADMIN']), employeeController.deleteEmployee);
router.put('/:id/personal', verifyToken, employeeController.updateEmployeePersonal);
router.put('/:id/sensitive', verifyToken, checkRole(['HR_ADMIN']), employeeController.updateEmployeeSensitive);
router.post('/:id/reset-password', verifyToken, checkRole(['HR_ADMIN']), employeeController.resetEmployeePassword);

router.post('/:id/documents', verifyToken, upload.single('file'), employeeController.uploadDocument);
router.delete('/:id/documents/:docId', verifyToken, checkRole(['HR_ADMIN']), employeeController.deleteDocument);
router.post('/:id/confirm', verifyToken, checkRole(['HR_ADMIN']), employeeController.confirmEmployee);
router.post('/:id/transfer', verifyToken, checkRole(['HR_ADMIN']), employeeController.transferEmployee);
router.post('/:id/promote', verifyToken, checkRole(['HR_ADMIN']), employeeController.promoteEmployee);
router.post('/:id/exit', verifyToken, checkRole(['HR_ADMIN']), employeeController.exitEmployee);
router.get('/:id/timeline', verifyToken, checkRole(['HR_ADMIN']), employeeController.getTimeline);

module.exports = router;
