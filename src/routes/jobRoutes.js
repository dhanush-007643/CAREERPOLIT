const express = require('express');
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createJobSchema, updateJobSchema } = require('../validators/jobValidator');
const { applyJobSchema } = require('../validators/applicationValidator');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Recruiter's own jobs (Startup / Admin) - B16
router.get(
  '/my',
  authenticate,
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  jobController.getMyJobs
);

router.get(
  '/my-jobs',
  authenticate,
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  jobController.getMyJobs
);

// Public / Search jobs
router.get('/', jobController.getAllJobs);

// Single job view with optional auth
router.get('/:id', optionalAuthenticate, jobController.getJobById);

// Create Job (Startup / Admin)
router.post(
  '/',
  authenticate,
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  validate(createJobSchema),
  jobController.createJob
);

// Update Job
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  validate(updateJobSchema),
  jobController.updateJob
);

// Delete Job
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  jobController.deleteJob
);

// Apply for Job (Fresher only)
router.post(
  '/:jobId/apply',
  authenticate,
  authorize(ROLES.FRESHER),
  validate(applyJobSchema),
  applicationController.applyForJob
);

// View Job Applications (Startup / Admin)
router.get(
  '/:jobId/applications',
  authenticate,
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  applicationController.getJobApplications
);

module.exports = router;
