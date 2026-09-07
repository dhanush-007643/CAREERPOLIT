const jobService = require('../services/JobService');
const ApiResponse = require('../utils/apiResponse');

class JobController {
  async createJob(req, res, next) {
    try {
      const job = await jobService.createJob(req.user._id, req.body);
      return ApiResponse.created(res, job, 'Job created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllJobs(req, res, next) {
    try {
      const result = await jobService.searchJobs(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Jobs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyJobs(req, res, next) {
    try {
      const result = await jobService.getMyJobs(req.user._id, req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'My jobs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req, res, next) {
    try {
      const job = await jobService.getJobById(req.params.id, req.user);
      return ApiResponse.success(res, job, 'Job details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req, res, next) {
    try {
      const job = await jobService.updateJob(req.params.id, req.user._id, req.user.role, req.body);
      return ApiResponse.success(res, job, 'Job updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req, res, next) {
    try {
      const result = await jobService.deleteJob(req.params.id, req.user._id, req.user.role);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JobController();
