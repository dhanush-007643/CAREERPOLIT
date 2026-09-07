const express = require('express');
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { updateStatusSchema } = require('../validators/applicationValidator');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);

// Freshers view their own submitted applications
router.get('/my', authorize(ROLES.FRESHER), applicationController.getMyApplications);

// View specific application details
router.get('/:id', applicationController.getApplicationById);

// Update application status (ATS transition)
router.patch(
  '/:id/status',
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  validate(updateStatusSchema),
  applicationController.updateStatus
);

module.exports = router;
