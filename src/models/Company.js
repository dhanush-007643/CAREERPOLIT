const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters']
    },
    logo: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    aboutCompany: {
      type: String,
      default: ''
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    website: {
      type: String,
      default: ''
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '1-10'
    },
    foundedYear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear() + 1
    },
    technologies: [
      {
        type: String,
        trim: true
      }
    ],
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
companySchema.index({ companyName: 'text', description: 'text', aboutCompany: 'text' });
companySchema.index({ companyName: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ location: 1 });
companySchema.index({ isPublic: 1 });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
