import type {
  StatsQueryParams,
  DashboardStatsResponse,
  ItemsStatsResponse,
  UsersStatsResponse,
  ZonesStatsResponse,
  DisputesStatsResponse,
  ChatsStatsResponse,
  CollegesStatsResponse,
  ExportAnalyticsResponse,
} from "@/types/stats.types";
import { API_BASE_URL } from "./authApis";

// Helper to handle response
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data as T;
}

// Helper to build query string
function buildQueryString(params: Record<string, any>): string {
  const filtered = Object.entries(params).filter(
    ([_, value]) => value !== undefined && value !== null && value !== "",
  );
  if (filtered.length === 0) return "";
  return (
    "?" +
    filtered
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")
  );
}

export const statsApis = {
  //  DASHBOARD STATS

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (
    params?: StatsQueryParams,
  ): Promise<DashboardStatsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(
      `${API_BASE_URL}/stats/dashboard${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<DashboardStatsResponse>(response);
  },

  //  ITEMS STATS

  /**
   * Get items statistics with filters
   */
  getItemsStats: async (
    params?: StatsQueryParams,
  ): Promise<ItemsStatsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(`${API_BASE_URL}/stats/items${queryString}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<ItemsStatsResponse>(response);
  },

  //  USERS STATS

  /**
   * Get users statistics
   */
  getUsersStats: async (
    params?: StatsQueryParams,
  ): Promise<UsersStatsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(`${API_BASE_URL}/stats/users${queryString}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<UsersStatsResponse>(response);
  },

  //  ZONES STATS

  /**
   * Get zones statistics
   */
  getZonesStats: async (
    params?: StatsQueryParams,
  ): Promise<ZonesStatsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(`${API_BASE_URL}/stats/zones${queryString}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<ZonesStatsResponse>(response);
  },

  //  DISPUTES STATS

  /**
   * Get disputes statistics
   */
  getDisputesStats: async (
    params?: StatsQueryParams,
  ): Promise<DisputesStatsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(
      `${API_BASE_URL}/stats/disputes${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<DisputesStatsResponse>(response);
  },

  //  CHATS STATS

  /**
   * Get chats statistics
   */
  getChatsStats: async (
    params?: StatsQueryParams,
  ): Promise<ChatsStatsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(`${API_BASE_URL}/stats/chats${queryString}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<ChatsStatsResponse>(response);
  },

  //  COLLEGES STATS (Super Admin Only)

  /**
   * Get all colleges statistics (Super Admin only)
   */
  getCollegesStats: async (): Promise<CollegesStatsResponse> => {
    const response = await fetch(`${API_BASE_URL}/stats/colleges`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<CollegesStatsResponse>(response);
  },

  //  EXPORT ANALYTICS

  /**
   * Export analytics report (Super Admin only)
   */
  exportAnalytics: async (
    params?: StatsQueryParams,
  ): Promise<ExportAnalyticsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(`${API_BASE_URL}/stats/export${queryString}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<ExportAnalyticsResponse>(response);
  },
};
