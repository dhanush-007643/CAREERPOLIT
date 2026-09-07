const express = require('express');
const invitationController = require('../controllers/invitationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createInvitationSchema } = require('../validators/invitationValidator');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);

// Startups invite candidates
router.post(
  '/',
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  validate(createInvitationSchema),
  invitationController.createInvitation
);

// List invitations
router.get('/', invitationController.getInvitations);

// Freshers accept or reject invitations
router.patch('/:id/accept', authorize(ROLES.FRESHER), invitationController.acceptInvitation);
router.patch('/:id/reject', authorize(ROLES.FRESHER), invitationController.rejectInvitation);

module.exports = router;
