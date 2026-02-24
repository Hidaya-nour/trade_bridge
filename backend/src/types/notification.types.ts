export interface INotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: number;
  
}

export interface CreateNotificationDTO {
  user_id: string;
  type: string;
  title: string;
  message: string;
}
