const WorkflowConfig = require('./workflowConfig.model');
const WorkflowRequest = require('./workflowRequest.model');
const Employee = require('../employee/employee.model');
const User = require('../auth/auth.model');
const auditService = require('../../audit/audit.service');

// Evaluate custom config rules
const evaluateCondition = (metadata, condition) => {
  if (!metadata || !condition || !condition.field) return false;
  const fieldValue = metadata[condition.field];
  if (fieldValue === undefined) return false;

  const condVal = condition.value;
  switch (condition.operator) {
    case 'GT': return Number(fieldValue) > Number(condVal);
    case 'LT': return Number(fieldValue) < Number(condVal);
    case 'EQ': return String(fieldValue) === String(condVal);
    case 'GTE': return Number(fieldValue) >= Number(condVal);
    case 'LTE': return Number(fieldValue) <= Number(condVal);
    default: return false;
  }
};

// Resolve the actual User ID of the approver
const resolveApproverUserId = async (tenantId, employeeId, levelConfig) => {
  const { approverType, approverId, approverRole } = levelConfig;

  if (approverType === 'SPECIFIC_USER') {
    return approverId;
  }

  if (approverType === 'REPORTING_MANAGER') {
    const emp = await Employee.findOne({ _id: employeeId, tenantId, isDeleted: false });
    if (!emp || !emp.employment?.reportingManagerId) {
      // Fallback: search for first active HR_ADMIN in tenant
      const admin = await User.findOne({ tenantId, role: 'HR_ADMIN', isActive: true, isDeleted: false });
      return admin ? admin._id : null;
    }
    const managerEmp = await Employee.findOne({ _id: emp.employment.reportingManagerId, tenantId, isDeleted: false });
    return managerEmp ? managerEmp.userId : null;
  }

  if (approverType === 'SKIP_MANAGER') {
    const emp = await Employee.findOne({ _id: employeeId, tenantId, isDeleted: false });
    if (!emp || !emp.employment?.reportingManagerId) {
      const admin = await User.findOne({ tenantId, role: 'HR_ADMIN', isActive: true, isDeleted: false });
      return admin ? admin._id : null;
    }
    const managerEmp = await Employee.findOne({ _id: emp.employment.reportingManagerId, tenantId, isDeleted: false });
    if (!managerEmp || !managerEmp.employment?.reportingManagerId) {
      return managerEmp ? managerEmp.userId : null;
    }
    const skipManagerEmp = await Employee.findOne({ _id: managerEmp.employment.reportingManagerId, tenantId, isDeleted: false });
    return skipManagerEmp ? skipManagerEmp.userId : null;
  }

  if (approverType === 'HR_ADMIN') {
    const admin = await User.findOne({ tenantId, role: 'HR_ADMIN', isActive: true, isDeleted: false });
    return admin ? admin._id : null;
  }

  if (approverType === 'ROLE') {
    const user = await User.findOne({ tenantId, role: approverRole, isActive: true, isDeleted: false });
    return user ? user._id : null;
  }

  return null;
};

