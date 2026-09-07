const mongoose = require('mongoose');
const { ASSESSMENT_CATEGORY } = require('../utils/constants');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true, default: false }
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [optionSchema],
    explanation: { type: String, default: '' },
    points: { type: Number, default: 10 }
  },
  { _id: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: Object.values(ASSESSMENT_CATEGORY),
      required: true
    },
    skillName: {
      type: String,
      required: true,
      trim: true
    },
    durationMinutes: {
      type: Number,
      default: 20
    },
    passingScorePercentage: {
      type: Number,
      default: 60
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

assessmentSchema.index({ category: 1 });
assessmentSchema.index({ skillName: 1 });
assessmentSchema.index({ isActive: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);
module.exports = Assessment;
