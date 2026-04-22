import api from "@/lib/api";
import type {
  NotificationCountsResponse,
  NotificationFilters,
  NotificationsResponse,
} from "./notification.types";

class NotificationService {
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationsResponse> {
    const response = await api.get("/notifications", { params: filters });
    return response.data;
  }

  async getCounts(): Promise<NotificationCountsResponse> {
    const response = await api.get("/notifications/counts");
    return response.data;
  }

  async markAsRead(id: string) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllRead() {
    const response = await api.patch("/notifications/mark-all-read");
    return response.data;
  }

  async clearAll() {
    const response = await api.delete("/notifications");
    return response.data;
  }

  async deleteNotification(id: string) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
}

export default new NotificationService();
