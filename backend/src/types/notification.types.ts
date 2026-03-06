export interface INotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface CreateNotificationDTO {
  user_id: string;
  type: string;
  title: string;
  message: string;
}

export interface NotificationFiltersDTO {
  page?: number;
  limit?: number;
  type?: string;
  is_read?: number;
}
