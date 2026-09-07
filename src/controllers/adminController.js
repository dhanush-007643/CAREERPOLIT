const adminService = require('../services/AdminService');
const ApiResponse = require('../utils/apiResponse');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const data = await adminService.getDashboardAnalytics();
      return ApiResponse.success(res, data, 'Admin dashboard metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const data = await adminService.getDashboardAnalytics();
      return ApiResponse.success(res, data, 'Analytics metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const result = await adminService.getAllUsers(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const user = await adminService.toggleUserStatus(req.params.id, isActive);
      return ApiResponse.success(res, user, `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  async getCompanies(req, res, next) {
    try {
      const result = await adminService.getAllCompanies(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Companies retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getJobs(req, res, next) {
    try {
      const result = await adminService.getAllJobs(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Jobs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getApplications(req, res, next) {
    try {
      const result = await adminService.getAllApplications(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Applications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
