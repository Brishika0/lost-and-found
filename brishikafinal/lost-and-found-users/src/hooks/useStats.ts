import { useQuery } from "@tanstack/react-query";
import { statsApis } from "@/services/statsApis";
import type { StatsQueryParams } from "@/types/stats.types";

// QUERY KEYS

export const statsKeys = {
  all: ["stats"] as const,
  dashboard: (params?: StatsQueryParams) =>
    [...statsKeys.all, "dashboard", params] as const,
  items: (params?: StatsQueryParams) =>
    [...statsKeys.all, "items", params] as const,
  users: (params?: StatsQueryParams) =>
    [...statsKeys.all, "users", params] as const,
  zones: (params?: StatsQueryParams) =>
    [...statsKeys.all, "zones", params] as const,
  disputes: (params?: StatsQueryParams) =>
    [...statsKeys.all, "disputes", params] as const,
  chats: (params?: StatsQueryParams) =>
    [...statsKeys.all, "chats", params] as const,
  colleges: () => [...statsKeys.all, "colleges"] as const,
  export: (params?: StatsQueryParams) =>
    [...statsKeys.all, "export", params] as const,
};

// DASHBOARD STATS HOOK

/**
 * Get dashboard statistics
 * - Super Admin: sees all colleges data
 * - College Admin: sees only their college data
 */
export const useDashboardStats = (params?: StatsQueryParams) => {
  return useQuery({
    queryKey: statsKeys.dashboard(params),
    queryFn: () => statsApis.getDashboardStats(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ITEMS STATS HOOK

/**
 * Get items statistics with filters
 */
export const useItemsStats = (params?: StatsQueryParams) => {
  return useQuery({
    queryKey: statsKeys.items(params),
    queryFn: () => statsApis.getItemsStats(params),
    staleTime: 2 * 60 * 1000,
    enabled: !!params?.period, // Only fetch if period is provided
  });
};

// USERS STATS HOOK

/**
 * Get users statistics
 */
export const useUsersStats = (params?: StatsQueryParams) => {
  return useQuery({
    queryKey: statsKeys.users(params),
    queryFn: () => statsApis.getUsersStats(params),
    staleTime: 2 * 60 * 1000,
  });
};

// ZONES STATS HOOK

/**
 * Get zones statistics
 */
export const useZonesStats = (params?: StatsQueryParams) => {
  return useQuery({
    queryKey: statsKeys.zones(params),
    queryFn: () => statsApis.getZonesStats(params),
    staleTime: 2 * 60 * 1000,
  });
};

// DISPUTES STATS HOOK

/**
 * Get disputes statistics
 */
export const useDisputesStats = (params?: StatsQueryParams) => {
  return useQuery({
    queryKey: statsKeys.disputes(params),
    queryFn: () => statsApis.getDisputesStats(params),
    staleTime: 2 * 60 * 1000,
  });
};

// CHATS STATS HOOK

/**
 * Get chats statistics
 */
export const useChatsStats = (params?: StatsQueryParams) => {
  return useQuery({
    queryKey: statsKeys.chats(params),
    queryFn: () => statsApis.getChatsStats(params),
    staleTime: 2 * 60 * 1000,
  });
};

// COLLEGES STATS HOOK (Super Admin Only)

/**
 * Get all colleges statistics
 * - Super Admin only
 */
export const useCollegesStats = () => {
  return useQuery({
    queryKey: statsKeys.colleges(),
    queryFn: () => statsApis.getCollegesStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// EXPORT ANALYTICS HOOK

/**
 * Export analytics report
 * - Super Admin only
 */
export const useExportAnalytics = (params?: StatsQueryParams) => {
  return useQuery({
    queryKey: statsKeys.export(params),
    queryFn: () => statsApis.exportAnalytics(params),
    staleTime: 0, // Don't cache export data
    enabled: false, // Manual fetch only
  });
};
