const BaseRepository = require('./BaseRepository');
const Job = require('../models/Job');
const { JOB_STATUS, JOB_VISIBILITY } = require('../utils/constants');

class JobRepository extends BaseRepository {
  constructor() {
    super(Job);
  }

  async findPublicJobs(filters = {}, page = 1, limit = 10, sort = { createdAt: -1 }) {
    const queryFilter = {
      status: JOB_STATUS.OPEN,
      visibility: JOB_VISIBILITY.PUBLIC,
      ...filters
    };

    return await this.paginate(
      queryFilter,
      page,
      limit,
      sort,
      { path: 'company', select: 'companyName logo location industry website isPublic' }
    );
  }

  async findCompanyJobs(companyId, status = null) {
    const filter = { company: companyId };
    if (status) filter.status = status;
    return await this.find(filter, { createdAt: -1 }, 0, 0, { path: 'company', select: 'companyName logo' });
  }

  async findOwnerJobs(userId, params = {}, page = 1, limit = 10) {
    const filter = { postedBy: userId };
    if (params.status) {
      filter.status = params.status;
    }
    if (params.search) {
      const escaped = params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { location: { $regex: escaped, $options: 'i' } }
      ];
    }
    return await this.paginate(filter, page, limit, { createdAt: -1 }, { path: 'company', select: 'companyName logo' });
  }

  async searchJobs(params = {}, page = 1, limit = 10) {
    const filter = {
      status: JOB_STATUS.OPEN,
      visibility: JOB_VISIBILITY.PUBLIC
    };

    if (params.search) {
      // B29: Escape regex special characters to prevent errors with C++, C#, etc.
      const escaped = params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(escaped, 'i')] } }
      ];
    }

    if (params.skills) {
      const skillsArray = Array.isArray(params.skills)
        ? params.skills
        : params.skills.split(',').map((s) => s.trim());
      filter.requiredSkills = {
        $in: skillsArray.map((s) => {
          const esc = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp(`^${esc}$`, 'i');
        })
      };
    }

    if (params.location) {
      const escapedLoc = params.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.location = { $regex: escapedLoc, $options: 'i' };
    }

    if (params.workMode) {
      filter.workMode = params.workMode.toUpperCase();
    }

    if (params.employmentType) {
      filter.employmentType = params.employmentType.toUpperCase();
    }

    if (params.experience !== undefined && params.experience !== '') {
      const expNum = parseInt(params.experience, 10);
      if (!isNaN(expNum)) {
        filter['experience.minYears'] = { $lte: expNum };
      }
    }

    let sort = { createdAt: -1 };
    if (params.sortBy === 'salary') {
      sort = { 'salaryRange.max': -1 };
    } else if (params.sortBy === 'deadline') {
      sort = { applicationDeadline: 1 };
    }

    return await this.paginate(
      filter,
      page,
      limit,
      sort,
      { path: 'company', select: 'companyName logo location industry website' }
    );
  }
}

module.exports = new JobRepository();
