const express = require('express');
const authRoutes = require('./authRoutes');
const fresherRoutes = require('./fresherRoutes');
const companyRoutes = require('./companyRoutes');
const jobRoutes = require('./jobRoutes');
const applicationRoutes = require('./applicationRoutes');
const atsRoutes = require('./atsRoutes');
const invitationRoutes = require('./invitationRoutes');
const interviewRoutes = require('./interviewRoutes');
const notificationRoutes = require('./notificationRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const careerRoutes = require('./careerRoutes');
const matchingRoutes = require('./matchingRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/freshers', fresherRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/company', atsRoutes);
router.use('/ats', atsRoutes);
router.use('/invitations', invitationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/career', careerRoutes);
router.use('/matching', matchingRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareerPilot Backend API is healthy and operational',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

module.exports = router;
