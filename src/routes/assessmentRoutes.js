const express = require('express');
const assessmentController = require('../controllers/assessmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createAssessmentSchema, submitAssessmentSchema } = require('../validators/assessmentValidator');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);

// List active assessments
router.get('/', assessmentController.getAssessments);
router.get('/:id', assessmentController.getAssessmentById);

// Create assessment (Admin only)
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createAssessmentSchema),
  assessmentController.createAssessment
);

// Submit assessment (Fresher)
router.post(
  '/:id/submit',
  authorize(ROLES.FRESHER),
  validate(submitAssessmentSchema),
  assessmentController.submitAssessment
);

module.exports = router;
