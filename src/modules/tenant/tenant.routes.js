const express = require('express');
const router = express.Router();
const tenantController = require('./tenant.controller');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roles');

router.get('/me', verifyToken, tenantController.getTenant);
router.get('/:id', verifyToken, tenantController.getTenant);
router.put('/:id', verifyToken, checkRole(['SUPER_ADMIN', 'HR_ADMIN']), tenantController.updateTenant);

module.exports = router;
