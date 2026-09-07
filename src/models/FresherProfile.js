const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  university: { type: String, required: true },
  fieldOfStudy: { type: String, default: '' },
  graduationYear: { type: Number, required: true },
  grade: { type: String, default: '' }
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, default: '' },
  issueDate: { type: Date },
  credentialUrl: { type: String, default: '' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String, trim: true }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' }
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, default: '' }
}, { _id: false });

const fresherProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    dateOfBirth: { type: Date },
    location: { type: String, default: '' },
    education: [educationSchema],
    skills: [{ type: String, trim: true }],
    certifications: [certificationSchema],
    projects: [projectSchema],
    experience: [experienceSchema],
    careerInterests: [{ type: String, trim: true }],
    preferredJobRoles: [{ type: String, trim: true }],
    preferredLocations: [{ type: String, trim: true }],
    workMode: {
      type: String,
      enum: ['REMOTE', 'HYBRID', 'ON_SITE', 'ANY'],
      default: 'ANY'
    },
    portfolioUrl: { type: String, default: '' },
    gitHubUrl: { type: String, default: '' },
    linkedInUrl: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    resumePublicId: { type: String, default: '' },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

// Indexes
fresherProfileSchema.index({ skills: 1 });
fresherProfileSchema.index({ location: 1 });
fresherProfileSchema.index({ preferredJobRoles: 1 });
fresherProfileSchema.index({ 'education.degree': 1 });

// Helper to compute profile completion %
fresherProfileSchema.methods.calculateCompletionPercentage = function () {
  let score = 0;
  const weights = {
    basicInfo: 15, // fullName, email, phone, location
    education: 20, // education array length > 0
    skills: 20, // skills array length >= 3
    projects: 15, // projects length > 0
    resumeUrl: 15, // resume uploaded
    careerInterests: 10, // career interests set
    socialLinks: 5 // gitHubUrl or linkedInUrl
  };

  if (this.fullName && this.email && this.phone && this.location) {
    score += weights.basicInfo;
  } else if (this.fullName && this.email) {
    score += weights.basicInfo / 2;
  }

  if (this.education && this.education.length > 0) score += weights.education;
  if (this.skills && this.skills.length >= 3) score += weights.skills;
  else if (this.skills && this.skills.length > 0) score += weights.skills / 2;

  if (this.projects && this.projects.length > 0) score += weights.projects;
  if (this.resumeUrl) score += weights.resumeUrl;
  if (this.careerInterests && this.careerInterests.length > 0) score += weights.careerInterests;
  if (this.gitHubUrl || this.linkedInUrl || this.portfolioUrl) score += weights.socialLinks;

  this.completionPercentage = Math.round(Math.min(100, Math.max(0, score)));
  return this.completionPercentage;
};

fresherProfileSchema.pre('save', function (next) {
  this.calculateCompletionPercentage();
  next();
});

const FresherProfile = mongoose.model('FresherProfile', fresherProfileSchema);
module.exports = FresherProfile;
