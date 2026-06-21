const express = require('express');
const router = express.Router();
const workflowController = require('./workflow.controller');
const { verifyToken } = require('../../middleware/auth');
const { checkRole } = require('../../middleware/roles');

// Workflow Configuration Routes
router.post('/configs', verifyToken, checkRole(['HR_ADMIN']), workflowController.createConfig);
router.get('/configs', verifyToken, checkRole(['HR_ADMIN']), workflowController.getConfigs);
router.put('/configs/:id', verifyToken, checkRole(['HR_ADMIN']), workflowController.updateConfig);
router.get('/configs/:requestType', verifyToken, checkRole(['HR_ADMIN']), workflowController.getConfigByType);

// Workflow Instance Routes
router.get('/my-approvals', verifyToken, checkRole(['MANAGER', 'HR_ADMIN', 'LEADERSHIP']), workflowController.getMyApprovals);
router.get('/:id', verifyToken, workflowController.getWorkflowRequest);
router.put('/:id/approve', verifyToken, workflowController.approve);
router.put('/:id/reject', verifyToken, workflowController.reject);
router.put('/:id/cancel', verifyToken, workflowController.cancel);
router.put('/:id/delegate', verifyToken, workflowController.delegate);

module.exports = router;
