const Joi = require('joi');

const educationItem = Joi.object({
  degree: Joi.string().required(),
  university: Joi.string().required(),
  fieldOfStudy: Joi.string().allow('').optional(),
  graduationYear: Joi.number().integer().min(1970).max(2040).required(),
  grade: Joi.string().allow('').optional()
});

const certificationItem = Joi.object({
  name: Joi.string().required(),
  issuingOrganization: Joi.string().allow('').optional(),
  issueDate: Joi.date().optional(),
  credentialUrl: Joi.string().uri().allow('').optional()
});

const projectItem = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  technologies: Joi.array().items(Joi.string()).optional(),
  githubUrl: Joi.string().uri().allow('').optional(),
  liveUrl: Joi.string().uri().allow('').optional()
});

const experienceItem = Joi.object({
  title: Joi.string().required(),
  company: Joi.string().required(),
  location: Joi.string().allow('').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().allow(null).optional(),
  isCurrent: Joi.boolean().default(false),
  description: Joi.string().allow('').optional()
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().allow('').optional(),
  profilePhoto: Joi.string().uri().allow('').optional(),
  dateOfBirth: Joi.date().optional(),
  location: Joi.string().allow('').optional(),
  education: Joi.array().items(educationItem).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  certifications: Joi.array().items(certificationItem).optional(),
  projects: Joi.array().items(projectItem).optional(),
  experience: Joi.array().items(experienceItem).optional(),
  careerInterests: Joi.array().items(Joi.string()).optional(),
  preferredJobRoles: Joi.array().items(Joi.string()).optional(),
  preferredLocations: Joi.array().items(Joi.string()).optional(),
  workMode: Joi.string().valid('REMOTE', 'HYBRID', 'ON_SITE', 'ANY').optional(),
  portfolioUrl: Joi.string().uri().allow('').optional(),
  gitHubUrl: Joi.string().uri().allow('').optional(),
  linkedInUrl: Joi.string().uri().allow('').optional()
});

module.exports = {
  updateProfileSchema
};
