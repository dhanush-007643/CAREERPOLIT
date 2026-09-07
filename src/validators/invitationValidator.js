const Joi = require('joi');

const createInvitationSchema = Joi.object({
  fresherId: Joi.string().required(),
  jobId: Joi.string().required(),
  message: Joi.string().max(1000).allow('').optional(),
  expiryDays: Joi.number().integer().min(1).max(60).default(14)
});

module.exports = {
  createInvitationSchema
};
