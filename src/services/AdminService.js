const userRepository = require('../repositories/UserRepository');
const companyRepository = require('../repositories/CompanyRepository');
const jobRepository = require('../repositories/JobRepository');
const applicationRepository = require('../repositories/ApplicationRepository');
const interviewRepository = require('../repositories/InterviewRepository');
const MatchResult = require('../models/MatchResult');
const { ROLES, APPLICATION_STATUS } = require('../utils/constants');
const { NotFoundError } = require('../utils/customErrors');

class AdminService {
  async getDashboardAnalytics() {
    const [
      totalFreshers,
      totalStartups,
      totalAdmins,
      totalJobs,
      totalApplications,
      totalInterviews,
      totalSelections,
      avgMatchResult
    ] = await Promise.all([
      userRepository.count({ role: ROLES.FRESHER }),
      userRepository.count({ role: ROLES.STARTUP }),
      userRepository.count({ role: ROLES.ADMIN }),
      jobRepository.count(),
      applicationRepository.count(),
      interviewRepository.count(),
      applicationRepository.count({ status: APPLICATION_STATUS.SELECTED }),
      MatchResult.aggregate([
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$matchScore' }
          }
        }
      ])
    ]);

    const totalUsers = totalFreshers + totalStartups + totalAdmins;
    // B34: Do not substitute fabricated values like 78 when no data exists
    const averageMatchScore = avgMatchResult.length > 0 ? Math.round(avgMatchResult[0].averageScore) : 0;

    const metrics = {
      totalUsers,
      totalFreshers,
      totalStartups,
      totalCompanies: totalStartups,
      totalJobs,
      totalApplications,
      totalInterviews,
      totalSelections,
      averageMatchScore
    };

    return {
      totalUsers,
      totalCompanies: totalStartups,
      totalJobs,
      totalApplications,
      totalInterviews,
      totalSelections,
      averageMatchScore,
      metrics,
      systemStatus: {
        status: 'HEALTHY',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date()
      }
    };
  }

  async getAllUsers(queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 20;
    const filter = {};
    if (queryParams.role) filter.role = queryParams.role;
    if (queryParams.search) {
      const escaped = queryParams.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } }
      ];
    }
    return await userRepository.paginate(filter, page, limit, { createdAt: -1 });
  }

  async toggleUserStatus(userId, isActive) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    user.isActive = isActive !== undefined ? Boolean(isActive) : !user.isActive;
    await user.save();
    return user;
  }

  async getAllCompanies(queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 20;
    const filter = {};
    if (queryParams.search) {
      const escaped = queryParams.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.companyName = { $regex: escaped, $options: 'i' };
    }
    return await companyRepository.paginate(filter, page, limit, { createdAt: -1 });
  }

  async getAllJobs(queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 20;
    return await jobRepository.paginate({}, page, limit, { createdAt: -1 }, { path: 'company', select: 'companyName' });
  }

  async getAllApplications(queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 20;
    return await applicationRepository.paginate(
      {},
      page,
      limit,
      { createdAt: -1 },
      [
        { path: 'fresher', select: 'name email' },
        { path: 'job', select: 'title' },
        { path: 'company', select: 'companyName' }
      ]
    );
  }
}

module.exports = new AdminService();
