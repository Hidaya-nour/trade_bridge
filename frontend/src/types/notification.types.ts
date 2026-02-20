// types/notification.types.ts

export type NotificationType = 
  | 'order_update'
  | 'payment_received'
  | 'payment_confirmed'
  | 'delivery_update'
  | 'message_received'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'supplier_approved'
  | 'document_verified'
  | 'promotion_created'
  | 'system_alert';

export interface Notification {
  id: string;                    // CHAR(36) PK
  user_id: string;                // CHAR(36) FK - references users.id
  type: NotificationType;         // ENUM
  title: string;                  // VARCHAR(255)
  message: string;                // TEXT
  is_read: number;                // TINYINT(1) - 0 or 1
  created_at: string;             // TIMESTAMP
  deleted_at?: string | null;     // TIMESTAMP
  
  // Relations (joined data)
  user?: {
    id: string;
    full_name: string;
    business_name?: string;
    email?: string;
  };
}

// ============================================================================
// Notification Filters
// ============================================================================

export interface NotificationFilters {
  is_read?: boolean;
  type?: NotificationType;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'type' | 'is_read';
  sortOrder?: 'ASC' | 'DESC';
}

// ============================================================================
// Notification API Types
// ============================================================================

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

export interface NotificationResponse {
  success: boolean;
  data: {
    notification: Notification;
  };
}

export interface MarkAsReadData {
  notification_ids?: string[];  // If empty, mark all as read
}

export interface MarkAsReadResponse {
  success: boolean;
  data: {
    marked_count: number;
  };
}

// ============================================================================
// Notification Store State
// ============================================================================

export interface NotificationState {
  // Data
  notifications: Notification[];
  currentNotification: Notification | null;
  totalNotifications: number;
  currentPage: number;
  totalPages: number;
  unreadCount: number;
  
  // UI States
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: NotificationFilters;
}

export interface NotificationActions {
  // Fetch actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchNotificationById: (id: string) => Promise<Notification | null>;
  fetchUnreadCount: () => Promise<void>;
  
  // Mutation actions
  unreadCount: number;
  markAsRead: (notificationIds?: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  clearAll: () => Promise<boolean>;
  
  // Filter actions
  setFilters: (filters: NotificationFilters) => void;
  clearFilters: () => void;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

export type NotificationStore = NotificationState & NotificationActions;