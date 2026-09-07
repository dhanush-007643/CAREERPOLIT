const express = require('express');
const atsController = require('../controllers/atsController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { updateStatusSchema } = require('../validators/applicationValidator');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.STARTUP, ROLES.ADMIN));

// ATS Pipeline board
router.get('/pipeline', atsController.getPipeline);

// Update status in ATS
router.patch(
  '/applications/:id/status',
  validate(updateStatusSchema),
  atsController.updateStage
);

module.exports = router;
