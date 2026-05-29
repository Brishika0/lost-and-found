// types/notification.types.ts

export type NotificationType =
  | "item_match"
  | "chat_request"
  | "chat_accepted"
  | "chat_message"
  | "item_claimed"
  | "item_returned"
  | "dispute_update"
  | "comment"
  | "like"
  | "share"
  | "admin_approval"
  | "flag_resolved";

export type NotificationPriority = "low" | "medium" | "high";

export interface NotificationData {
  itemId?: string;
  chatId?: string;
  userId?: string;
  commentId?: string;
  disputeId?: string;
  matchScore?: number;
  itemName?: string;
  fromUserName?: string;
  messagePreview?: string;
  [key: string]: any;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  priority: NotificationPriority;
  isRead: boolean;
  isDelivered: boolean;
  isClicked: boolean;
  readAt?: string;
  deliveredAt?: string;
  clickedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  priority?: string;
  fromDate?: string;
  toDate?: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Array<{ _id: NotificationType; count: number }>;
  byPriority: Array<{ _id: NotificationPriority; count: number }>;
  recentTrends: Array<{ _id: string; count: number }>;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  data?: {
    notification?: Notification;
    updatedCount?: number;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  data?: {
    deletedCount?: number;
  };
}
