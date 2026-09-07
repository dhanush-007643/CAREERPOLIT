const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, includePassword = false) {
    let query = this.model.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query = query.select('+password');
    }
    return await query.exec();
  }

  async findByResetToken(token) {
    return await this.model.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    }).exec();
  }
}

module.exports = new UserRepository();
