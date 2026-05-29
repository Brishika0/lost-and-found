"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services/notificationApis";
import type {
  Notification,
  NotificationQueryParams,
} from "@/types/notification.types";
import { toast } from "sonner";

// Types
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsClicked: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refetchNotifications: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  filters: NotificationQueryParams;
  setFilters: (filters: NotificationQueryParams) => void;
  playSound: boolean;
  setPlaySound: (enabled: boolean) => void;
  showToast: boolean;
  setShowToast: (enabled: boolean) => void;
}

// Query Keys
const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: NotificationQueryParams) =>
    [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  stats: () => [...notificationKeys.all, "stats"] as const,
};

// Context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Provider Props
interface NotificationProviderProps {
  children: ReactNode;
  pollingInterval?: number;
  enableSound?: boolean;
  enableToast?: boolean;
}

// Storage key for localStorage
const STORAGE_KEY = "toasted_notification_ids";

// Helper function to get stored toasted IDs
const getStoredToastedIds = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return new Set(JSON.parse(stored));
    } catch {
      return new Set();
    }
  }
  return new Set();
};

// Helper function to save toasted IDs to localStorage
const saveToastedIds = (ids: Set<string>) => {
  if (typeof window === "undefined") return;
  const idsArray = Array.from(ids).slice(-100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(idsArray));
};

// Helper function to get toast icon based on notification type
const getToastIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    ORDER_PLACED: "🛒",
    ORDER_CONFIRMED: "✅",
    ORDER_PREPARING: "👨‍🍳",
    ORDER_READY: "✅",
    ORDER_SERVED: "🍽️",
    ORDER_COMPLETED: "🎉",
    ORDER_CANCELLED: "❌",
    PAYMENT_RECEIVED: "💰",
    PAYMENT_FAILED: "⚠️",
    RESERVATION_CONFIRMED: "📅",
    RESERVATION_CANCELLED: "❌",
    LOYALTY_POINTS_EARNED: "⭐",
    LOYALTY_POINTS_REDEEMED: "🎁",
    GENERAL_ANNOUNCEMENT: "📢",
    KITCHEN_ORDER: "👨‍🍳",
    BAR_ORDER: "🍺",
    TABLE_STATUS_UPDATE: "🪑",
    STAFF_ASSIGNMENT: "👥",
  };
  return iconMap[type] || "🔔";
};

// Helper function to show toast for a single notification
const showNotificationToast = (
  title: string,
  message: string,
  type: string,
) => {
  const icon = getToastIcon(type);

  toast.info(title, {
    description: message,
    duration: 5000,
    icon: icon,
  });
};

// Sound Effect
const playNotificationSound = () => {
  const audio = new Audio("/notification.mp3");
  audio.volume = 0.3;
  audio.play().catch(() => {
    console.log("Notification sound could not be played");
  });
};

