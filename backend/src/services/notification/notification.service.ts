import Notification from '../../models/notification.model';
import { CreateNotificationDTO, NotificationFiltersDTO } from '../../types/notification.types';
import { WhereOptions } from 'sequelize';

export class NotificationService {
  async getUserNotifications(userId: string, filters: NotificationFiltersDTO = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    const where: WhereOptions = { user_id: userId };

    if (filters.type) {
      (where as any).type = filters.type;
    }
    if (typeof filters.is_read === 'number') {
      (where as any).is_read = filters.is_read;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    const unread_count = await Notification.count({ where: { user_id: userId, is_read: 0 } });

    return {
      notifications: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      unread_count,
    };
  }

  async getNotificationCounts(userId: string) {
    const unreadCount = await Notification.count({ where: { user_id: userId, is_read: 0 } });
    const totalCount = await Notification.count({ where: { user_id: userId } });
    return {
      unread: unreadCount,
      total: totalCount
    };
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

  async deleteNotification(id: string, userId: string) {
    const deleted = await Notification.destroy({ where: { id, user_id: userId } });
    return deleted > 0;
  }

  async clearAll(userId: string) {
    const deleted = await Notification.destroy({ where: { user_id: userId } });
    return deleted;
  }
}
export default new NotificationService();
