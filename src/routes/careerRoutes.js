const express = require('express');
const careerController = require('../controllers/careerController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.FRESHER));

router.get('/profile', careerController.getCareerProfile);
router.post('/assessment', careerController.setCareerAssessment);
router.post('/goal', careerController.setCareerAssessment); // B15: Alias for setting career goal
router.get('/skill-gap', careerController.getSkillGap);
router.get('/recommendations', careerController.getRecommendations);
router.get('/roadmap', careerController.getRoadmap);
router.patch('/roadmap/step', careerController.updateRoadmapStep); // B32: Update step progress

module.exports = router;
