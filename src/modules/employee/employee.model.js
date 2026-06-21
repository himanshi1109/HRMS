const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeId: { type: String, required: true },
    status: {
      type: String,
      enum: ['ONBOARDING', 'ACTIVE', 'ON_PROBATION', 'CONFIRMED', 'SUSPENDED', 'EXITED'],
      default: 'ONBOARDING'
    },

    personal: {
      firstName: { type: String, required: true },
      middleName: { type: String },
      lastName: { type: String, required: true },
      dateOfBirth: { type: Date },
      gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']
      },
      maritalStatus: {
        type: String,
        enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']
      },
      nationality: { type: String },
      bloodGroup: { type: String },
      photo: { type: String }, // Local file path
      address: { type: String }
    },

    contact: {
      personalEmail: { type: String },
      officialEmail: { type: String },
      personalPhone: { type: String },
      workPhone: { type: String },
      currentAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String }
      },
      permanentAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pincode: { type: String }
      },
      emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String },
        email: { type: String }
      }
    },

    employment: {
      dateOfJoining: { type: Date },
      dateOfConfirmation: { type: Date },
      probationEndDate: { type: Date },
      employmentType: {
        type: String,
        enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'CONSULTANT']
      },
      departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
      designationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
      gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' },
      locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
      reportingManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      secondaryManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' }, // Will reference Shift model
      weeklyOffDays: { type: [Number], default: [0, 6] }, // Array of numbers: 0=Sun, 6=Sat
      salary: { type: Number, default: 0 } // Annual CTC in INR
    },

    statutory: {
      bankName: { type: String },
      bankAccountNumber: { type: String },
      ifscCode: { type: String },
      panNumber: { type: String },
      aadhaarNumber: { type: String },
      pfNumber: { type: String },
      esiNumber: { type: String },
      uanNumber: { type: String },
      taxRegime: {
        type: String,
        enum: ['OLD', 'NEW']
      }
    },

    professional: {
      education: [
        {
          degree: { type: String },
          institution: { type: String },
          year: { type: Number },
          grade: { type: String }
        }
      ],
      experience: [
        {
          company: { type: String },
          designation: { type: String },
          from: { type: Date },
          to: { type: Date },
          description: { type: String }
        }
      ],
      skills: [String],
      certifications: [
        {
          name: { type: String },
          issuer: { type: String },
          date: { type: Date },
          expiryDate: { type: Date },
          documentUrl: { type: String }
        }
      ]
    },

    documents: [
      {
        type: { type: String }, // e.g. "RESUME", "CONTRACT", "PAYSLIP", etc.
        name: { type: String },
        filePath: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        verifiedAt: { type: Date },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isDeleted: { type: Boolean, default: false } // Subdocument soft-delete
      }
    ],

    exit: {
      exitDate: { type: Date },
      exitType: {
        type: String,
        enum: ['RESIGNED', 'TERMINATED', 'RETIRED', 'ABSCONDED', 'CONTRACT_END']
      },
      reason: { type: String },
      noticePeriodDays: { type: Number },
      lastWorkingDate: { type: Date },
      rehireEligible: { type: Boolean },
      exitInterviewNotes: { type: String },
      finalSettlementDone: { type: Boolean, default: false }
    },

    // Base fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Create compound indexes as requested
employeeSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });
employeeSchema.index({ tenantId: 1, 'employment.departmentId': 1 });
employeeSchema.index({ tenantId: 1, 'employment.reportingManagerId': 1 });
employeeSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
