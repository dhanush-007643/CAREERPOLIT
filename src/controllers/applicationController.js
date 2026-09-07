const applicationService = require('../services/ApplicationService');
const ApiResponse = require('../utils/apiResponse');

class ApplicationController {
  async applyForJob(req, res, next) {
    try {
      const application = await applicationService.applyForJob(req.user._id, req.params.jobId, req.body);
      return ApiResponse.created(res, application, 'Application submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyApplications(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await applicationService.getMyApplications(req.user._id, page, limit);
      return ApiResponse.paginated(res, result.data, result.pagination, 'My applications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getJobApplications(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await applicationService.getJobApplications(req.params.jobId, req.user._id, req.user.role, page, limit, status);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Job applicants retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getApplicationById(req, res, next) {
    try {
      const application = await applicationService.getApplicationById(req.params.id, req.user);
      return ApiResponse.success(res, application, 'Application details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, note } = req.body;
      const application = await applicationService.updateApplicationStatus(req.params.id, req.user._id, req.user.role, status, note);
      return ApiResponse.success(res, application, 'Application status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplicationController();
