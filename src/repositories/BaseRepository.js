class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, populate = null, select = null) {
    let query = this.model.findById(id);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return await query.exec();
  }

  async findOne(filter = {}, populate = null, select = null) {
    let query = this.model.findOne(filter);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return await query.exec();
  }

  async find(filter = {}, sort = { createdAt: -1 }, limit = 0, skip = 0, populate = null, select = null) {
    let query = this.model.find(filter).sort(sort);
    if (skip > 0) query = query.skip(skip);
    if (limit > 0) query = query.limit(Math.min(limit, 500));
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return await query.exec();
  }

  async create(data) {
    const document = new this.model(data);
    return await document.save();
  }

  async updateById(id, updateData, options = { new: true, runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, updateData, options).exec();
  }

  async updateOne(filter, updateData, options = { new: true, runValidators: true }) {
    return await this.model.findOneAndUpdate(filter, updateData, options).exec();
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async deleteOne(filter) {
    return await this.model.findOneAndDelete(filter).exec();
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter).exec();
  }

  async paginate(filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, populate = null, select = null) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, data] = await Promise.all([
      this.model.countDocuments(filter).exec(),
      this.find(filter, sort, limitNum, skip, populate, select)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }
}

module.exports = BaseRepository;
