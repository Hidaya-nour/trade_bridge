export type NotificationType =
  | "order"
  | "payment"
  | "delivery"
  | "message"
  | "promotion"
  | "dispute"
  | "system"
  | string;

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  is_read?: 0 | 1;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
    unread_count: number;
  };
}

export interface NotificationCountsResponse {
  success: boolean;
  data: {
    unread: number;
    total: number;
  };
}

