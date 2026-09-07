const mongoose = require('mongoose');
const { INVITATION_STATUS } = require('../utils/constants');

const invitationSchema = new mongoose.Schema(
  {
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
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    message: {
      type: String,
      default: '',
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: Object.values(INVITATION_STATUS),
      default: INVITATION_STATUS.PENDING
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days default
    }
  },
  {
    timestamps: true
  }
);

invitationSchema.index({ company: 1, fresher: 1, job: 1 });
invitationSchema.index({ fresher: 1, status: 1 });
invitationSchema.index({ company: 1, status: 1 });
invitationSchema.index({ createdAt: -1 });

const Invitation = mongoose.model('Invitation', invitationSchema);
module.exports = Invitation;
