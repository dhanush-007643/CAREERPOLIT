const companyRepository = require('../repositories/CompanyRepository');
const { ROLES } = require('../utils/constants');
const { NotFoundError, ForbiddenError, ConflictError } = require('../utils/customErrors');

class CompanyService {
  async createCompany(userId, data) {
    const existing = await companyRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictError('A company profile is already associated with this account', 'COMPANY_ALREADY_EXISTS');
    }

    return await companyRepository.create({
      ...data,
      user: userId
    });
  }

  async getAllCompanies(queryParams = {}) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const filter = { isPublic: true };

    if (queryParams.search) {
      const escaped = queryParams.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { companyName: { $regex: escaped, $options: 'i' } },
        { industry: { $regex: escaped, $options: 'i' } },
        { location: { $regex: escaped, $options: 'i' } }
      ];
    }

    if (queryParams.industry) {
      const escaped = queryParams.industry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.industry = { $regex: escaped, $options: 'i' };
    }

    if (queryParams.location) {
      const escaped = queryParams.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.location = { $regex: escaped, $options: 'i' };
    }

    return await companyRepository.paginate(filter, page, limit, { createdAt: -1 });
  }

  async getCompanyById(id, currentUser = null) {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found', 'COMPANY_NOT_FOUND');
    }

    // B09: Apply visibility rules for private company profiles
    if (company.isPublic === false) {
      if (!currentUser) {
        throw new ForbiddenError('This company profile is private and requires authorization', 'PRIVATE_COMPANY_ACCESS_DENIED');
      }
      const isOwner = company.user && company.user.toString() === (currentUser.id || currentUser._id).toString();
      const isAdmin = currentUser.role === ROLES.ADMIN;
      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('This company profile is private and requires authorization', 'PRIVATE_COMPANY_ACCESS_DENIED');
      }
    }

    return company;
  }

  async getMyCompany(userId) {
    const company = await companyRepository.findByUserId(userId);
    if (!company) {
      throw new NotFoundError('No company profile found for this account', 'COMPANY_NOT_FOUND');
    }
    return company;
  }

  async updateMyCompany(userId, updateData) {
    const company = await companyRepository.findByUserId(userId);
    if (!company) {
      throw new NotFoundError('No company profile found for this account', 'COMPANY_NOT_FOUND');
    }
    return await companyRepository.updateById(company._id, updateData);
  }

  async updateCompany(id, userId, userRole, updateData) {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found', 'COMPANY_NOT_FOUND');
    }

    // Ownership check: only owner startup user or ADMIN can update
    if (company.user.toString() !== userId.toString() && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only update your own company profile', 'FORBIDDEN_COMPANY_UPDATE');
    }

    return await companyRepository.updateById(id, updateData);
  }

  async deleteCompany(id, userId, userRole) {
    const company = await companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Company not found', 'COMPANY_NOT_FOUND');
    }

    if (company.user.toString() !== userId.toString() && userRole !== ROLES.ADMIN) {
      throw new ForbiddenError('You can only delete your own company profile', 'FORBIDDEN_COMPANY_DELETE');
    }

    await companyRepository.deleteById(id);
    return { message: 'Company profile deleted successfully' };
  }
}

module.exports = new CompanyService();
