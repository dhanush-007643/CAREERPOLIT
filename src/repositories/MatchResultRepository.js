const BaseRepository = require('./BaseRepository');
const MatchResult = require('../models/MatchResult');

class MatchResultRepository extends BaseRepository {
  constructor() {
    super(MatchResult);
  }

  async saveOrUpdateMatch(fresherId, jobId, matchData) {
    return await this.model.findOneAndUpdate(
      { fresher: fresherId, job: jobId },
      { ...matchData, calculatedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    ).exec();
  }

  async getMatchesForFresher(fresherId, limit = 20) {
    return await this.model.find({ fresher: fresherId })
      .sort({ matchScore: -1 })
      .limit(limit)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'companyName logo location industry' }
      })
      .exec();
  }

  async getMatchesForJob(jobId, limit = 50) {
    return await this.model.find({ job: jobId })
      .sort({ matchScore: -1 })
      .limit(limit)
      .populate({
        path: 'fresher',
        select: 'name email avatar'
      })
      .exec();
  }
}

module.exports = new MatchResultRepository();
