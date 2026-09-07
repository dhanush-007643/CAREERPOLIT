const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fresherProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FresherProfile'
    },
    fileUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      default: 'pdf'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    extractedSkills: [
      {
        type: String,
        trim: true
      }
    ],
    isPrimary: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

resumeSchema.index({ user: 1 });
resumeSchema.index({ createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
