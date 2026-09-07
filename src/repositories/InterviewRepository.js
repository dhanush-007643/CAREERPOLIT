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
        { path: 'company', select: 'companyName logo location user' },
        {
          path: 'application',
          select: 'status job fresherProfile notes',
          populate: { path: 'job', select: 'title workMode location salaryRange company' }
        }
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
        {
          path: 'application',
          select: 'status job fresherProfile notes',
          populate: { path: 'job', select: 'title workMode location salaryRange company' }
        }
      ]
    );
  }
}

module.exports = new InterviewRepository();
