const express = require('express');
const companyController = require('../controllers/companyController');
const followController = require('../controllers/followController');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createCompanySchema, updateCompanySchema } = require('../validators/companyValidator');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// Following list of current fresher
router.get('/following', authenticate, followController.getFollowing);

// Own company profile endpoints (Startups) - B13
router.get('/profile', authenticate, authorize(ROLES.STARTUP, ROLES.ADMIN), companyController.getMyProfile);
router.put('/profile', authenticate, authorize(ROLES.STARTUP, ROLES.ADMIN), validate(updateCompanySchema), companyController.updateMyProfile);

// Public / Search endpoints
router.get('/', companyController.getAllCompanies);
router.get('/:id', optionalAuthenticate, companyController.getCompanyById);

// Followers of a specific company
router.get('/:id/followers', authenticate, followController.getCompanyFollowers);

// Create company profile (Startups only)
router.post(
  '/',
  authenticate,
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  validate(createCompanySchema),
  companyController.createCompany
);

// Update company profile by ID
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  validate(updateCompanySchema),
  companyController.updateCompany
);

// Delete company profile
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.STARTUP, ROLES.ADMIN),
  companyController.deleteCompany
);

// Follow / Unfollow endpoints
router.post(
  '/:id/follow',
  authenticate,
  authorize(ROLES.FRESHER),
  followController.followCompany
);

router.delete(
  '/:id/follow',
  authenticate,
  authorize(ROLES.FRESHER),
  followController.unfollowCompany
);

module.exports = router;