// Provider Component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  pollingInterval = 5000, // Changed to 5 seconds
  enableSound = true,
  enableToast = true,
}) => {
  const queryClient = useQueryClient();
  const [toastedNotificationIds, setToastedNotificationIds] = useState<
    Set<string>
  >(() => getStoredToastedIds());
  const [filters, setFilters] = useState<NotificationQueryParams>({
    page: 1,
    limit: 50,
  });
  const [playSound, setPlaySound] = useState(enableSound);
  const [showToast, setShowToast] = useState(enableToast);
  const [currentPage, setCurrentPage] = useState(1);

  // Use ref to track previous notifications for comparison
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());

  // Queries
  const {
    data: notificationsData,
    isLoading,
    isFetching,
    error,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationsApi.getNotifications(filters),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: pollingInterval, // Auto-refetch every 5 seconds
  });

  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 10 * 1000,
    refetchInterval: pollingInterval,
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        notificationKeys.list(filters),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              notifications: oldData.data.notifications.map(
                (n: Notification) =>
                  n._id === id
                    ? { ...n, isRead: true, readAt: new Date().toISOString() }
                    : n,
              ),
              unreadCount: Math.max(0, oldData.data.unreadCount - 1),
            },
          };
        },
      );
      refetchUnreadCount();
      // Remove from toasted set when marked as read
      setToastedNotificationIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData(
        notificationKeys.list(filters),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              notifications: oldData.data.notifications.map(
                (n: Notification) => ({
                  ...n,
                  isRead: true,
                  readAt: new Date().toISOString(),
                }),
              ),
              unreadCount: 0,
            },
          };
        },
      );
      refetchUnreadCount();
      setToastedNotificationIds(new Set());
      if (showToast) {
        toast.success("All notifications marked as read");
      }
    },
  });

  const markAsClickedMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsClicked(id),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        notificationKeys.list(filters),
        (oldData: any) => {
          if (!oldData) return oldData;
          const deletedNotification = oldData.data.notifications.find(
            (n: Notification) => n._id === id,
          );
          const wasUnread = deletedNotification?.isRead === false;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              notifications: oldData.data.notifications.filter(
                (n: Notification) => n._id !== id,
              ),
              unreadCount: wasUnread
                ? Math.max(0, oldData.data.unreadCount - 1)
                : oldData.data.unreadCount,
            },
          };
        },
      );
      refetchUnreadCount();
      setToastedNotificationIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      if (showToast) {
        toast.success("Notification deleted");
      }
    },
  });

  const deleteAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAllReadNotifications(),
    onSuccess: () => {
      queryClient.setQueryData(
        notificationKeys.list(filters),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              notifications: oldData.data.notifications.filter(
                (n: Notification) => !n.isRead,
              ),
            },
          };
        },
      );
      if (showToast) {
        toast.success("Read notifications cleared");
      }
    },
  });

  // Handle New Notifications - Show individual toast for each new notification
  useEffect(() => {
    const currentNotifications = notificationsData?.data?.notifications || [];
    const currentNotificationIds = new Set(
      currentNotifications.map((n) => n._id),
    );

    // Find new notification IDs (those not in previous ref)
    const newNotificationIds = new Set<string>();
    currentNotificationIds.forEach((id) => {
      if (!previousNotificationIdsRef.current.has(id)) {
        newNotificationIds.add(id);
      }
    });

    // Find new notifications that haven't been toasted yet
    const newNotifications = currentNotifications.filter(
      (notification: Notification) =>
        newNotificationIds.has(notification._id) &&
        !toastedNotificationIds.has(notification._id),
    );

    // Show toast for each new notification (even on page load)
    if (showToast && newNotifications.length > 0) {
      newNotifications.forEach((notification: Notification) => {
        // Add to toasted set to prevent duplicate toasts
        setToastedNotificationIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(notification._id);
          return newSet;
        });

        showNotificationToast(
          notification.title,
          notification.message,
          notification.type,
        );
      });
    }

    // Play sound for new notifications
    if (playSound && newNotifications.length > 0) {
      playNotificationSound();
    }

    // Update previous IDs ref
    previousNotificationIdsRef.current = currentNotificationIds;
  }, [
    notificationsData?.data?.notifications,
    showToast,
    playSound,
    toastedNotificationIds,
  ]);

  // Save toasted IDs to localStorage whenever they change
  useEffect(() => {
    saveToastedIds(toastedNotificationIds);
  }, [toastedNotificationIds]);

  // Auto-refresh on focus
  useEffect(() => {
    const handleFocus = () => {
      refetchUnreadCount();
      refetchNotifications();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchUnreadCount, refetchNotifications]);

  // Pagination
  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = unreadCountData?.data?.unreadCount || 0;
  const totalCount = notificationsData?.data?.pagination?.total || 0;
  const hasNextPage = notificationsData?.data?.pagination
    ? notificationsData.data.pagination.page <
      notificationsData.data.pagination.pages
    : false;
  const isFetchingNextPage = isFetching && currentPage > 1;

  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetching) {
      const nextPage = (notificationsData?.data?.pagination?.page || 0) + 1;
      setCurrentPage(nextPage);
      setFilters((prev) => ({ ...prev, page: nextPage }));
    }
  }, [hasNextPage, isFetching, notificationsData]);

  // Actions
  const markAsRead = useCallback(
    async (id: string) => {
      await markAsReadMutation.mutateAsync(id);
    },
    [markAsReadMutation],
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  const markAsClicked = useCallback(
    async (id: string) => {
      await markAsClickedMutation.mutateAsync(id);
    },
    [markAsClickedMutation],
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      await deleteNotificationMutation.mutateAsync(id);
    },
    [deleteNotificationMutation],
  );

  const deleteAllRead = useCallback(async () => {
    await deleteAllReadMutation.mutateAsync();
  }, [deleteAllReadMutation]);

  // Context Value
  const value: NotificationContextType = {
    notifications,
    unreadCount,
    totalCount,
    isLoading,
    isFetching,
    error: error as Error | null,
    markAsRead,
    markAllAsRead,
    markAsClicked,
    deleteNotification,
    deleteAllRead,
    refetchNotifications,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    filters,
    setFilters,
    playSound,
    setPlaySound,
    showToast,
    setShowToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
