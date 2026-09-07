const authService = require('../services/AuthService');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return ApiResponse.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return ApiResponse.success(res, result, 'Logged in successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      return ApiResponse.success(res, {}, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const result = await authService.getMe(req.user._id);
      return ApiResponse.success(res, result, 'Current user retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
