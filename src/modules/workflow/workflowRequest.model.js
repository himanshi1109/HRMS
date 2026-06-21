const mongoose = require('mongoose');

const workflowRequestSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    requestType: {
      type: String,
      enum: [
        'LEAVE_REQUEST',
        'ATTENDANCE_REGULARIZATION',
        'SENSITIVE_DATA_CHANGE',
        'EMPLOYEE_TRANSFER',
        'EMPLOYEE_PROMOTION',
        'EMPLOYEE_EXIT',
        'LEAVE_WITHDRAWAL'
      ],
      required: true
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'referenceModel', required: true },
    referenceModel: { type: String, required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedByEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ESCALATED'],
      default: 'PENDING',
      index: true
    },
    currentLevel: { type: Number, default: 1 },
    levels: [
      {
        order: { type: Number, required: true },
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        approverName: { type: String },
        status: {
          type: String,
          enum: ['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED'],
          default: 'PENDING'
        },
        comment: { type: String },
        actionAt: { type: Date },
        notifiedAt: { type: Date, default: Date.now },
        slaDeadline: { type: Date }
      }
    ],
    completedAt: { type: Date },
    rejectionReason: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Arbitrary extra context

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkflowRequest', workflowRequestSchema);
