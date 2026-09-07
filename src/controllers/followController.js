const followService = require('../services/FollowService');
const ApiResponse = require('../utils/apiResponse');

class FollowController {
  async followCompany(req, res, next) {
    try {
      const result = await followService.followCompany(req.user._id, req.params.id, req.user.name);
      return ApiResponse.success(res, result.follow, result.message);
    } catch (error) {
      next(error);
    }
  }

  async unfollowCompany(req, res, next) {
    try {
      const result = await followService.unfollowCompany(req.user._id, req.params.id);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await followService.getFollowing(req.user._id, page, limit);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Followed companies retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCompanyFollowers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await followService.getCompanyFollowers(req.params.id, page, limit);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Company followers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FollowController();
