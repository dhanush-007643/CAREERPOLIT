const BaseRepository = require('./BaseRepository');
const CareerRecommendation = require('../models/CareerRecommendation');

class CareerRepository extends BaseRepository {
  constructor() {
    super(CareerRecommendation);
  }

  async findByFresher(fresherId) {
    return await this.model.findOne({ fresher: fresherId }).sort({ updatedAt: -1 }).exec();
  }

  async saveOrUpdateRecommendation(fresherId, targetRole, data) {
    return await this.model.findOneAndUpdate(
      { fresher: fresherId, targetRole },
      { ...data, fresher: fresherId, targetRole },
      { upsert: true, new: true, runValidators: true }
    ).exec();
  }
}

module.exports = new CareerRepository();
