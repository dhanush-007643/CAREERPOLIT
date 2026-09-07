const BaseRepository = require('./BaseRepository');
const Application = require('../models/Application');

class ApplicationRepository extends BaseRepository {
  constructor() {
    super(Application);
  }

  async findByFresher(fresherId, page = 1, limit = 10) {
    return await this.paginate(
      { fresher: fresherId },
      page,
      limit,
      { createdAt: -1 },
      [
        { path: 'job', select: 'title location workMode employmentType salaryRange status' },
        { path: 'company', select: 'companyName logo location' }
      ]
    );
  }

  async findByJob(jobId, page = 1, limit = 20, status = null) {
    const filter = { job: jobId };
    if (status) filter.status = status;

    return await this.paginate(
      filter,
      page,
      limit,
      { createdAt: -1 },
      [
        { path: 'fresher', select: 'name email avatar' },
        { path: 'fresherProfile' }
      ]
    );
  }

  async findByCompany(companyId, status = null, page = 1, limit = 50) {
    const filter = { company: companyId };
    if (status) filter.status = status;

    return await this.paginate(
      filter,
      page,
      limit,
      { createdAt: -1 },
      [
        { path: 'job', select: 'title location workMode' },
        { path: 'fresher', select: 'name email avatar' },
        { path: 'fresherProfile' }
      ]
    );
  }

  async findExistingApplication(jobId, fresherId) {
    return await this.model.findOne({ job: jobId, fresher: fresherId }).exec();
  }

  async getPipelineCounts(companyId) {
    return await this.model.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
  }
}

module.exports = new ApplicationRepository();
