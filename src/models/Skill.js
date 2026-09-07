const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    aliases: [
      {
        type: String,
        trim: true
      }
    ],
    description: {
      type: String,
      default: ''
    },
    demandLevel: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    }
  },
  {
    timestamps: true
  }
);

skillSchema.index({ category: 1 });

const Skill = mongoose.model('Skill', skillSchema);
module.exports = Skill;
