const Joi = require('joi');
const { ASSESSMENT_CATEGORY } = require('../utils/constants');

const createAssessmentSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  category: Joi.string().valid(...Object.values(ASSESSMENT_CATEGORY)).required(),
  skillName: Joi.string().required(),
  durationMinutes: Joi.number().integer().min(5).max(120).default(20),
  passingScorePercentage: Joi.number().min(0).max(100).default(60),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(
        Joi.object({
          text: Joi.string().required(),
          isCorrect: Joi.boolean().required()
        })
      ).min(2).required(),
      explanation: Joi.string().allow('').optional(),
      points: Joi.number().min(1).default(10)
    })
  ).min(1).required()
});

const submitAssessmentSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.string().required(),
      selectedOptionId: Joi.string().allow('', null).optional()
    })
  ).default([])
});

module.exports = {
  createAssessmentSchema,
  submitAssessmentSchema
};
