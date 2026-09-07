const mongoose = require('mongoose');
const {
  JOB_STATUS,
  JOB_VISIBILITY,
  WORK_MODE,
  EMPLOYMENT_TYPE
} = require('../utils/constants');

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    responsibilities: [
      {
        type: String,
        trim: true
      }
    ],
    qualifications: [
      {
        type: String,
        trim: true
      }
    ],
    requiredSkills: [
      {
        type: String,
        required: true,
        trim: true
      }
    ],
    preferredSkills: [
      {
        type: String,
        trim: true
      }
    ],
    education: {
      degree: { type: String, default: 'Bachelor' },
      field: { type: String, default: 'Computer Science or related' }
    },
    experience: {
      minYears: { type: Number, default: 0 },
      maxYears: { type: Number, default: 2 }
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    workMode: {
      type: String,
      enum: Object.values(WORK_MODE),
      default: WORK_MODE.HYBRID
    },
    employmentType: {
      type: String,
      enum: Object.values(EMPLOYMENT_TYPE),
      default: EMPLOYMENT_TYPE.FULL_TIME
    },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      isNegotiable: { type: Boolean, default: true }
    },
    deadline: {
      type: Date
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.OPEN
    },
    visibility: {
      type: String,
      enum: Object.values(JOB_VISIBILITY),
      default: JOB_VISIBILITY.PUBLIC
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and filtering
jobSchema.index({
  title: 'text',
  description: 'text',
  requiredSkills: 'text',
  preferredSkills: 'text'
});
jobSchema.index({ title: 1 });
jobSchema.index({ company: 1 });
jobSchema.index({ status: 1, visibility: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ 'experience.minYears': 1 });
jobSchema.index({ createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
