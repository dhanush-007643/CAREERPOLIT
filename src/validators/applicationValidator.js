const Joi = require('joi');
const { APPLICATION_STATUS } = require('../utils/constants');

const applyJobSchema = Joi.object({
  resumeUrl: Joi.string().allow('', null).optional(),
  coverLetter: Joi.string().max(2000).allow('').optional(),
  notes: Joi.string().allow('').optional()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(APPLICATION_STATUS)).required(),
  note: Joi.string().max(500).allow('').optional()
});

module.exports = {
  applyJobSchema,
  updateStatusSchema
};
