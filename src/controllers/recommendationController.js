const recommendationService = require('../services/RecommendationService');
const ApiResponse = require('../utils/apiResponse');

class RecommendationController {
  async getRecommendedJobs(req, res, next) {
    try {
      const { limit } = req.query;
      const recommendations = await recommendationService.getRecommendedJobsForFresher(
        req.user._id,
        limit ? parseInt(limit, 10) : 10
      );
      return ApiResponse.success(res, recommendations, 'Recommended jobs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRecommendedCandidates(req, res, next) {
    try {
      const { limit } = req.query;
      const recommendations = await recommendationService.getRecommendedCandidatesForJob(
        req.params.jobId,
        req.user._id,
        req.user.role,
        limit ? parseInt(limit, 10) : 10
      );
      return ApiResponse.success(res, recommendations, 'Recommended candidates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();
