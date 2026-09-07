const notificationService = require('../services/NotificationService');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await notificationService.getUserNotifications(req.user._id, page, limit);
      return ApiResponse.success(res, result, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user._id);
      return ApiResponse.success(res, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user._id);
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
