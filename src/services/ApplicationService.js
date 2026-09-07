const applicationRepository = require('../repositories/ApplicationRepository');
const jobRepository = require('../repositories/JobRepository');
const fresherRepository = require('../repositories/FresherRepository');
const companyRepository = require('../repositories/CompanyRepository');
const invitationRepository = require('../repositories/InvitationRepository');
const matchingEngine = require('../ai/MatchingEngine');
const notificationService = require('./NotificationService');
const { ROLES, NOTIFICATION_TYPE, APPLICATION_STATUS, JOB_VISIBILITY } = require('../utils/constants');
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError
} = require('../utils/customErrors');

// Allowed status progression map
const ALLOWED_STAGE_TRANSITIONS = {
  [APPLICATION_STATUS.APPLIED]: [
    APPLICATION_STATUS.REVIEWING,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.REJECTED
  ],
  [APPLICATION_STATUS.REVIEWING]: [
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.REJECTED
  ],
  [APPLICATION_STATUS.SHORTLISTED]: [
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.REJECTED
  ],
  [APPLICATION_STATUS.INTERVIEW]: [
    APPLICATION_STATUS.SELECTED,
    APPLICATION_STATUS.REJECTED
  ],
  [APPLICATION_STATUS.SELECTED]: [
    APPLICATION_STATUS.REJECTED
  ],
  [APPLICATION_STATUS.REJECTED]: [
    APPLICATION_STATUS.REVIEWING,
    APPLICATION_STATUS.APPLIED
  ]
};

