const BaseRepository = require('./BaseRepository');
const Company = require('../models/Company');

class CompanyRepository extends BaseRepository {
  constructor() {
    super(Company);
  }

  async findByUserId(userId) {
    return await this.model.findOne({ user: userId }).exec();
  }

  async searchCompanies(queryStr, pagination = { page: 1, limit: 10 }) {
    const filter = { isPublic: true };
    if (queryStr) {
      filter.$text = { $search: queryStr };
    }
    return await this.paginate(filter, pagination.page, pagination.limit);
  }
}

module.exports = new CompanyRepository();
