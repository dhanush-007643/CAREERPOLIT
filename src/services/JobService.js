const jobRepository = require('../repositories/JobRepository');
const companyRepository = require('../repositories/CompanyRepository');
const followRepository = require('../repositories/FollowRepository');
const notificationService = require('./NotificationService');
const { ROLES, JOB_VISIBILITY, NOTIFICATION_TYPE, JOB_STATUS } = require('../utils/constants');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/customErrors');

class JobService {
  async createJob(userId, jobData) {
    const company = await companyRepository.findByUserId(userId);
    if (!company) {
      throw new BadRequestError('You must create a company profile before posting jobs', 'COMPANY_REQUIRED');
    }

    const job = await jobRepository.create({
      ...jobData,
      company: company._id,
      postedBy: userId
    });

    // Notify all followers asynchronously
    try {
      const followersResult = await followRepository.getCompanyFollowers(company._id, 1, 100);
      if (followersResult && followersResult.data && followersResult.data.length > 0) {
        for (const f of followersResult.data) {
          if (f.fresher?._id) {
            notificationService.notify({
              recipient: f.fresher._id,
              sender: userId,
              type: NOTIFICATION_TYPE.JOB_ALERT,
              title: `New Job from ${company.companyName}`,
              message: `${company.companyName} just posted a new position: ${job.title}`,
              entityId: job._id,
              entityType: 'Job',
              actionUrl: `/jobs/${job._id}`
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn(`[JobService] Error broadcasting job notifications: ${err.message}`);
    }

    return job;
  }

  async getMyJobs(userId, queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 20;
    return await jobRepository.findOwnerJobs(userId, queryParams, page, limit);
  }

  async searchJobs(queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    return await jobRepository.searchJobs(queryParams, page, limit);
  }

  async getJobById(jobId, currentUser = null) {
    const job = await jobRepository.findById(jobId, {
      path: 'company',
      select: 'companyName logo location industry website description isPublic'
    });

    if (!job) {
      throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');
    }

    // Visibility check
    if (job.visibility === JOB_VISIBILITY.PRIVATE) {
      if (!currentUser) {
        throw new ForbiddenError('This is a private job listing and requires authorization', 'PRIVATE_JOB_ACCESS_DENIED');
      }
      const isOwner = job.postedBy.toString() === currentUser.id.toString();
      const isAdmin = currentUser.role === ROLES.ADMIN;
      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('You do not have permission to view this private job listing', 'PRIVATE_JOB_ACCESS_DENIED');
      }
    }

    return job;
  }

  async updateJob(jobId, userId, userRole, updateData) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');
    }

    if (job.postedBy.toString() !== userId.toString() && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only update jobs posted by your company', 'FORBIDDEN_JOB_UPDATE');
    }

    return await jobRepository.updateById(jobId, updateData);
  }

  async deleteJob(jobId, userId, userRole) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');
    }

    if (job.postedBy.toString() !== userId.toString() && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only delete jobs posted by your company', 'FORBIDDEN_JOB_DELETE');
    }

    // B23: Preserve integrity by closing rather than physically destroying recruitment data
    await jobRepository.updateById(jobId, { status: JOB_STATUS.CLOSED });
    return { message: 'Job closed successfully' };
  }

  async getJobsByCompany(companyId, status = null) {
    return await jobRepository.findCompanyJobs(companyId, status);
  }
}

module.exports = new JobService();
