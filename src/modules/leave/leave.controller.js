const LeaveType = require('./leaveType.model');
const LeavePolicy = require('./leavePolicy.model');
const LeaveBalance = require('./leaveBalance.model');
const LeaveRequest = require('./leaveRequest.model');
const Employee = require('../employee/employee.model');
const leaveService = require('./leave.service');
const workflowService = require('../workflow/workflow.service');
const auditService = require('../../audit/audit.service');
const { getPagination } = require('../../utils/pagination');
const { successResponse, errorResponse, paginatedResponse } = require('../../utils/response');

// ==========================================
// Leave Type Controllers
// ==========================================
const createLeaveType = async (req, res, next) => {
  try {
    const type = new LeaveType({
      ...req.body,
      tenantId: req.tenantId,
      createdBy: req.user.userId
    });
    await type.save();
    return successResponse(res, type, 'Leave type created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getLeaveTypes = async (req, res, next) => {
  try {
    const list = await LeaveType.find({ tenantId: req.tenantId, isDeleted: false });
    return successResponse(res, list, 'Leave types list fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getLeaveTypeById = async (req, res, next) => {
  try {
    const type = await LeaveType.findOne({ _id: req.params.id, tenantId: req.tenantId, isDeleted: false });
    if (!type) return errorResponse(res, 'Leave type not found', 404);
    return successResponse(res, type, 'Leave type details fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateLeaveType = async (req, res, next) => {
  try {
    const type = await LeaveType.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      { ...req.body, updatedBy: req.user.userId },
      { new: true }
    );
    if (!type) return errorResponse(res, 'Leave type not found', 404);
    return successResponse(res, type, 'Leave type updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteLeaveType = async (req, res, next) => {
  try {
    const type = await LeaveType.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), updatedBy: req.user.userId },
      { new: true }
    );
    if (!type) return errorResponse(res, 'Leave type not found', 404);
    return successResponse(res, null, 'Leave type deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Leave Policy Controllers
// ==========================================
const createLeavePolicy = async (req, res, next) => {
  try {
    const policy = new LeavePolicy({
      ...req.body,
      tenantId: req.tenantId,
      createdBy: req.user.userId
    });
    await policy.save();
    return successResponse(res, policy, 'Leave policy created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const getLeavePolicies = async (req, res, next) => {
  try {
    const list = await LeavePolicy.find({ tenantId: req.tenantId, isDeleted: false }).populate('leaveTypeId', 'name code');
    return successResponse(res, list, 'Leave policies list fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getLeavePolicyById = async (req, res, next) => {
  try {
    const policy = await LeavePolicy.findOne({ _id: req.params.id, tenantId: req.tenantId, isDeleted: false }).populate('leaveTypeId', 'name code');
    if (!policy) return errorResponse(res, 'Leave policy not found', 404);
    return successResponse(res, policy, 'Leave policy details fetched successfully');
  } catch (error) {
    next(error);
  }
};

const updateLeavePolicy = async (req, res, next) => {
  try {
    const policy = await LeavePolicy.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      { ...req.body, updatedBy: req.user.userId },
      { new: true }
    );
    if (!policy) return errorResponse(res, 'Leave policy not found', 404);
    return successResponse(res, policy, 'Leave policy updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteLeavePolicy = async (req, res, next) => {
  try {
    const policy = await LeavePolicy.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), updatedBy: req.user.userId },
      { new: true }
    );
    if (!policy) return errorResponse(res, 'Leave policy not found', 404);
    return successResponse(res, null, 'Leave policy deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Leave Balance Controllers
// ==========================================
const getMyBalances = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const year = new Date().getFullYear();
    let balances = await LeaveBalance.find({ tenantId: req.tenantId, employeeId, year }).populate('leaveTypeId', 'name code category isPaid');
    
    if (balances.length === 0) {
      const policies = await LeavePolicy.find({ tenantId: req.tenantId, isActive: true, isDeleted: false });
      for (const policy of policies) {
        const eligible = await leaveService.checkEligibility(req.tenantId, employeeId, policy);
        if (!eligible) continue;

        const bal = new LeaveBalance({
          tenantId: req.tenantId,
          employeeId,
          leaveTypeId: policy.leaveTypeId,
          year,
          openingBalance: policy.accrualAmount,
          accrued: 0,
          availed: 0,
          lopDays: 0,
          carriedForward: 0,
          encashed: 0
        });
        await bal.save();
      }
      balances = await LeaveBalance.find({ tenantId: req.tenantId, employeeId, year }).populate('leaveTypeId', 'name code category isPaid');
    }
    
    return successResponse(res, balances, 'Leave balances fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getEmployeeBalances = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    let balances = await LeaveBalance.find({
      tenantId: req.tenantId,
      employeeId: req.params.id,
      year
    }).populate('leaveTypeId', 'name code category isPaid');
    
    if (balances.length === 0) {
      const policies = await LeavePolicy.find({ tenantId: req.tenantId, isActive: true, isDeleted: false });
      for (const policy of policies) {
        const eligible = await leaveService.checkEligibility(req.tenantId, req.params.id, policy);
        if (!eligible) continue;

        const bal = new LeaveBalance({
          tenantId: req.tenantId,
          employeeId: req.params.id,
          leaveTypeId: policy.leaveTypeId,
          year,
          openingBalance: policy.accrualAmount,
          accrued: 0,
          availed: 0,
          lopDays: 0,
          carriedForward: 0,
          encashed: 0
        });
        await bal.save();
      }
      balances = await LeaveBalance.find({
        tenantId: req.tenantId,
        employeeId: req.params.id,
        year
      }).populate('leaveTypeId', 'name code category isPaid');
    }
    
    return successResponse(res, balances, 'Leave balances fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getTeamBalances = async (req, res, next) => {
  try {
    const managerId = req.user.employeeId;
    if (!managerId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const team = await Employee.find({ tenantId: req.tenantId, 'employment.reportingManagerId': managerId, isDeleted: false });
    const teamIds = team.map(e => e._id);
    const year = new Date().getFullYear();

    const balances = await LeaveBalance.find({
      tenantId: req.tenantId,
      employeeId: { $in: teamIds },
      year
    })
      .populate('employeeId', 'personal.firstName personal.lastName employeeId')
      .populate('leaveTypeId', 'name code category');

    return successResponse(res, balances, 'Team leave balances fetched successfully');
  } catch (error) {
    next(error);
  }
};

const adjustBalance = async (req, res, next) => {
  try {
    const { amount, reason, year } = req.body; // amount can be positive or negative
    const balance = await LeaveBalance.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { $inc: { accrued: amount }, updatedBy: req.user.userId },
      { new: true }
    );

    if (!balance) return errorResponse(res, 'Leave balance entry not found', 404);

    await auditService.log({
      tenantId: req.tenantId,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'UPDATE',
      resourceType: 'LeaveBalance',
      resourceId: balance._id,
      after: { action: 'Balance adjustment', amount, reason },
      req
    });

    return successResponse(res, balance, 'Leave balance adjusted successfully');
  } catch (error) {
    next(error);
  }
};

const accrueBalances = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const employees = await Employee.find({ tenantId: req.tenantId, status: 'ACTIVE', isDeleted: false });
    const policies = await LeavePolicy.find({ tenantId: req.tenantId, isActive: true, isDeleted: false });

    let count = 0;
    for (const emp of employees) {
      for (const policy of policies) {
        // Validate eligibility
        const eligible = await leaveService.checkEligibility(req.tenantId, emp._id, policy);
        if (!eligible) continue;

        if (policy.accrualType === 'MONTHLY') {
          await LeaveBalance.findOneAndUpdate(
            { tenantId: req.tenantId, employeeId: emp._id, leaveTypeId: policy.leaveTypeId, year },
            { $inc: { accrued: policy.accrualAmount } },
            { upsert: true, new: true }
          );
          count++;
        }
      }
    }

    return successResponse(res, { accruedCount: count }, 'Monthly leave accrual processed successfully');
  } catch (error) {
    next(error);
  }
};

const yearEndProcess = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const employees = await Employee.find({ tenantId: req.tenantId, status: 'ACTIVE', isDeleted: false });
    const policies = await LeavePolicy.find({ tenantId: req.tenantId, isActive: true, isDeleted: false });

    for (const emp of employees) {
      for (const policy of policies) {
        const balance = await LeaveBalance.findOne({
          tenantId: req.tenantId,
          employeeId: emp._id,
          leaveTypeId: policy.leaveTypeId,
          year: currentYear
        });

        if (balance) {
          const currentVal = balance.openingBalance + balance.accrued - balance.availed - balance.lopDays;
          // Apply carry-forward limit
          const carryForward = Math.min(currentVal, policy.carryForwardLimit || 0);

          // Create next year balance
          await LeaveBalance.findOneAndUpdate(
            { tenantId: req.tenantId, employeeId: emp._id, leaveTypeId: policy.leaveTypeId, year: nextYear },
            {
              openingBalance: carryForward,
              carriedForward: carryForward,
              accrued: 0,
              availed: 0,
              lopDays: 0
            },
            { upsert: true }
          );
        }
      }
    }

    return successResponse(res, null, 'Year end leave balance carry forward processing completed');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Leave Request Controllers
// ==========================================
const applyLeave = async (req, res, next) => {
  try {
    const { leaveTypeId, leaveTypeCode, startDate, endDate, durationType, isHalfDay, reason } = req.body;
    const employeeId = req.user.employeeId;

    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    // Resolve leaveTypeId from leaveTypeCode if not provided
    let resolvedLeaveTypeId = leaveTypeId;
    if (!resolvedLeaveTypeId && leaveTypeCode) {
      const typeDoc = await LeaveType.findOne({ tenantId: req.tenantId, code: leaveTypeCode.toUpperCase(), isDeleted: false });
      if (typeDoc) {
        resolvedLeaveTypeId = typeDoc._id;
      }
    }

    if (!resolvedLeaveTypeId) {
      return errorResponse(res, 'Invalid or missing leave type identifier', 400);
    }

    // Resolve durationType from isHalfDay if not provided
    let resolvedDurationType = durationType;
    if (!resolvedDurationType) {
      resolvedDurationType = isHalfDay ? 'HALF_DAY_MORNING' : 'FULL_DAY';
    }

    // Fetch employee detail for grade check
    const employee = await Employee.findOne({ _id: employeeId, tenantId: req.tenantId, isDeleted: false });
    if (!employee) return errorResponse(res, 'Employee profile not found', 404);

    // 1. Fetch matching policy
    const policy = await LeavePolicy.findOne({
      tenantId: req.tenantId,
      leaveTypeId: resolvedLeaveTypeId,
      isActive: true,
      isDeleted: false
    });

    if (!policy) return errorResponse(res, 'No active leave policy configured for this leave type', 400);

    // Check Eligibility
    const eligible = await leaveService.checkEligibility(req.tenantId, employeeId, policy);
    if (!eligible) return errorResponse(res, 'You are not eligible for this leave type under current policy config', 400);

    // Calculate duration
    const durationDays = await leaveService.calculateLeaveDuration(req.tenantId, employeeId, startDate, endDate, resolvedDurationType);
    if (durationDays === 0) return errorResponse(res, 'Leave duration is 0 working days', 400);

    // Check overlaps
    const overlap = await leaveService.checkOverlap(req.tenantId, employeeId, startDate, endDate);
    if (overlap) return errorResponse(res, 'Overlapping leave request already exists in pending/approved state', 409);

    // Check balances
    const year = new Date(startDate).getFullYear();
    const currentBalance = await leaveService.getBalance(req.tenantId, employeeId, resolvedLeaveTypeId, year);
    
    if (currentBalance < durationDays && !policy.lopAfterBalanceExhausted) {
      return errorResponse(res, `Insufficient leave balance. Available: ${currentBalance} days`, 400);
    }

    // Create LeaveRequest
    const leaveRequest = new LeaveRequest({
      tenantId: req.tenantId,
      employeeId,
      leaveTypeId: resolvedLeaveTypeId,
      policyId: policy._id,
      startDate,
      endDate,
      durationDays,
      durationType: resolvedDurationType,
      reason,
      status: 'PENDING',
      createdBy: req.user.userId
    });
    await leaveRequest.save();

    // Create WorkflowRequest
    const workflowReq = await workflowService.createWorkflowRequest(
      req.tenantId,
      'LEAVE_REQUEST',
      leaveRequest._id,
      'LeaveRequest',
      req.user.userId,
      employeeId,
      { durationDays, reason }
    );

    leaveRequest.workflowRequestId = workflowReq._id;
    await leaveRequest.save();

    return successResponse(res, leaveRequest, 'Leave application submitted successfully for approval');
  } catch (error) {
    next(error);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const list = await LeaveRequest.find({
      tenantId: req.tenantId,
      employeeId: req.user.employeeId,
      isDeleted: false
    })
      .populate('leaveTypeId', 'name code color')
      .sort({ createdAt: -1 });

    return successResponse(res, list, 'My leave requests fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getTeamRequests = async (req, res, next) => {
  try {
    const managerId = req.user.employeeId;
    if (!managerId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const team = await Employee.find({ tenantId: req.tenantId, 'employment.reportingManagerId': managerId, isDeleted: false });
    const teamIds = team.map(e => e._id);

    const list = await LeaveRequest.find({
      tenantId: req.tenantId,
      employeeId: { $in: teamIds },
      isDeleted: false
    })
      .populate('employeeId', 'personal.firstName personal.lastName employeeId')
      .populate('leaveTypeId', 'name code color')
      .sort({ createdAt: -1 });

    return successResponse(res, list, 'Team leave requests fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getAllRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, leaveTypeId } = req.query;
    const query = { tenantId: req.tenantId, isDeleted: false };

    if (status) query.status = status;
    if (leaveTypeId) query.leaveTypeId = leaveTypeId;

    const items = await LeaveRequest.find(query)
      .populate('employeeId', 'personal.firstName personal.lastName employeeId')
      .populate('leaveTypeId', 'name code color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LeaveRequest.countDocuments(query);
    return paginatedResponse(res, items, total, page, limit);
  } catch (error) {
    next(error);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await LeaveRequest.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      isDeleted: false
    })
      .populate('employeeId', 'personal.firstName personal.lastName employeeId')
      .populate('leaveTypeId', 'name code color');

    if (!request) return errorResponse(res, 'Leave request not found', 404);
    return successResponse(res, request, 'Leave request details fetched successfully');
  } catch (error) {
    next(error);
  }
};

const cancelRequest = async (req, res, next) => {
  try {
    const request = await LeaveRequest.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      employeeId: req.user.employeeId,
      status: 'PENDING',
      isDeleted: false
    });

    if (!request) {
      return errorResponse(res, 'Pending leave request not found', 404);
    }

    request.status = 'CANCELLED';
    await request.save();

    // Cancel workflow request
    if (request.workflowRequestId) {
      const WorkflowRequest = require('../workflow/workflowRequest.model');
      await WorkflowRequest.findByIdAndUpdate(request.workflowRequestId, { status: 'CANCELLED', completedAt: new Date() });
    }

    return successResponse(res, request, 'Leave request cancelled successfully');
  } catch (error) {
    next(error);
  }
};

const withdrawRequest = async (req, res, next) => {
  try {
    const request = await LeaveRequest.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      employeeId: req.user.employeeId,
      status: 'APPROVED',
      startDate: { $gt: new Date() }, // Future date only
      isDeleted: false
    });

    if (!request) {
      return errorResponse(res, 'Approved future leave request not found', 404);
    }

    // Create workflow request of type LEAVE_WITHDRAWAL
    const workflowReq = await workflowService.createWorkflowRequest(
      req.tenantId,
      'LEAVE_WITHDRAWAL',
      request._id,
      'LeaveRequest',
      req.user.userId,
      req.user.employeeId,
      { reason: 'Withdrawal of approved leave' }
    );

    return successResponse(res, {
      message: 'Leave withdrawal request submitted for approval',
      workflowRequestId: workflowReq._id
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Leave Calendar Controllers
// ==========================================
const getTeamCalendar = async (req, res, next) => {
  try {
    const { month } = req.query; // YYYY-MM
    const managerId = req.user.employeeId;

    if (!managerId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const team = await Employee.find({ tenantId: req.tenantId, 'employment.reportingManagerId': managerId, isDeleted: false });
    const teamIds = team.map(e => e._id);

    const query = {
      tenantId: req.tenantId,
      employeeId: { $in: teamIds },
      status: 'APPROVED',
      isDeleted: false
    };

    if (month) {
      const [year, m] = month.split('-').map(Number);
      query.startDate = { $lte: new Date(year, m, 0) };
      query.endDate = { $gte: new Date(year, m - 1, 1) };
    }

    const leaves = await LeaveRequest.find(query)
      .populate('employeeId', 'personal.firstName personal.lastName employeeId')
      .populate('leaveTypeId', 'name code color');

    return successResponse(res, leaves, 'Team leave calendar fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getMyCalendar = async (req, res, next) => {
  try {
    const { year } = req.query;
    const employeeId = req.user.employeeId;

    if (!employeeId) return errorResponse(res, 'User is not linked to an employee profile', 400);

    const query = {
      tenantId: req.tenantId,
      employeeId,
      status: 'APPROVED',
      isDeleted: false
    };

    if (year) {
      const y = Number(year);
      query.startDate = { $lte: new Date(y, 11, 31) };
      query.endDate = { $gte: new Date(y, 0, 1) };
    }

    const leaves = await LeaveRequest.find(query).populate('leaveTypeId', 'name code color');
    return successResponse(res, leaves, 'My leave calendar fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveType,
  getLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
  
  createLeavePolicy,
  getLeavePolicies,
  getLeavePolicyById,
  updateLeavePolicy,
  deleteLeavePolicy,
  
  getMyBalances,
  getEmployeeBalances,
  getTeamBalances,
  adjustBalance,
  accrueBalances,
  yearEndProcess,
  
  applyLeave,
  getMyRequests,
  getTeamRequests,
  getAllRequests,
  getRequestById,
  cancelRequest,
  withdrawRequest,
  
  getTeamCalendar,
  getMyCalendar
};
