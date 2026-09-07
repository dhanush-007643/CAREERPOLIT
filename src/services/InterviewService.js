const interviewRepository = require('../repositories/InterviewRepository');
const applicationRepository = require('../repositories/ApplicationRepository');
const companyRepository = require('../repositories/CompanyRepository');
const notificationService = require('./NotificationService');
const { ROLES, APPLICATION_STATUS, NOTIFICATION_TYPE, INTERVIEW_STATUS } = require('../utils/constants');
const { NotFoundError, ForbiddenError, BadRequestError, ConflictError } = require('../utils/customErrors');

class InterviewService {
  async scheduleInterview(userId, interviewData) {
    const application = await applicationRepository.findById(interviewData.applicationId, [
      { path: 'job', select: 'title' },
      { path: 'company', select: 'companyName user' },
      { path: 'fresher', select: 'name email' }
    ]);

    if (!application) {
      throw new NotFoundError('Application not found', 'APPLICATION_NOT_FOUND');
    }

    const company = await companyRepository.findByUserId(userId);
    if (!company || company._id.toString() !== application.company._id.toString()) {
      throw new ForbiddenError('You can only schedule interviews for applications to your company', 'FORBIDDEN_INTERVIEW_SCHEDULE');
    }

    // B24: Parse and validate scheduled date/time timestamp
    let scheduledInstant = new Date(interviewData.date);
    if (interviewData.time && typeof interviewData.time === 'string') {
      const timeParts = interviewData.time.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const meridian = timeParts[3] ? timeParts[3].toUpperCase() : null;
        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
        scheduledInstant.setHours(hours, minutes, 0, 0);
      }
    }

    // Must be in the future (allowing slight 1-minute skew)
    if (scheduledInstant.getTime() < Date.now() - 60000) {
      throw new BadRequestError('Interview schedule time must be in the future', 'INVALID_INTERVIEW_TIME');
    }

    // B25: Check for duplicate active scheduled interview
    const existingActive = await interviewRepository.findOne({
      application: application._id,
      status: INTERVIEW_STATUS.SCHEDULED
    });
    if (existingActive) {
      throw new ConflictError('An active interview is already scheduled for this application', 'INTERVIEW_ALREADY_SCHEDULED');
    }

    const fresherId = application.fresher?._id || application.fresher;

    const interview = await interviewRepository.create({
      application: application._id,
      fresher: fresherId,
      company: company._id,
      scheduledBy: userId,
      date: scheduledInstant,
      time: interviewData.time,
      durationMinutes: interviewData.durationMinutes || 45,
      meetingLink: interviewData.meetingLink,
      interviewType: interviewData.interviewType || 'TECHNICAL',
      notes: interviewData.notes || '',
      status: INTERVIEW_STATUS.SCHEDULED
    });

    // Advance application status to INTERVIEW if not already
    if (application.status !== APPLICATION_STATUS.INTERVIEW && application.status !== APPLICATION_STATUS.SELECTED) {
      application.status = APPLICATION_STATUS.INTERVIEW;
      await application.save();
    }

    // Send notification to Fresher safely
    try {
      await notificationService.notify({
        recipient: fresherId,
        sender: userId,
        type: NOTIFICATION_TYPE.INTERVIEW_SCHEDULED,
        title: `Interview Scheduled: ${application.job?.title || 'Position'}`,
        message: `Your interview with ${company.companyName} is scheduled for ${scheduledInstant.toLocaleDateString()} at ${interviewData.time}.`,
        entityId: interview._id,
        entityType: 'Interview',
        actionUrl: `/interviews`
      });
    } catch (err) {
      console.warn(`[InterviewService] Notification failure: ${err.message}`);
    }

    return interview;
  }

  async getInterviews(currentUser, queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 20;
    const currentUserId = currentUser._id || currentUser.id;

    if (currentUser.role === ROLES.FRESHER) {
      return await interviewRepository.findByFresher(currentUserId, page, limit);
    } else if (currentUser.role === ROLES.STARTUP) {
      const company = await companyRepository.findByUserId(currentUserId);
      if (!company) return { data: [], pagination: {} };
      return await interviewRepository.findByCompany(company._id, page, limit);
    }

    return await interviewRepository.paginate({}, page, limit);
  }

  async updateInterview(interviewId, userId, userRole, updateData) {
    const interview = await interviewRepository.findById(interviewId, [
      { path: 'company', select: 'user companyName' },
      { path: 'fresher', select: 'name' }
    ]);

    if (!interview) {
      throw new NotFoundError('Interview not found', 'INTERVIEW_NOT_FOUND');
    }

    if (interview.company.user.toString() !== userId.toString() && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only modify interviews scheduled by your company', 'FORBIDDEN_INTERVIEW_UPDATE');
    }

    const updated = await interviewRepository.updateById(interviewId, updateData);

    // Notify candidate if date/time changed
    if (updateData.date || updateData.time) {
      try {
        await notificationService.notify({
          recipient: interview.fresher,
          sender: userId,
          type: NOTIFICATION_TYPE.INTERVIEW_SCHEDULED,
          title: 'Interview Rescheduled',
          message: `Your interview with ${interview.company.companyName} has been rescheduled to ${new Date(updated.date).toLocaleDateString()} at ${updated.time}.`,
          entityId: interview._id,
          entityType: 'Interview',
          actionUrl: `/interviews`
        });
      } catch (err) {
        console.warn(`[InterviewService] Notification failure: ${err.message}`);
      }
    }

    return updated;
  }

  async cancelInterview(interviewId, userId, userRole, reason) {
    const interview = await interviewRepository.findById(interviewId, [
      { path: 'company', select: 'user companyName' },
      { path: 'fresher', select: 'name' }
    ]);

    if (!interview) {
      throw new NotFoundError('Interview not found', 'INTERVIEW_NOT_FOUND');
    }

    if (interview.company && interview.company.user && interview.company.user.toString() !== userId.toString() && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only cancel interviews scheduled by your company', 'FORBIDDEN_INTERVIEW_CANCEL');
    }

    const updated = await interviewRepository.updateById(interviewId, {
      status: INTERVIEW_STATUS.CANCELLED,
      feedback: reason || interview.feedback
    });

    try {
      if (interview.fresher) {
        await notificationService.notify({
          recipient: interview.fresher,
          sender: userId,
          type: NOTIFICATION_TYPE.INTERVIEW_CANCELLED,
          title: 'Interview Cancelled',
          message: `Your interview with ${interview.company?.companyName || 'the company'} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
          entityId: interview._id,
          entityType: 'Interview',
          actionUrl: `/interviews`
        });
      }
    } catch (err) {
      console.warn(`[InterviewService] Notification failure: ${err.message}`);
    }

    return { interview: updated, message: 'Interview cancelled successfully' };
  }
}

module.exports = new InterviewService();