class ApplicationService {
  async applyForJob(fresherId, jobId, applicationData = {}) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');
    }

    if (job.status !== 'OPEN') {
      throw new BadRequestError('This job is no longer accepting applications', 'JOB_CLOSED');
    }

    // B22: Enforce deadline check
    const deadline = job.deadline || job.applicationDeadline;
    if (deadline && new Date(deadline) < new Date()) {
      throw new BadRequestError('The application deadline for this job has expired', 'APPLICATION_DEADLINE_EXPIRED');
    }

    // B06: Enforce private job visibility & invitation requirement
    if (job.visibility === JOB_VISIBILITY.PRIVATE) {
      const invitation = await invitationRepository.findOne({
        job: jobId,
        fresher: fresherId
      });
      if (!invitation) {
        throw new ForbiddenError('This is a private job listing. You must receive an invitation from the company to apply.', 'PRIVATE_JOB_ACCESS_DENIED');
      }
    }

    const existingApp = await applicationRepository.findExistingApplication(jobId, fresherId);
    if (existingApp) {
      throw new ConflictError('You have already applied for this job', 'ALREADY_APPLIED');
    }

    const profile = await fresherRepository.findByUserId(fresherId, false);
    if (!profile) {
      throw new BadRequestError('Please complete your fresher profile before applying', 'PROFILE_INCOMPLETE');
    }

    const resumeUrl = applicationData.resumeUrl || profile.resumeUrl;
    if (!resumeUrl) {
      throw new BadRequestError('Please upload a resume or provide a resume URL to apply', 'RESUME_REQUIRED');
    }

    // Calculate AI match score
    const matchAnalysis = matchingEngine.calculateMatch(profile, job);

    const application = await applicationRepository.create({
      job: jobId,
      company: job.company,
      fresher: fresherId,
      fresherProfile: profile._id,
      resumeUrl,
      coverLetter: applicationData.coverLetter || '',
      matchScore: matchAnalysis.matchScore,
      notes: applicationData.notes || ''
    });

    // Notify company asynchronously without blocking application success
    try {
      const company = await companyRepository.findById(job.company);
      if (company && company.user) {
        await notificationService.notify({
          recipient: company.user,
          sender: fresherId,
          type: NOTIFICATION_TYPE.APPLICATION_STATUS,
          title: 'New Job Application',
          message: `${profile.fullName || 'A candidate'} applied for ${job.title} (Match Score: ${matchAnalysis.matchScore}%)`,
          entityId: application._id,
          entityType: 'Application',
          actionUrl: `/company/applications/${application._id}`
        });
      }
    } catch (notifyErr) {
      console.warn(`[ApplicationService] Notification failure on application: ${notifyErr.message}`);
    }

    return application;
  }

  async getMyApplications(fresherId, page = 1, limit = 10) {
    return await applicationRepository.findByFresher(fresherId, page, limit);
  }

  async getJobApplications(jobId, userId, userRole, page = 1, limit = 20, status = null) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');
    }

    if (job.postedBy.toString() !== userId.toString() && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only view applications for your own company jobs', 'FORBIDDEN_APPLICATION_ACCESS');
    }

    return await applicationRepository.findByJob(jobId, page, limit, status);
  }

  async getApplicationById(applicationId, currentUser) {
    const application = await applicationRepository.findById(applicationId, [
      { path: 'job', select: 'title description requirements location salaryRange postedBy' },
      { path: 'company', select: 'companyName logo location user' },
      { path: 'fresher', select: 'name email avatar' },
      { path: 'fresherProfile' }
    ]);

    if (!application) {
      throw new NotFoundError('Application not found', 'APPLICATION_NOT_FOUND');
    }

    // B04: Verify genuine ownership
    const fresherIdStr = application.fresher?._id
      ? application.fresher._id.toString()
      : application.fresher?.toString();
    const isFresherOwner = fresherIdStr === currentUser.id.toString();

    let isCompanyOwner = false;
    if (currentUser.role === ROLES.STARTUP) {
      const companyUserStr = application.company?.user
        ? (application.company.user._id || application.company.user).toString()
        : null;
      const jobPosterStr = application.job?.postedBy
        ? (application.job.postedBy._id || application.job.postedBy).toString()
        : null;
      isCompanyOwner = (companyUserStr && companyUserStr === currentUser.id.toString()) ||
                       (jobPosterStr && jobPosterStr === currentUser.id.toString());
    }

    const isAdmin = currentUser.role === ROLES.ADMIN;

    if (!isFresherOwner && !isCompanyOwner && !isAdmin) {
      throw new ForbiddenError('You do not have permission to view this application', 'FORBIDDEN_APPLICATION_VIEW');
    }

    return application;
  }

  async updateApplicationStatus(applicationId, userId, userRole, newStatus, note = '') {
    const application = await applicationRepository.findById(applicationId, [
      { path: 'job', select: 'title postedBy company' },
      { path: 'company', select: 'companyName user' }
    ]);

    if (!application) {
      throw new NotFoundError('Application not found', 'APPLICATION_NOT_FOUND');
    }

    // B04/B23: Verify ownership safely even if job or company was modified
    const isJobOwner = application.job?.postedBy
      ? application.job.postedBy.toString() === userId.toString()
      : false;
    const isCompanyOwner = application.company?.user
      ? application.company.user.toString() === userId.toString()
      : false;

    if (!isJobOwner && !isCompanyOwner && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only update status of applications for your jobs', 'FORBIDDEN_STATUS_UPDATE');
    }

    // B25: Enforce lifecycle transition rules
    const currentStatus = application.status;
    const allowedNext = ALLOWED_STAGE_TRANSITIONS[currentStatus] || Object.values(APPLICATION_STATUS);
    if (userRole !== ROLES.ADMIN && currentStatus !== newStatus && !allowedNext.includes(newStatus)) {
      throw new BadRequestError(
        `Cannot transition application stage from '${currentStatus}' directly to '${newStatus}'.`,
        'INVALID_STAGE_TRANSITION'
      );
    }

    application.status = newStatus;
    if (note) application.notes = note;
    await application.save();

    // Trigger candidate notification on stage transition
    try {
      const jobTitle = application.job?.title || 'Position';
      const compName = application.company?.companyName || 'Company';

      let stageTitle = `Application Status Update: ${newStatus}`;
      let stageMsg = `Your application for "${jobTitle}" at ${compName} has been moved to ${newStatus}.`;

      if (newStatus === APPLICATION_STATUS.SHORTLISTED) {
        stageTitle = 'Congratulations! You are Shortlisted 🎉';
        stageMsg = `Your profile was shortlisted for "${jobTitle}" at ${compName}.`;
      } else if (newStatus === APPLICATION_STATUS.SELECTED) {
        stageTitle = 'Offer / Selection Notice 🌟';
        stageMsg = `Congratulations! You have been selected for "${jobTitle}" at ${compName}.`;
      }

      await notificationService.notify({
        recipient: application.fresher,
        sender: userId,
        type: NOTIFICATION_TYPE.APPLICATION_STATUS,
        title: stageTitle,
        message: stageMsg,
        entityId: application._id,
        entityType: 'Application',
        actionUrl: `/applications/${application._id}`
      });
    } catch (err) {
      console.warn(`[ApplicationService] Notification failure on status update: ${err.message}`);
    }

    return application;
  }
}

module.exports = new ApplicationService();
