import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rewardApis } from "@/services/rewardApis";
import type {
  RedeemRewardRequest,
  GetTransactionsQuery,
  ApproveRedemptionRequest,
} from "@/types/reward.types";

//  QUERY KEYS

export const rewardKeys = {
  all: ["rewards"] as const,
  myRewards: () => [...rewardKeys.all, "my-rewards"] as const,
  available: () => [...rewardKeys.all, "available"] as const,
  myRedemptions: () => [...rewardKeys.all, "my-redemptions"] as const,
  transactions: (params?: GetTransactionsQuery) =>
    [...rewardKeys.all, "transactions", params] as const,
  pendingRedemptions: () => [...rewardKeys.all, "pending-redemptions"] as const,
};

//  QUERY HOOKS

/**
 * Get current user's reward summary
 */
export const useMyRewards = () => {
  return useQuery({
    queryKey: rewardKeys.myRewards(),
    queryFn: () => rewardApis.getMyRewards(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get available rewards for redemption
 */
export const useAvailableRewards = () => {
  return useQuery({
    queryKey: rewardKeys.available(),
    queryFn: () => rewardApis.getAvailableRewards(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get user's redemption history
 */
export const useMyRedemptions = () => {
  return useQuery({
    queryKey: rewardKeys.myRedemptions(),
    queryFn: () => rewardApis.getMyRedemptions(),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get reward transaction history with pagination
 */
export const useRewardTransactions = (params?: GetTransactionsQuery) => {
  return useQuery({
    queryKey: rewardKeys.transactions(params),
    queryFn: () => rewardApis.getRewardTransactions(params),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get pending redemptions (Admin only)
 */
export const usePendingRedemptions = () => {
  return useQuery({
    queryKey: rewardKeys.pendingRedemptions(),
    queryFn: () => rewardApis.getPendingRedemptions(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

//  MUTATION HOOKS

/**
 * Redeem points for a reward
 */
export const useRedeemReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RedeemRewardRequest) => rewardApis.redeemReward(data),
    onSuccess: (response) => {
      toast.success(response.message || "Reward redeemed successfully!");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: rewardKeys.myRewards() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.myRedemptions() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.transactions() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to redeem reward");
    },
  });
};

/**
 * Approve or reject a redemption request (Admin only)
 */
export const useApproveRedemption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ApproveRedemptionRequest;
    }) => rewardApis.approveRedemption(id, data),
    onSuccess: (response) => {
      toast.success(response.message || "Redemption request updated");
      // Invalidate pending redemptions list
      queryClient.invalidateQueries({
        queryKey: rewardKeys.pendingRedemptions(),
      });
      // Also invalidate user's rewards and redemptions
      queryClient.invalidateQueries({ queryKey: rewardKeys.myRewards() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.myRedemptions() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update redemption request");
    },
  });
};
