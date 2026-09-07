const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetSkills: [{ type: String, trim: true }],
    estimatedWeeks: { type: Number, default: 2 },
    recommendedResources: [
      {
        title: { type: String },
        type: { type: String, enum: ['COURSE', 'PROJECT', 'BOOK', 'DOCUMENTATION', 'CERTIFICATION'], default: 'COURSE' },
        url: { type: String }
      }
    ],
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED'
    }
  },
  { _id: false }
);

const careerRecommendationSchema = new mongoose.Schema(
  {
    fresher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetRole: {
      type: String,
      required: true,
      trim: true
    },
    currentReadinessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    possessedSkills: [{ type: String, trim: true }],
    missingSkills: [{ type: String, trim: true }],
    roadmap: [roadmapStepSchema],
    summary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

careerRecommendationSchema.index({ fresher: 1, targetRole: 1 });
careerRecommendationSchema.index({ createdAt: -1 });

const CareerRecommendation = mongoose.model('CareerRecommendation', careerRecommendationSchema);
module.exports = CareerRecommendation;
