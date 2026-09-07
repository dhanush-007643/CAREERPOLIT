const matchingService = require('../services/MatchingService');
const ApiResponse = require('../utils/apiResponse');

class MatchingController {
  async getMatchingJobs(req, res, next) {
    try {
      const { limit } = req.query;
      const matches = await matchingService.matchFresherToAllJobs(req.user._id, limit ? parseInt(limit, 10) : 20);
      return ApiResponse.success(res, matches, 'Matched jobs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMatchingJobById(req, res, next) {
    try {
      const match = await matchingService.matchFresherToJob(req.user._id, req.params.jobId);
      return ApiResponse.success(res, match, 'Job match analysis calculated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMatchingCandidates(req, res, next) {
    try {
      const { limit } = req.query;
      const matches = await matchingService.matchCandidatesForJob(
        req.params.jobId,
        req.user._id,
        req.user.role,
        limit ? parseInt(limit, 10) : 50
      );
      return ApiResponse.success(res, matches, 'Matched candidates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MatchingController();
