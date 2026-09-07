const mongoose = require('mongoose');
const { INTERVIEW_TYPE, INTERVIEW_STATUS } = require('../utils/constants');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
    fresher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: [true, 'Interview date is required']
    },
    time: {
      type: String,
      required: [true, 'Interview time is required'],
      trim: true
    },
    durationMinutes: {
      type: Number,
      default: 45
    },
    meetingLink: {
      type: String,
      required: [true, 'Meeting link is required'],
      trim: true
    },
    interviewType: {
      type: String,
      enum: Object.values(INTERVIEW_TYPE),
      default: INTERVIEW_TYPE.TECHNICAL
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(INTERVIEW_STATUS),
      default: INTERVIEW_STATUS.SCHEDULED
    }
  },
  {
    timestamps: true
  }
);

interviewSchema.index({ fresher: 1, date: 1 });
interviewSchema.index({ company: 1, date: 1 });
interviewSchema.index({ application: 1 });

const Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;
