const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema(
  {
    fresher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    matchedSkills: [{ type: String, trim: true }],
    missingSkills: [{ type: String, trim: true }],
    breakdown: {
      requiredSkillsScore: { type: Number, default: 0 },
      preferredSkillsScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      educationScore: { type: Number, default: 0 },
      careerInterestsScore: { type: Number, default: 0 }
    },
    recommendation: {
      type: String,
      default: ''
    },
    explanation: {
      type: String,
      default: ''
    },
    calculatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

matchResultSchema.index({ fresher: 1, job: 1 }, { unique: true });
matchResultSchema.index({ job: 1, matchScore: -1 });
matchResultSchema.index({ fresher: 1, matchScore: -1 });

const MatchResult = mongoose.model('MatchResult', matchResultSchema);
module.exports = MatchResult;
