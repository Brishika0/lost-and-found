import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/services/notificationApis";
import type {
  Notification,
  NotificationQueryParams,
} from "@/types/notification.types";
import { toast } from "sonner";

//  Types

interface NotificationContextType {
  // Data
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;

  // Actions
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsClicked: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refetchNotifications: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;

  // Filters
  filters: NotificationQueryParams;
  setFilters: (filters: NotificationQueryParams) => void;

  // Real-time
  playSound: boolean;
  setPlaySound: (enabled: boolean) => void;
  showToast: boolean;
  setShowToast: (enabled: boolean) => void;
}

//  Query Keys

const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: NotificationQueryParams) =>
    [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  stats: () => [...notificationKeys.all, "stats"] as const,
};

//  Context

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

//  Provider Props

interface NotificationProviderProps {
  children: ReactNode;
  pollingInterval?: number; // in milliseconds, default 30000 (30 seconds)
  enableSound?: boolean;
  enableToast?: boolean;
}

//  Sound Effect (optional)

const playNotificationSound = () => {
  const audio = new Audio("/notification.mp3"); // Add your sound file to public folder
  audio.volume = 0.3;
  audio.play().catch(() => {
    // Auto-play might be blocked by browser
    console.log("Notification sound could not be played");
  });
};

//  Provider Component

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  pollingInterval = 30000,
  enableSound = true,
  enableToast = true,
}) => {
  const queryClient = useQueryClient();
  const previousUnreadCount = useRef<number>(0);
  const [filters, setFilters] = React.useState<NotificationQueryParams>({
    page: 1,
    limit: 20,
  });
  const [playSound, setPlaySound] = React.useState(enableSound);
  const [showToast, setShowToast] = React.useState(enableToast);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [allNotifications, setAllNotifications] = React.useState<
    Notification[]
  >([]);

  //  Queries

  // Get notifications with filters
  const {
    data: notificationsData,
    isLoading,
    isFetching,
    error,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationsApi.getNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get unread count
  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: pollingInterval,
  });

  //  Mutations

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: (_, id) => {
      // Update cache
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
      // Refetch unread count
      refetchUnreadCount();
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      // Update cache
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
      toast.success("All notifications marked as read");
    },
  });

  // Mark as clicked
  const markAsClickedMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsClicked(id),
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: (_, id) => {
      // Update cache
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
      toast.success("Notification deleted");
    },
  });

  // Delete all read notifications
  const deleteAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.deleteAllReadNotifications(),
    onSuccess: () => {
      // Update cache
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
      toast.success("Read notifications cleared");
    },
  });

  //  Handle New Notifications

  useEffect(() => {
    const currentUnreadCount = unreadCountData?.data?.unreadCount || 0;

    // Check for new notifications
    if (currentUnreadCount > previousUnreadCount.current) {
      const newCount = currentUnreadCount - previousUnreadCount.current;

      // Show toast for new notifications
      if (showToast && newCount > 0) {
        toast.success(
          `📬 ${newCount} new notification${newCount > 1 ? "s" : ""}`,
          {
            duration: 5000,
            action: {
              label: "View",
              onClick: () => {
                // Navigate to notifications page or open dropdown
                window.location.href = "/notifications";
              },
            },
          },
        );
      }

      // Play sound for new notifications
      if (playSound && newCount > 0) {
        playNotificationSound();
      }

      // Refetch notifications to show new ones
      refetchNotifications();
    }

    previousUnreadCount.current = currentUnreadCount;
  }, [
    unreadCountData?.data?.unreadCount,
    showToast,
    playSound,
    refetchNotifications,
  ]);

  //  Auto-refresh on focus

  useEffect(() => {
    const handleFocus = () => {
      refetchUnreadCount();
      refetchNotifications();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchUnreadCount, refetchNotifications]);

  //  Pagination

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

  //  Actions

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

  //  Context Value

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

//  Hook

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