const createWorkflowRequest = async (tenantId, requestType, referenceId, referenceModel, requestedByUserId, requestedByEmployeeId, metadata) => {
  // 1. Fetch Config
  const config = await WorkflowConfig.findOne({ tenantId, requestType, isActive: true, isDeleted: false });
  if (!config) {
    throw new Error(`WorkflowConfig not found or active for request type: ${requestType}`);
  }

  const resolvedLevels = [];
  const requesterUser = await User.findById(requestedByUserId);
  const requesterRole = requesterUser ? requesterUser.role : 'EMPLOYEE';

  if (requestType === 'LEAVE_REQUEST') {
    if (requesterRole === 'MANAGER' || requesterRole === 'HR_ADMIN') {
      // HR and Manager requests go to CEO (LEADERSHIP)
      const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP', isActive: true, isDeleted: false });
      if (leadershipUsers.length === 0) {
        throw new Error('No active LEADERSHIP user found to approve this leave request.');
      }
      resolvedLevels.push({
        order: 1,
        approverId: leadershipUsers[0]._id,
        approverName: leadershipUsers[0].email,
        status: 'PENDING',
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    } else {
      // Standard employee requests go to team manager (Level 1) and HR (Level 2)
      let managerUserId = null;
      let managerEmail = 'Manager';
      const emp = await Employee.findOne({ _id: requestedByEmployeeId, tenantId, isDeleted: false });
      if (emp && emp.employment?.reportingManagerId) {
        const managerEmp = await Employee.findOne({ _id: emp.employment.reportingManagerId, tenantId, isDeleted: false });
        if (managerEmp && managerEmp.userId) {
          managerUserId = managerEmp.userId;
          const managerUser = await User.findById(managerUserId);
          if (managerUser) {
            managerEmail = managerUser.email;
          }
        }
      }

      const hrUsers = await User.find({ tenantId, role: 'HR_ADMIN', isActive: true, isDeleted: false });
      if (hrUsers.length === 0) {
        throw new Error('No active HR_ADMIN user found to approve this leave request.');
      }
      const hrUser = hrUsers[0];

      if (managerUserId && managerUserId.toString() !== hrUser._id.toString()) {
        resolvedLevels.push({
          order: 1,
          approverId: managerUserId,
          approverName: managerEmail,
          status: 'PENDING',
          slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        resolvedLevels.push({
          order: 2,
          approverId: hrUser._id,
          approverName: hrUser.email,
          status: 'PENDING',
          slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000)
        });
      } else {
        resolvedLevels.push({
          order: 1,
          approverId: hrUser._id,
          approverName: hrUser.email,
          status: 'PENDING',
          slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      }
    }
  } else {
    // 2. Build Levels List
    const levelsToEvaluate = [...config.levels];

    // Evaluate conditions for extra approval levels
    if (config.conditions && config.conditions.length > 0) {
      for (const cond of config.conditions) {
        if (evaluateCondition(metadata, cond)) {
          levelsToEvaluate.push(...cond.additionalLevels);
        }
      }
    }

    // 3. Resolve Approver User IDs
    for (let i = 0; i < levelsToEvaluate.length; i++) {
      const lvl = levelsToEvaluate[i];
      const approverUserId = await resolveApproverUserId(tenantId, requestedByEmployeeId, lvl);
      if (!approverUserId) {
        throw new Error(`Could not resolve approver user ID for order ${lvl.order || i + 1}`);
      }

      const approverUser = await User.findById(approverUserId);
      resolvedLevels.push({
        order: lvl.order || (i + 1),
        approverId: approverUserId,
        approverName: approverUser ? approverUser.email : 'Approver',
        status: 'PENDING',
        slaDeadline: new Date(Date.now() + (lvl.slaHours || 24) * 60 * 60 * 1000)
      });
    }
  }

  // 4. Create Workflow Request
  const request = new WorkflowRequest({
    tenantId,
    requestType,
    referenceId,
    referenceModel,
    requestedBy: requestedByUserId,
    requestedByEmployeeId,
    levels: resolvedLevels,
    currentLevel: 1,
    metadata,
    status: 'PENDING',
    createdBy: requestedByUserId
  });

  await request.save();

  // 5. Notify Level 1 Approver (or all LEADERSHIP users if Manager/HR Leave)
  const notificationService = require('../notification/notification.service');
  const isManagerOrHR = requesterRole === 'MANAGER' || requesterRole === 'HR_ADMIN';
  if (requestType === 'LEAVE_REQUEST' && isManagerOrHR) {
    const leadershipUsers = await User.find({ tenantId, role: 'LEADERSHIP', isActive: true, isDeleted: false });
    for (const leader of leadershipUsers) {
      await notificationService.sendNotification(tenantId, leader._id, 'APPROVAL_PENDING', {
        requestType,
        requestedBy: requestedByUserId
      });
    }
  } else if (resolvedLevels.length > 0) {
    await notificationService.sendNotification(tenantId, resolvedLevels[0].approverId, 'APPROVAL_PENDING', {
      requestType,
      requestedBy: requestedByUserId
    });
  }

  return request;
};

const approveLevel = async (tenantId, workflowRequestId, approverId, comment) => {
  const request = await WorkflowRequest.findOne({ _id: workflowRequestId, tenantId, status: 'PENDING', isDeleted: false });
  if (!request) {
    throw new Error('WorkflowRequest not found or not pending.');
  }

  const levelIndex = request.levels.findIndex(l => l.order === request.currentLevel && l.status === 'PENDING');
  if (levelIndex === -1) {
    throw new Error('Active pending level not found for this request.');
  }

  const level = request.levels[levelIndex];
  if (level.approverId.toString() !== approverId.toString()) {
    throw new Error('Access Denied: You are not the current level approver.');
  }

  // Update level status
  level.status = 'APPROVED';
  level.comment = comment;
  level.actionAt = new Date();

  // Find next level
  const nextLevelIndex = request.levels.findIndex(l => l.order === request.currentLevel + 1);
  if (nextLevelIndex !== -1) {
    request.currentLevel += 1;
    const nextLevel = request.levels[nextLevelIndex];
    nextLevel.notifiedAt = new Date();
    await request.save();

    // Notify next approver
    const notificationService = require('../notification/notification.service');
    await notificationService.sendNotification(tenantId, nextLevel.approverId, 'APPROVAL_PENDING', {
      requestType: request.requestType,
      requestedBy: request.requestedBy
    });
  } else {
    // End of workflow approval
    request.status = 'APPROVED';
    request.completedAt = new Date();
    await request.save();

    // Invoke module approval complete callback
    await onApprovalComplete(request);

    // Notify requester
    const notificationService = require('../notification/notification.service');
    await notificationService.sendNotification(tenantId, request.requestedBy, 'LEAVE_APPROVED', {
      requestType: request.requestType
    });
  }

  return request;
};

const rejectLevel = async (tenantId, workflowRequestId, approverId, comment) => {
  const request = await WorkflowRequest.findOne({ _id: workflowRequestId, tenantId, status: 'PENDING', isDeleted: false });
  if (!request) {
    throw new Error('WorkflowRequest not found or not pending.');
  }

  const levelIndex = request.levels.findIndex(l => l.order === request.currentLevel && l.status === 'PENDING');
  if (levelIndex === -1) {
    throw new Error('Active pending level not found for this request.');
  }

  const level = request.levels[levelIndex];
  if (level.approverId.toString() !== approverId.toString()) {
    throw new Error('Access Denied: You are not the current level approver.');
  }

  level.status = 'REJECTED';
  level.comment = comment;
  level.actionAt = new Date();

  request.status = 'REJECTED';
  request.rejectionReason = comment;
  request.completedAt = new Date();
  await request.save();

  // Invoke rejection callbacks
  await onRejectionComplete(request);

  // Notify requester
  const notificationService = require('../notification/notification.service');
  await notificationService.sendNotification(tenantId, request.requestedBy, 'LEAVE_REJECTED', {
    requestType: request.requestType,
    reason: comment
  });

  return request;
};

// Route callback complete routines
const onApprovalComplete = async (workflowRequest) => {
  const { requestType, referenceId, tenantId } = workflowRequest;

  if (requestType === 'LEAVE_REQUEST') {
    const leaveService = require('../leave/leave.service');
    await leaveService.handleLeaveApproved(referenceId);
  } else if (requestType === 'ATTENDANCE_REGULARIZATION') {
    const attendanceService = require('../attendance/attendance.service');
    await attendanceService.handleRegularizationApproved(referenceId);
  } else if (requestType === 'SENSITIVE_DATA_CHANGE') {
    const employeeService = require('../employee/employee.service');
    await employeeService.handleSensitiveDataApproved(workflowRequest);
  } else if (requestType === 'EMPLOYEE_TRANSFER') {
    const Employee = require('../employee/employee.model');
    const meta = workflowRequest.metadata;
    await Employee.findOneAndUpdate(
      { _id: referenceId, tenantId },
      {
        'employment.departmentId': meta.departmentId,
        'employment.locationId': meta.locationId,
        'employment.reportingManagerId': meta.reportingManagerId
      }
    );
  } else if (requestType === 'EMPLOYEE_PROMOTION') {
    const Employee = require('../employee/employee.model');
    const meta = workflowRequest.metadata;
    await Employee.findOneAndUpdate(
      { _id: referenceId, tenantId },
      {
        'employment.designationId': meta.designationId,
        'employment.gradeId': meta.gradeId
      }
    );
  } else if (requestType === 'LEAVE_WITHDRAWAL') {
    const leaveService = require('../leave/leave.service');
    await leaveService.handleLeaveWithdrawalApproved(referenceId);
  }
};

const onRejectionComplete = async (workflowRequest) => {
  const { requestType, referenceId } = workflowRequest;

  if (requestType === 'LEAVE_REQUEST') {
    const LeaveRequest = require('../leave/leaveRequest.model');
    await LeaveRequest.findByIdAndUpdate(referenceId, { status: 'REJECTED' });
  } else if (requestType === 'ATTENDANCE_REGULARIZATION') {
    const RegularizationRequest = require('../attendance/regularizationRequest.model');
    await RegularizationRequest.findByIdAndUpdate(referenceId, { status: 'REJECTED' });
  } else if (requestType === 'LEAVE_WITHDRAWAL') {
    const LeaveRequest = require('../leave/leaveRequest.model');
    await LeaveRequest.findByIdAndUpdate(referenceId, { status: 'APPROVED' }); // revert back to approved
  }
};

// Escalation checker
const checkSLABreaches = async () => {
  try {
    const now = new Date();
    const breachedRequests = await WorkflowRequest.find({
      status: 'PENDING',
      'levels': { $elemMatch: { status: 'PENDING', slaDeadline: { $lt: now } } },
      isDeleted: false
    });

    for (const request of breachedRequests) {
      const levelIndex = request.levels.findIndex(l => l.order === request.currentLevel && l.status === 'PENDING');
      if (levelIndex === -1) continue;

      const level = request.levels[levelIndex];
      level.status = 'ESCALATED';
      request.status = 'ESCALATED';
      await request.save();

      // Send escalations to tenant HR Admin
      const hrAdmin = await User.findOne({ tenantId: request.tenantId, role: 'HR_ADMIN', isActive: true, isDeleted: false });
      const notificationService = require('../notification/notification.service');
      if (hrAdmin) {
        await notificationService.sendNotification(request.tenantId, hrAdmin._id, 'SLA_BREACH', {
          requestId: request._id,
          originalApprover: level.approverName
        });
      }
    }
  } catch (error) {
    console.error('SLA Breaches check error:', error);
  }
};

module.exports = {
  createWorkflowRequest,
  approveLevel,
  rejectLevel,
  checkSLABreaches
};
