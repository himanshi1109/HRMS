const WorkflowConfig = require('./workflowConfig.model');
const WorkflowRequest = require('./workflowRequest.model');
const User = require('../auth/auth.model');
const workflowService = require('./workflow.service');
require('../leave/leaveRequest.model');
require('../attendance/regularizationRequest.model');
const auditService = require('../../audit/audit.service');
const { getPagination } = require('../../utils/pagination');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');

// ==========================================
// Workflow Config Controllers
// ==========================================
const createConfig = async (req, res, next) => {
  try {
    const config = new WorkflowConfig({
      ...req.body,
      tenantId: req.tenantId,
      createdBy: req.user.userId
    });
    await config.save();

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'CREATE',
      resourceType: 'WorkflowConfig',
      resourceId: config._id,
      after: config.toObject(),
      req
    });

    return successResponse(res, config, 'Workflow configuration created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getConfigs = async (req, res, next) => {
  try {
    const configs = await WorkflowConfig.find({ tenantId: req.tenantId, isDeleted: false });
    return successResponse(res, configs, 'Workflow configurations fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateConfig = async (req, res, next) => {
  try {
    const config = await WorkflowConfig.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      { ...req.body, updatedBy: req.user.userId },
      { new: true }
    );
    if (!config) return errorResponse(res, 'Workflow configuration not found', 404);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'WorkflowConfig',
      resourceId: config._id,
      after: config.toObject(),
      req
    });

    return successResponse(res, config, 'Workflow configuration updated successfully');
  } catch (error) {
    next(error);
  }
};

const getConfigByType = async (req, res, next) => {
  try {
    const config = await WorkflowConfig.findOne({
      tenantId: req.tenantId,
      requestType: req.params.requestType,
      isDeleted: false
    });
    if (!config) return errorResponse(res, 'Workflow configuration not found', 404);
    return successResponse(res, config, 'Workflow configuration fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Workflow Request Controllers
// ==========================================
const getMyApprovals = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const query = {
      tenantId: req.tenantId,
      status: 'PENDING',
      isDeleted: false,
      levels: {
        $elemMatch: {
          approverId: req.user.userId,
          status: 'PENDING',
          order: { $exists: true } // Controlled via currentLevel check
        }
      }
    };

    const allRequests = await WorkflowRequest.find(query)
      .populate('requestedBy', 'email')
      .populate('requestedByEmployeeId', 'personal.firstName personal.lastName employeeId')
      .populate('referenceId')
      .sort({ createdAt: -1 });

    // Filter where currentLevel matches user's pending level order
    const filteredRequests = allRequests.filter(reqDoc => {
      const activeLvl = reqDoc.levels.find(l => l.status === 'PENDING' && l.order === reqDoc.currentLevel);
      return activeLvl && activeLvl.approverId.toString() === req.user.userId.toString();
    });

    const total = filteredRequests.length;
    const paginated = filteredRequests.slice(skip, skip + limit);

    return paginatedResponse(res, paginated, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const getWorkflowRequest = async (req, res, next) => {
  try {
    const request = await WorkflowRequest.findOne({ _id: req.params.id, tenantId: req.tenantId, isDeleted: false })
      .populate('requestedBy', 'email')
      .populate('requestedByEmployeeId', 'personal.firstName personal.lastName employeeId')
      .populate('referenceId')
      .populate('levels.approverId', 'email');
      
    if (!request) return errorResponse(res, 'Workflow request not found', 404);
    return successResponse(res, request, 'Workflow request details fetched successfully');
  } catch (error) {
    next(error);
  }
};

const approve = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const request = await workflowService.approveLevel(req.tenantId, req.params.id, req.user.userId, comment);
    
    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'APPROVE',
      resourceType: 'WorkflowRequest',
      resourceId: request._id,
      after: { status: request.status, currentLevel: request.currentLevel },
      req
    });

    return successResponse(res, request, 'Workflow approved successfully');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

const reject = async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment) return errorResponse(res, 'Rejection comment is required', 400);

    const request = await workflowService.rejectLevel(req.tenantId, req.params.id, req.user.userId, comment);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'REJECT',
      resourceType: 'WorkflowRequest',
      resourceId: request._id,
      after: { status: request.status, rejectionReason: comment },
      req
    });

    return successResponse(res, request, 'Workflow rejected successfully');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

const cancel = async (req, res, next) => {
  try {
    const request = await WorkflowRequest.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      requestedBy: req.user.userId,
      status: 'PENDING',
      isDeleted: false
    });

    if (!request) {
      return errorResponse(res, 'Workflow request not found or not in pending state', 404);
    }

    request.status = 'CANCELLED';
    request.completedAt = new Date();
    await request.save();

    // Revert source models if applicable
    if (request.requestType === 'LEAVE_REQUEST') {
      const LeaveRequest = require('../leave/leaveRequest.model');
      await LeaveRequest.findByIdAndUpdate(request.referenceId, { status: 'CANCELLED' });
    } else if (request.requestType === 'ATTENDANCE_REGULARIZATION') {
      const RegularizationRequest = require('../attendance/regularizationRequest.model');
      await RegularizationRequest.findByIdAndUpdate(request.referenceId, { status: 'REJECTED' });
    }

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'WorkflowRequest',
      resourceId: request._id,
      after: { status: 'CANCELLED' },
      req
    });

    return successResponse(res, request, 'Workflow request cancelled successfully');
  } catch (error) {
    next(error);
  }
};

const delegate = async (req, res, next) => {
  try {
    const { delegateToUserId, reason } = req.body;
    if (!delegateToUserId) return errorResponse(res, 'delegateToUserId is required', 400);

    const request = await WorkflowRequest.findOne({ _id: req.params.id, tenantId: req.tenantId, status: 'PENDING', isDeleted: false });
    if (!request) return errorResponse(res, 'Workflow request not found', 404);

    const activeLvl = request.levels.find(l => l.status === 'PENDING' && l.order === request.currentLevel);
    if (!activeLvl || activeLvl.approverId.toString() !== req.user.userId.toString()) {
      return errorResponse(res, 'You are not the current approver for this request', 403);
    }

    const delegateUser = await User.findOne({ _id: delegateToUserId, tenantId: req.tenantId, isActive: true, isDeleted: false });
    if (!delegateUser) return errorResponse(res, 'Delegate user not found or inactive', 404);

    activeLvl.approverId = delegateUser._id;
    activeLvl.approverName = delegateUser.email;
    activeLvl.comment = `Delegated by original approver. Reason: ${reason || 'N/A'}`;
    await request.save();

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'WorkflowRequest',
      resourceId: request._id,
      after: { action: 'Delegated', delegateTo: delegateUser.email },
      req
    });

    return successResponse(res, request, 'Workflow delegated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConfig,
  getConfigs,
  updateConfig,
  getConfigByType,
  getMyApprovals,
  getWorkflowRequest,
  approve,
  reject,
  cancel,
  delegate
};
