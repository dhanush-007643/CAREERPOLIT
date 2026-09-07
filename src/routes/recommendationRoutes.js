const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);

// Freshers receive ranked job recommendations
router.get('/jobs', authorize(ROLES.FRESHER), recommendationController.getRecommendedJobs);

// Startups receive ranked candidate recommendations for a job
router.get('/candidates/:jobId', authorize(ROLES.STARTUP, ROLES.ADMIN), recommendationController.getRecommendedCandidates);

module.exports = router;
