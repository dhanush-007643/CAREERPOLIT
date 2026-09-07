const Joi = require('joi');
const { ROLES } = require('../utils/constants');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid(ROLES.FRESHER, ROLES.STARTUP).default(ROLES.FRESHER),
  companyName: Joi.when('role', {
    is: ROLES.STARTUP,
    then: Joi.string().min(2).max(120).required(),
    otherwise: Joi.string().allow('', null).optional()
  }),
  industry: Joi.string().allow('', null).optional(),
  location: Joi.string().allow('', null).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required()
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
