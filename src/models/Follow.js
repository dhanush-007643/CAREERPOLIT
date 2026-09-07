const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
  {
    fresher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate following
followSchema.index({ fresher: 1, company: 1 }, { unique: true });
followSchema.index({ fresher: 1 });
followSchema.index({ company: 1 });

const Follow = mongoose.model('Follow', followSchema);
module.exports = Follow;
