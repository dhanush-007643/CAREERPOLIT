const fresherService = require('../services/FresherService');
const ApiResponse = require('../utils/apiResponse');

class FresherController {
  async getProfile(req, res, next) {
    try {
      const profile = await fresherService.getProfile(req.user._id);
      return ApiResponse.success(res, profile, 'Fresher profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await fresherService.updateProfile(req.user._id, req.body);
      return ApiResponse.success(res, profile, 'Fresher profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async uploadResume(req, res, next) {
    try {
      const result = await fresherService.uploadResume(req.user._id, req.file);
      return ApiResponse.success(res, result, 'Resume uploaded and processed successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteResume(req, res, next) {
    try {
      const result = await fresherService.deleteResume(req.user._id);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FresherController();
