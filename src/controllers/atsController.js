const atsService = require('../services/AtsService');
const ApiResponse = require('../utils/apiResponse');

class AtsController {
  async getPipeline(req, res, next) {
    try {
      const { jobId } = req.query;
      const pipelineData = await atsService.getPipelineBoard(req.user._id, jobId);
      return ApiResponse.success(res, pipelineData, 'ATS Pipeline retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStage(req, res, next) {
    try {
      const { status, note } = req.body;
      const updated = await atsService.updateStage(req.params.id, req.user._id, req.user.role, status, note);
      return ApiResponse.success(res, updated, 'Candidate stage transitioned successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AtsController();
