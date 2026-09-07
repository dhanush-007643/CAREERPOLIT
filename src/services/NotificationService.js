const notificationRepository = require('../repositories/NotificationRepository');
const { NOTIFICATION_TYPE } = require('../utils/constants');
const { NotFoundError } = require('../utils/customErrors');

class NotificationService {
  async notify({ recipient, sender, type, title, message, entityId, entityType, actionUrl }) {
    if (!recipient) return null;
    return await notificationRepository.create({
      recipient,
      sender: sender || null,
      type: type || NOTIFICATION_TYPE.SYSTEM,
      title,
      message,
      entityId,
      entityType,
      actionUrl: actionUrl || ''
    });
  }

  async getUserNotifications(userId, page = 1, limit = 20) {
    const [result, unreadCount] = await Promise.all([
      notificationRepository.findByUser(userId, page, limit),
      notificationRepository.getUnreadCount(userId)
    ]);
    return {
      notifications: result.data,
      unreadCount,
      pagination: result.pagination
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await notificationRepository.markAsRead(notificationId, userId);
    if (!notification) {
      throw new NotFoundError('Notification not found', 'NOTIFICATION_NOT_FOUND');
    }
    return notification;
  }

  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }
}

module.exports = new NotificationService();
