const Joi = require('joi');
const { INTERVIEW_TYPE, INTERVIEW_STATUS } = require('../utils/constants');

const scheduleInterviewSchema = Joi.object({
  applicationId: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  durationMinutes: Joi.number().integer().min(15).max(180).default(45),
  meetingLink: Joi.string().uri().required(),
  interviewType: Joi.string().valid(...Object.values(INTERVIEW_TYPE)).default(INTERVIEW_TYPE.TECHNICAL),
  notes: Joi.string().max(1000).allow('').optional()
});

const updateInterviewSchema = Joi.object({
  date: Joi.date().optional(),
  time: Joi.string().optional(),
  durationMinutes: Joi.number().integer().min(15).max(180).optional(),
  meetingLink: Joi.string().uri().optional(),
  interviewType: Joi.string().valid(...Object.values(INTERVIEW_TYPE)).optional(),
  notes: Joi.string().max(1000).allow('').optional(),
  status: Joi.string().valid(...Object.values(INTERVIEW_STATUS)).optional()
});

module.exports = {
  scheduleInterviewSchema,
  updateInterviewSchema
};
