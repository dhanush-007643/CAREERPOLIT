const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  },
  { _id: false }
);

const assessmentSubmissionSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    fresher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [answerSchema],
    score: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    isPassed: {
      type: Boolean,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

assessmentSubmissionSchema.index({ fresher: 1, assessment: 1 });
assessmentSubmissionSchema.index({ createdAt: -1 });

const AssessmentSubmission = mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);
module.exports = AssessmentSubmission;
