const BaseRepository = require('./BaseRepository');
const Follow = require('../models/Follow');

class FollowRepository extends BaseRepository {
  constructor() {
    super(Follow);
  }

  async findFollow(fresherId, companyId) {
    return await this.model.findOne({ fresher: fresherId, company: companyId }).exec();
  }

  async getFollowing(fresherId, page = 1, limit = 20) {
    return await this.paginate(
      { fresher: fresherId },
      page,
      limit,
      { createdAt: -1 },
      { path: 'company', select: 'companyName logo industry location website' }
    );
  }

  async getCompanyFollowers(companyId, page = 1, limit = 20) {
    return await this.paginate(
      { company: companyId },
      page,
      limit,
      { createdAt: -1 },
      { path: 'fresher', select: 'name email avatar' }
    );
  }

  async removeFollow(fresherId, companyId) {
    return await this.model.findOneAndDelete({ fresher: fresherId, company: companyId }).exec();
  }
}

module.exports = new FollowRepository();
