const Joi = require('joi');

const createCompanySchema = Joi.object({
  companyName: Joi.string().min(2).max(120).required(),
  logo: Joi.string().uri().allow('').optional(),
  description: Joi.string().max(500).allow('').optional(),
  aboutCompany: Joi.string().allow('').optional(),
  industry: Joi.string().required(),
  location: Joi.string().required(),
  website: Joi.string().uri().allow('').optional(),
  companySize: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '500+').default('1-10'),
  foundedYear: Joi.number().integer().min(1800).max(new Date().getFullYear() + 1).optional(),
  technologies: Joi.array().items(Joi.string()).optional(),
  isPublic: Joi.boolean().default(true)
});

const updateCompanySchema = Joi.object({
  companyName: Joi.string().min(2).max(120).optional(),
  logo: Joi.string().uri().allow('').optional(),
  description: Joi.string().max(500).allow('').optional(),
  aboutCompany: Joi.string().allow('').optional(),
  industry: Joi.string().optional(),
  location: Joi.string().optional(),
  website: Joi.string().uri().allow('').optional(),
  companySize: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '500+').optional(),
  foundedYear: Joi.number().integer().min(1800).max(new Date().getFullYear() + 1).optional(),
  technologies: Joi.array().items(Joi.string()).optional(),
  isPublic: Joi.boolean().optional()
});

module.exports = {
  createCompanySchema,
  updateCompanySchema
};
