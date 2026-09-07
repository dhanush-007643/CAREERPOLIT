const express = require('express');
const fresherController = require('../controllers/fresherController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/fresherValidator');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// All fresher profile routes require FRESHER role or ADMIN
router.use(authenticate);

router.get('/profile', fresherController.getProfile);
router.put(
  '/profile',
  authorize(ROLES.FRESHER, ROLES.ADMIN),
  validate(updateProfileSchema),
  fresherController.updateProfile
);

router.post(
  '/resume',
  authorize(ROLES.FRESHER, ROLES.ADMIN),
  uploadResume,
  fresherController.uploadResume
);

router.delete(
  '/resume',
  authorize(ROLES.FRESHER, ROLES.ADMIN),
  fresherController.deleteResume
);

module.exports = router;
