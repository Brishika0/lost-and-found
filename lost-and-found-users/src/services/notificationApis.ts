import type {
  Notification,
  NotificationsResponse,
  NotificationStats,
  NotificationQueryParams,
  MarkAsReadResponse,
  DeleteResponse,
} from "@/types/notification.types";
import { API_BASE_URL } from "./authApis";

export const notificationsApi = {
  //  GET Notifications

  /**
   * Get user's notifications with pagination and filters
   * @param params - Query parameters for filtering and pagination
   */
  getNotifications: async ({
    page = 1,
    limit = 20,
    isRead,
    type,
    priority,
    fromDate,
    toDate,
  }: NotificationQueryParams = {}): Promise<NotificationsResponse> => {
    const url = new URL(`${API_BASE_URL}/notifications`);

    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    if (isRead !== undefined) {
      url.searchParams.append("isRead", isRead.toString());
    }
    if (type) {
      url.searchParams.append("type", type);
    }
    if (priority) {
      url.searchParams.append("priority", priority);
    }
    if (fromDate) {
      url.searchParams.append("fromDate", fromDate);
    }
    if (toDate) {
      url.searchParams.append("toDate", toDate);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch notifications");
    }

    return data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<{
    success: boolean;
    data: { unreadCount: number };
  }> => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch unread count");
    }

    return data;
  },

  /**
   * Get notification statistics
   */
  getNotificationStats: async (): Promise<{
    success: boolean;
    data: NotificationStats;
  }> => {
    const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch notification statistics",
      );
    }

    return data;
  },

  /**
   * Get single notification by ID
   * @param id - Notification ID
   */
  getNotificationById: async (
    id: string,
  ): Promise<{ success: boolean; data: { notification: Notification } }> => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch notification");
    }

    return data;
  },

  //  PUT/POST Operations

  /**
   * Mark a single notification as read
   * @param id - Notification ID
   */
  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark notification as read");
    }

    return data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<MarkAsReadResponse> => {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to mark all notifications as read",
      );
    }

    return data;
  },

  /**
   * Mark notification as delivered (for frontend tracking)
   * @param id - Notification ID
   */
  markAsDelivered: async (id: string): Promise<MarkAsReadResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${id}/delivered`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to mark notification as delivered",
      );
    }

    return data;
  },

  /**
   * Mark notification as clicked (when user clicks on notification)
   * @param id - Notification ID
   */
  markAsClicked: async (id: string): Promise<MarkAsReadResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${id}/clicked`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark notification as clicked");
    }

    return data;
  },

  //  DELETE Operations

  /**
   * Delete a single notification
   * @param id - Notification ID
   */
  deleteNotification: async (id: string): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete notification");
    }

    return data;
  },

  /**
   * Delete all read notifications
   */
  deleteAllReadNotifications: async (): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/notifications/read/all`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete read notifications");
    }

    return data;
  },
};
