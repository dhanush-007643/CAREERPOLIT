const express = require('express');
const matchingController = require('../controllers/matchingController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);

// Freshers match against all jobs
router.get('/jobs', authorize(ROLES.FRESHER), matchingController.getMatchingJobs);

// Fresher matches against a specific job
router.get('/jobs/:jobId', authorize(ROLES.FRESHER), matchingController.getMatchingJobById);

// Startup matches all candidates for a job
router.get('/candidates/:jobId', authorize(ROLES.STARTUP, ROLES.ADMIN), matchingController.getMatchingCandidates);

module.exports = router;
