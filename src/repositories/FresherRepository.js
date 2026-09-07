const BaseRepository = require('./BaseRepository');
const FresherProfile = require('../models/FresherProfile');
const Resume = require('../models/Resume');

class FresherRepository extends BaseRepository {
  constructor() {
    super(FresherProfile);
  }

  async findByUserId(userId, populateUser = true) {
    let query = this.model.findOne({ user: userId });
    if (populateUser) {
      query = query.populate('user', 'name email role avatar isActive');
    }
    return await query.exec();
  }

  async createResumeRecord(resumeData) {
    return await Resume.create(resumeData);
  }

  async findResumeByUserId(userId) {
    return await Resume.findOne({ user: userId, isPrimary: true }).sort({ createdAt: -1 }).exec();
  }

  async deleteResumeRecord(userId) {
    return await Resume.deleteMany({ user: userId }).exec();
  }
}

module.exports = new FresherRepository();
