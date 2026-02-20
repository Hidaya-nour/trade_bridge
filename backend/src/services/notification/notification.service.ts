import Notification from '../../models/notification.model';
import { CreateNotificationDTO } from '../../types/notification.types';

export class NotificationService {
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      notifications: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }
async getNotificationCounts(userId: string) {
    const unreadCount = await Notification.count({ where: { user_id: userId, is_read: 0 } });
    return { unread_count: unreadCount };
  }

  async createNotification(data: CreateNotificationDTO) {
    const created = await Notification.create({
      ...data,
      is_read: 0
    } as any);
    return created;
  }

  async markAsRead(notificationId: string, userId: string) {
    const [updated] = await Notification.update({ is_read: 1 }, { where: { id: notificationId, user_id: userId } });
    return updated > 0;
  }

  async markAllRead(userId: string) {
    const [updated] = await Notification.update({ is_read: 1 }, { where: { user_id: userId, is_read: 0 } });
    return updated > 0;
  }

  async deleteNotification(id: string) {
    const deleted = await Notification.destroy({ where: { id } });
    return deleted > 0;
  } 
}
export default new NotificationService();
