const followRepository = require('../repositories/FollowRepository');
const companyRepository = require('../repositories/CompanyRepository');
const notificationService = require('./NotificationService');
const { NOTIFICATION_TYPE } = require('../utils/constants');
const { NotFoundError, ConflictError } = require('../utils/customErrors');

class FollowService {
  async followCompany(fresherId, companyId, fresherName) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found', 'COMPANY_NOT_FOUND');
    }

    const existingFollow = await followRepository.findFollow(fresherId, companyId);
    if (existingFollow) {
      throw new ConflictError('You are already following this company', 'ALREADY_FOLLOWING');
    }

    const follow = await followRepository.create({
      fresher: fresherId,
      company: companyId
    });

    // Notify startup owner
    if (company.user) {
      await notificationService.notify({
        recipient: company.user,
        sender: fresherId,
        type: NOTIFICATION_TYPE.SYSTEM,
        title: 'New Company Follower',
        message: `${fresherName || 'A candidate'} is now following ${company.companyName}`,
        entityId: company._id,
        entityType: 'Company'
      });
    }

    return {
      message: `Successfully followed ${company.companyName}`,
      follow
    };
  }

  async unfollowCompany(fresherId, companyId) {
    const follow = await followRepository.removeFollow(fresherId, companyId);
    if (!follow) {
      throw new NotFoundError('You are not following this company', 'FOLLOW_NOT_FOUND');
    }

    return { message: 'Successfully unfollowed company' };
  }

  async getFollowing(fresherId, page = 1, limit = 20) {
    return await followRepository.getFollowing(fresherId, page, limit);
  }

  async getCompanyFollowers(companyId, page = 1, limit = 20) {
    return await followRepository.getCompanyFollowers(companyId, page, limit);
  }
}

module.exports = new FollowService();
