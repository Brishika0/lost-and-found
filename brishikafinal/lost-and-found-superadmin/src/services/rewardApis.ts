import type {
  RedeemRewardRequest,
  GetTransactionsQuery,
  ApproveRedemptionRequest,
  MyRewardsResponse,
  RewardsListResponse,
  RedemptionRequest,
  MyRedemptionsResponse,
  TransactionsListResponse,
  PendingRedemptionsResponse,
  ApproveRedemptionResponse,
} from "@/types/reward.types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

export const rewardApis = {
  //  USER REWARDS

  /**
   * Get current user's reward summary
   */
  getMyRewards: async (): Promise<MyRewardsResponse> => {
    const response = await fetch(`${API_BASE_URL}/rewards/my-rewards`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<MyRewardsResponse>(response);
  },

  /**
   * Get available rewards for redemption
   */
  getAvailableRewards: async (): Promise<RewardsListResponse> => {
    const response = await fetch(`${API_BASE_URL}/rewards/available`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<RewardsListResponse>(response);
  },

  /**
   * Redeem points for a reward
   */
  redeemReward: async (
    data: RedeemRewardRequest,
  ): Promise<RedemptionRequest> => {
    const response = await fetch(`${API_BASE_URL}/rewards/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<RedemptionRequest>(response);
  },

  /**
   * Get user's redemption history
   */
  getMyRedemptions: async (): Promise<MyRedemptionsResponse> => {
    const response = await fetch(`${API_BASE_URL}/rewards/my-redemptions`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<MyRedemptionsResponse>(response);
  },

  /**
   * Get reward transaction history
   */
  getRewardTransactions: async (
    params?: GetTransactionsQuery,
  ): Promise<TransactionsListResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(
      `${API_BASE_URL}/rewards/transactions${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<TransactionsListResponse>(response);
  },

  //  ADMIN REWARDS

  /**
   * Get all pending redemptions (Admin only)
   */
  getPendingRedemptions: async (): Promise<PendingRedemptionsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/rewards/pending-redemptions`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<PendingRedemptionsResponse>(response);
  },

  /**
   * Approve or reject a redemption request (Admin only)
   */
  approveRedemption: async (
    id: string,
    data: ApproveRedemptionRequest,
  ): Promise<ApproveRedemptionResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/rewards/redemptions/${id}/approve`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      },
    );
    return handleResponse<ApproveRedemptionResponse>(response);
  },
};
