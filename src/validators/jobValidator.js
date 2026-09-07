const Joi = require('joi');
const { WORK_MODE, EMPLOYMENT_TYPE, JOB_STATUS, JOB_VISIBILITY } = require('../utils/constants');

const createJobSchema = Joi.object({
  title: Joi.string().min(3).max(150).required(),
  description: Joi.string().required(),
  responsibilities: Joi.array().items(Joi.string()).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  requiredSkills: Joi.array().items(Joi.string()).min(1).required(),
  preferredSkills: Joi.array().items(Joi.string()).optional(),
  education: Joi.object({
    degree: Joi.string().default('Bachelor'),
    field: Joi.string().default('Computer Science or related')
  }).optional(),
  experience: Joi.object({
    minYears: Joi.number().integer().min(0).default(0),
    maxYears: Joi.number().integer().min(0).default(2)
  }).optional(),
  location: Joi.string().required(),
  workMode: Joi.string().valid(...Object.values(WORK_MODE)).default(WORK_MODE.HYBRID),
  employmentType: Joi.string().valid(...Object.values(EMPLOYMENT_TYPE)).default(EMPLOYMENT_TYPE.FULL_TIME),
  salaryRange: Joi.object({
    min: Joi.number().min(0).default(0),
    max: Joi.number().min(0).default(0),
    currency: Joi.string().default('USD'),
    isNegotiable: Joi.boolean().default(true)
  }).optional(),
  deadline: Joi.date().optional(),
  status: Joi.string().valid(...Object.values(JOB_STATUS)).default(JOB_STATUS.OPEN),
  visibility: Joi.string().valid(...Object.values(JOB_VISIBILITY)).default(JOB_VISIBILITY.PUBLIC)
});

const updateJobSchema = Joi.object({
  title: Joi.string().min(3).max(150).optional(),
  description: Joi.string().optional(),
  responsibilities: Joi.array().items(Joi.string()).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  requiredSkills: Joi.array().items(Joi.string()).min(1).optional(),
  preferredSkills: Joi.array().items(Joi.string()).optional(),
  education: Joi.object({
    degree: Joi.string(),
    field: Joi.string()
  }).optional(),
  experience: Joi.object({
    minYears: Joi.number().integer().min(0),
    maxYears: Joi.number().integer().min(0)
  }).optional(),
  location: Joi.string().optional(),
  workMode: Joi.string().valid(...Object.values(WORK_MODE)).optional(),
  employmentType: Joi.string().valid(...Object.values(EMPLOYMENT_TYPE)).optional(),
  salaryRange: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
    currency: Joi.string(),
    isNegotiable: Joi.boolean()
  }).optional(),
  deadline: Joi.date().optional(),
  status: Joi.string().valid(...Object.values(JOB_STATUS)).optional(),
  visibility: Joi.string().valid(...Object.values(JOB_VISIBILITY)).optional()
});

module.exports = {
  createJobSchema,
  updateJobSchema
};
