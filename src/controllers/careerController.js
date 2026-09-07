const careerService = require('../services/CareerService');
const ApiResponse = require('../utils/apiResponse');

class CareerController {
  async getCareerProfile(req, res, next) {
    try {
      const careerProfile = await careerService.getCareerProfile(req.user._id);
      return ApiResponse.success(res, careerProfile, 'Career profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async setCareerAssessment(req, res, next) {
    try {
      const { targetRole } = req.body;
      const result = await careerService.setCareerGoal(req.user._id, targetRole);
      return ApiResponse.success(res, result, 'Career goal updated and roadmap generated');
    } catch (error) {
      next(error);
    }
  }

  async getSkillGap(req, res, next) {
    try {
      const { targetRole } = req.query;
      const skillGap = await careerService.calculateSkillGap(req.user._id, targetRole);
      return ApiResponse.success(res, skillGap, 'Skill gap analysis calculated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req, res, next) {
    try {
      const { targetRole } = req.query;
      const roadmap = await careerService.getRoadmap(req.user._id, targetRole);
      return ApiResponse.success(res, roadmap, 'Career recommendations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRoadmap(req, res, next) {
    try {
      const { targetRole } = req.query;
      const roadmap = await careerService.getRoadmap(req.user._id, targetRole);
      return ApiResponse.success(res, roadmap, 'Learning roadmap retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateRoadmapStep(req, res, next) {
    try {
      const { stepNumber, status } = req.body;
      const result = await careerService.updateRoadmapStepProgress(req.user._id, stepNumber, status);
      return ApiResponse.success(res, result, 'Roadmap step updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CareerController();
