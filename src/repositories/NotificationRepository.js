const BaseRepository = require('./BaseRepository');
const Notification = require('../models/Notification');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findByUser(userId, page = 1, limit = 20) {
    return await this.paginate(
      { recipient: userId },
      page,
      limit,
      { createdAt: -1 },
      { path: 'sender', select: 'name avatar' }
    );
  }

  async markAsRead(notificationId, userId) {
    return await this.updateOne(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() }
    );
  }

  async markAllAsRead(userId) {
    return await this.model.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    ).exec();
  }

  async getUnreadCount(userId) {
    return await this.count({ recipient: userId, isRead: false });
  }
}

module.exports = new NotificationRepository();
