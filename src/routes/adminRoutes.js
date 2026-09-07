const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.get('/stats', adminController.getDashboard); // B14: stats alias
router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus); // B14: status toggle
router.get('/companies', adminController.getCompanies);
router.get('/jobs', adminController.getJobs);
router.get('/applications', adminController.getApplications);

module.exports = router;
