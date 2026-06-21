const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeavePolicy' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationDays: { type: Number, required: true },
    durationType: {
      type: String,
      enum: ['FULL_DAY', 'HALF_DAY_MORNING', 'HALF_DAY_AFTERNOON', 'HOURLY'],
      default: 'FULL_DAY'
    },
    startTime: { type: String }, // e.g. "09:00" for HOURLY
    endTime: { type: String }, // e.g. "13:00"
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true
    },
    workflowRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowRequest' },
    approverComments: [
      {
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String },
        action: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    lopDays: { type: Number, default: 0 },
    attendanceUpdated: { type: Boolean, default: false },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
