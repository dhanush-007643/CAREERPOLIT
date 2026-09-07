const BaseRepository = require('./BaseRepository');
const Invitation = require('../models/Invitation');

class InvitationRepository extends BaseRepository {
  constructor() {
    super(Invitation);
  }

  async findByFresher(fresherId, page = 1, limit = 20) {
    return await this.paginate(
      { fresher: fresherId },
      page,
      limit,
      { createdAt: -1 },
      [
        { path: 'company', select: 'companyName logo industry location website' },
        { path: 'job', select: 'title workMode location salaryRange status' }
      ]
    );
  }

  async findByCompany(companyId, page = 1, limit = 20) {
    return await this.paginate(
      { company: companyId },
      page,
      limit,
      { createdAt: -1 },
      [
        { path: 'fresher', select: 'name email avatar' },
        { path: 'job', select: 'title' }
      ]
    );
  }
}

module.exports = new InvitationRepository();
