const invitationRepository = require('../repositories/InvitationRepository');
const companyRepository = require('../repositories/CompanyRepository');
const jobRepository = require('../repositories/JobRepository');
const userRepository = require('../repositories/UserRepository');
const notificationService = require('./NotificationService');
const { ROLES, INVITATION_STATUS, NOTIFICATION_TYPE, JOB_STATUS } = require('../utils/constants');
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError
} = require('../utils/customErrors');

class InvitationService {
  async createInvitation(userId, { fresherId, jobId, message, expiryDays = 14 }) {
    const company = await companyRepository.findByUserId(userId);
    if (!company) {
      throw new BadRequestError('You must have a company profile to invite candidates', 'COMPANY_REQUIRED');
    }

    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');
    }

    // B05: Verify that the job belongs to the authenticated recruiter/company
    const isJobOwner = (job.postedBy && job.postedBy.toString() === userId.toString()) ||
                       (job.company && job.company.toString() === company._id.toString());
    if (!isJobOwner) {
      throw new ForbiddenError('You can only invite candidates to jobs posted by your own company', 'FORBIDDEN_JOB_INVITATION');
    }

    if (job.status !== JOB_STATUS.OPEN) {
      throw new BadRequestError('Cannot send invitations for closed or inactive jobs', 'JOB_NOT_OPEN');
    }

    const fresher = await userRepository.findById(fresherId);
    if (!fresher || fresher.role !== ROLES.FRESHER) {
      throw new NotFoundError('Fresher candidate not found', 'CANDIDATE_NOT_FOUND');
    }

    // Check for active pending invitation
    const existing = await invitationRepository.findOne({
      company: company._id,
      fresher: fresherId,
      job: jobId,
      status: INVITATION_STATUS.PENDING
    });

    if (existing) {
      if (existing.expiryDate && new Date(existing.expiryDate) < new Date()) {
        existing.status = INVITATION_STATUS.EXPIRED;
        await existing.save();
      } else {
        throw new ConflictError('A pending invitation has already been sent to this candidate for this job', 'INVITATION_ALREADY_SENT');
      }
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 14));

    const invitation = await invitationRepository.create({
      company: company._id,
      fresher: fresherId,
      job: jobId,
      message: message || `We were impressed with your profile and would love for you to apply for our ${job.title} role!`,
      status: INVITATION_STATUS.PENDING,
      expiryDate
    });

    // Notify Fresher asynchronously
    try {
      await notificationService.notify({
        recipient: fresherId,
        sender: userId,
        type: NOTIFICATION_TYPE.INVITATION,
        title: `Interview / Job Invitation from ${company.companyName}`,
        message: `${company.companyName} invited you to apply for "${job.title}".`,
        entityId: invitation._id,
        entityType: 'Invitation',
        actionUrl: `/invitations`
      });
    } catch (err) {
      console.warn(`[InvitationService] Failed to deliver notification: ${err.message}`);
    }

    return invitation;
  }

  async getInvitations(currentUser, queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 20;

    if (currentUser.role === ROLES.FRESHER) {
      return await invitationRepository.findByFresher(currentUser.id, page, limit);
    } else if (currentUser.role === ROLES.STARTUP) {
      const company = await companyRepository.findByUserId(currentUser.id);
      if (!company) return { data: [], pagination: {} };
      return await invitationRepository.findByCompany(company._id, page, limit);
    }

    return await invitationRepository.paginate({}, page, limit);
  }

  async acceptInvitation(invitationId, fresherId) {
    const invitation = await invitationRepository.findById(invitationId, [
      { path: 'company', select: 'companyName user' },
      { path: 'job', select: 'title' }
    ]);

    if (!invitation) {
      throw new NotFoundError('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    if (invitation.fresher.toString() !== fresherId.toString()) {
      throw new ForbiddenError('You cannot accept another candidate\'s invitation', 'FORBIDDEN_INVITATION_ACTION');
    }

    // B21: Expiry check
    if (invitation.expiryDate && new Date(invitation.expiryDate) < new Date()) {
      invitation.status = INVITATION_STATUS.EXPIRED;
      await invitation.save();
      throw new BadRequestError('This invitation has expired and can no longer be accepted', 'INVITATION_EXPIRED');
    }

    if (invitation.status !== INVITATION_STATUS.PENDING) {
      throw new BadRequestError(`Invitation cannot be accepted in '${invitation.status}' status`, 'INVALID_INVITATION_STATUS');
    }

    invitation.status = INVITATION_STATUS.ACCEPTED;
    await invitation.save();

    // Notify company owner
    if (invitation.company && invitation.company.user) {
      try {
        await notificationService.notify({
          recipient: invitation.company.user,
          sender: fresherId,
          type: NOTIFICATION_TYPE.SYSTEM,
          title: 'Candidate Accepted Invitation',
          message: `Candidate accepted your invitation for "${invitation.job?.title || 'the position'}".`,
          entityId: invitation._id,
          entityType: 'Invitation'
        });
      } catch (err) {
        console.warn(`[InvitationService] Notification error: ${err.message}`);
      }
    }

    return invitation;
  }

  async rejectInvitation(invitationId, fresherId) {
    const invitation = await invitationRepository.findById(invitationId, [
      { path: 'company', select: 'companyName user' },
      { path: 'job', select: 'title' }
    ]);

    if (!invitation) {
      throw new NotFoundError('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    if (invitation.fresher.toString() !== fresherId.toString()) {
      throw new ForbiddenError('You cannot reject another candidate\'s invitation', 'FORBIDDEN_INVITATION_ACTION');
    }

    if (invitation.expiryDate && new Date(invitation.expiryDate) < new Date()) {
      invitation.status = INVITATION_STATUS.EXPIRED;
      await invitation.save();
      throw new BadRequestError('This invitation has expired and cannot be modified', 'INVITATION_EXPIRED');
    }

    if (invitation.status !== INVITATION_STATUS.PENDING) {
      throw new BadRequestError(`Invitation cannot be rejected in '${invitation.status}' status`, 'INVALID_INVITATION_STATUS');
    }

    invitation.status = INVITATION_STATUS.REJECTED;
    await invitation.save();

    if (invitation.company && invitation.company.user) {
      try {
        await notificationService.notify({
          recipient: invitation.company.user,
          sender: fresherId,
          type: NOTIFICATION_TYPE.SYSTEM,
          title: 'Candidate Declined Invitation',
          message: `Candidate declined your invitation for "${invitation.job?.title || 'the position'}".`,
          entityId: invitation._id,
          entityType: 'Invitation'
        });
      } catch (err) {
        console.warn(`[InvitationService] Notification error: ${err.message}`);
      }
    }

    return invitation;
  }
}

module.exports = new InvitationService();
