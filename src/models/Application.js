const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../utils/constants');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    fresher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fresherProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FresherProfile'
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required for application']
    },
    coverLetter: {
      type: String,
      default: '',
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED
    },
    statusHistory: [statusHistorySchema],
    matchScore: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, fresher: 1 }, { unique: true });
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ fresher: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

// Automatically append to statusHistory when status changes on save
applicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      note: this.notes || `Status changed to ${this.status}`
    });
  }
  next();
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
