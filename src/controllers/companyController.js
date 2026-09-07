const companyService = require('../services/CompanyService');
const ApiResponse = require('../utils/apiResponse');

class CompanyController {
  async createCompany(req, res, next) {
    try {
      const company = await companyService.createCompany(req.user._id, req.body);
      return ApiResponse.created(res, company, 'Company profile created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllCompanies(req, res, next) {
    try {
      const result = await companyService.getAllCompanies(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Companies retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const company = await companyService.getMyCompany(req.user._id);
      return ApiResponse.success(res, company, 'Company profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(req, res, next) {
    try {
      const company = await companyService.updateMyCompany(req.user._id, req.body);
      return ApiResponse.success(res, company, 'Company profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req, res, next) {
    try {
      const company = await companyService.getCompanyById(req.params.id, req.user || null);
      return ApiResponse.success(res, company, 'Company details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req, res, next) {
    try {
      const company = await companyService.updateCompany(req.params.id, req.user._id, req.user.role, req.body);
      return ApiResponse.success(res, company, 'Company profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCompany(req, res, next) {
    try {
      const result = await companyService.deleteCompany(req.params.id, req.user._id, req.user.role);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyController();
