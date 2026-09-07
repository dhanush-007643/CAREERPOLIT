const BaseRepository = require('./BaseRepository');
const Interview = require('../models/Interview');

class InterviewRepository extends BaseRepository {
  constructor() {
    super(Interview);
  }

  async findByFresher(fresherId, page = 1, limit = 20) {
    return await this.paginate(
      { fresher: fresherId },
      page,
      limit,
      { date: 1 },
      [
        { path: 'company', select: 'companyName logo location' },
        { path: 'application', select: 'status' }
      ]
    );
  }

  async findByCompany(companyId, page = 1, limit = 20) {
    return await this.paginate(
      { company: companyId },
      page,
      limit,
      { date: 1 },
      [
        { path: 'fresher', select: 'name email avatar' },
        { path: 'application', select: 'status job' }
      ]
    );
  }
}

module.exports = new InterviewRepository();
