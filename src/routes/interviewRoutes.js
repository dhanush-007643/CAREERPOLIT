const express = require('express');
const interviewController = require('../controllers/interviewController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { scheduleInterviewSchema, updateInterviewSchema } = require('../validators/interviewValidator');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);

// Startups schedule interviews
router.post(
  '/',
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  validate(scheduleInterviewSchema),
  interviewController.scheduleInterview
);

// List interviews
router.get('/', interviewController.getInterviews);

// Update / Reschedule interview
router.put(
  '/:id',
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  validate(updateInterviewSchema),
  interviewController.updateInterview
);

// Cancel interview
router.delete(
  '/:id',
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  interviewController.cancelInterview
);

module.exports = router;
