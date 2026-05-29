import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { notificationsApi } from "@/services/notificationApis";
import type { NotificationQueryParams } from "@/types/notification.types";
import { toast } from "sonner";

//  Query Keys

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params: NotificationQueryParams) =>
    [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  stats: () => [...notificationKeys.all, "stats"] as const,
  detail: (id: string) => [...notificationKeys.all, "detail", id] as const,
};

//  Query Hooks

/**
 * Get notifications with pagination and filters
 */
export const useNotifications = (params: NotificationQueryParams = {}) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Get infinite notifications for infinite scroll
 */
export const useInfiniteNotifications = (
  params: Omit<NotificationQueryParams, "page"> = {},
) => {
  return useInfiniteQuery({
    queryKey: [...notificationKeys.lists(), params],
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.getNotifications({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.data.pagination;
      return page < pages ? page + 1 : undefined;
    },
  });
};

/**
 * Get unread notification count
 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 10 * 1000,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Get notification statistics
 */
export const useNotificationStats = () => {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationsApi.getNotificationStats(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get single notification by ID
 */
export const useNotification = (id: string) => {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationsApi.getNotificationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

//  Mutation Hooks

/**
 * Mark a single notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });

      // Update cache for unread count
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              unreadCount: Math.max(0, oldData.data.unreadCount - 1),
            },
          };
        },
      );
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
      queryClient.setQueryData(notificationKeys.unreadCount(), {
        success: true,
        data: { unreadCount: 0 },
      });
      toast.success("All notifications marked as read");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark all as read");
    },
  });
};

/**
 * Mark notification as clicked
 */
export const useMarkAsClicked = () => {
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsClicked(id),
  });
};

/**
 * Mark notification as delivered
 */
export const useMarkAsDelivered = () => {
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsDelivered(id),
  });
};

/**
 * Delete a single notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
      toast.success("Notification deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });
};

/**
 * Delete all read notifications
 */
export const useDeleteAllRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.deleteAllReadNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success("Read notifications cleared");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to clear read notifications");
    },
  });
};
