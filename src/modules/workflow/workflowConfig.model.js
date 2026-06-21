const mongoose = require('mongoose');

const workflowConfigSchema = new mongoose.Schema(
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
    levels: [
      {
        order: { type: Number, required: true },
        approverType: {
          type: String,
          enum: ['REPORTING_MANAGER', 'SKIP_MANAGER', 'HR_ADMIN', 'SPECIFIC_USER', 'ROLE'],
          required: true
        },
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approverRole: { type: String },
        slaHours: { type: Number, default: 24 }
      }
    ],
    conditions: [
      {
        field: { type: String },
        operator: {
          type: String,
          enum: ['GT', 'LT', 'EQ', 'GTE', 'LTE']
        },
        value: { type: mongoose.Schema.Types.Mixed },
        additionalLevels: [
          {
            order: { type: Number },
            approverType: {
              type: String,
              enum: ['REPORTING_MANAGER', 'SKIP_MANAGER', 'HR_ADMIN', 'SPECIFIC_USER', 'ROLE']
            },
            approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            approverRole: { type: String },
            slaHours: { type: Number, default: 24 }
          }
        ]
      }
    ],
    isActive: { type: Boolean, default: true },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Unique config per request type per tenant
workflowConfigSchema.index({ tenantId: 1, requestType: 1 }, { unique: true });

module.exports = mongoose.model('WorkflowConfig', workflowConfigSchema);
