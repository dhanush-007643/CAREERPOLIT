const assessmentService = require('../services/AssessmentService');
const ApiResponse = require('../utils/apiResponse');

class AssessmentController {
  async createAssessment(req, res, next) {
    try {
      const assessment = await assessmentService.createAssessment(req.body);
      return ApiResponse.created(res, assessment, 'Assessment created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAssessments(req, res, next) {
    try {
      const { category } = req.query;
      const assessments = await assessmentService.getAssessments(category);
      return ApiResponse.success(res, assessments, 'Assessments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentById(req, res, next) {
    try {
      const assessment = await assessmentService.getAssessmentById(req.params.id);
      return ApiResponse.success(res, assessment, 'Assessment details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async submitAssessment(req, res, next) {
    try {
      const { answers } = req.body;
      const result = await assessmentService.submitAssessment(req.params.id, req.user._id, answers);
      return ApiResponse.success(res, result, 'Assessment submitted and evaluated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssessmentController();
