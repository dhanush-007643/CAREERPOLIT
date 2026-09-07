const applicationRepository = require('../repositories/ApplicationRepository');
const companyRepository = require('../repositories/CompanyRepository');
const applicationService = require('./ApplicationService');
const { APPLICATION_STATUS } = require('../utils/constants');
const { NotFoundError } = require('../utils/customErrors');

class AtsService {
  async getPipelineBoard(userId, jobId = null) {
    const company = await companyRepository.findByUserId(userId);
    if (!company) {
      throw new NotFoundError('Company profile not found for this user', 'COMPANY_NOT_FOUND');
    }

    const filter = { company: company._id };
    if (jobId) {
      filter.job = jobId;
    }

    const applications = await applicationRepository.find(
      filter,
      { createdAt: -1 },
      0,
      0,
      [
        { path: 'job', select: 'title' },
        { path: 'fresher', select: 'name email avatar' },
        { path: 'fresherProfile', select: 'skills education experience completionPercentage' }
      ]
    );

    // Group by ATS stages
    const pipeline = {
      [APPLICATION_STATUS.APPLIED]: [],
      [APPLICATION_STATUS.SHORTLISTED]: [],
      [APPLICATION_STATUS.INTERVIEW]: [],
      [APPLICATION_STATUS.SELECTED]: [],
      [APPLICATION_STATUS.REJECTED]: []
    };

    for (const app of applications) {
      if (pipeline[app.status]) {
        pipeline[app.status].push(app);
      }
    }

    return {
      companyId: company._id,
      companyName: company.companyName,
      totalApplicants: applications.length,
      pipeline
    };
  }

  async updateStage(applicationId, userId, userRole, newStatus, note) {
    return await applicationService.updateApplicationStatus(applicationId, userId, userRole, newStatus, note);
  }
}

module.exports = new AtsService();
