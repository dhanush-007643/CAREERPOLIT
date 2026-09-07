const interviewService = require('../services/InterviewService');
const ApiResponse = require('../utils/apiResponse');

class InterviewController {
  async scheduleInterview(req, res, next) {
    try {
      const interview = await interviewService.scheduleInterview(req.user._id, req.body);
      return ApiResponse.created(res, interview, 'Interview scheduled successfully');
    } catch (error) {
      next(error);
    }
  }

  async getInterviews(req, res, next) {
    try {
      const result = await interviewService.getInterviews(req.user, req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Interviews retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateInterview(req, res, next) {
    try {
      const interview = await interviewService.updateInterview(req.params.id, req.user._id, req.user.role, req.body);
      return ApiResponse.success(res, interview, 'Interview updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async cancelInterview(req, res, next) {
    try {
      const result = await interviewService.cancelInterview(req.params.id, req.user._id, req.user.role, req.body.reason);
      return ApiResponse.success(res, result.interview, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InterviewController();
