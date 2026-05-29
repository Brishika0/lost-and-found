//  ENUMS & TYPES

export type TransactionType =
  | "earn_item_returned"
  | "earn_item_found"
  | "earn_item_claimed"
  | "redeem_reward"
  | "bonus_streak"
  | "admin_adjustment";

export type RewardType =
  | "voucher"
  | "gift_card"
  | "coupon"
  | "merchandise"
  | "donation";
export type RedemptionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

//  REQUEST TYPES

export interface RedeemRewardRequest {
  rewardId: string;
  rewardName: string;
  rewardPoints: number;
  rewardType: RewardType;
  rewardValue: number;
  deliveryInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface GetTransactionsQuery {
  page?: number;
  limit?: number;
}

export interface ApproveRedemptionRequest {
  status: "approved" | "rejected";
  notes?: string;
}

//  RESPONSE TYPES

export interface RewardTransaction {
  _id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  referenceId?: string;
  referenceModel?: string;
  status: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserRewardSummary {
  totalPoints: number;
  availablePoints: number;
  earnedPoints: number;
  redeemedPoints: number;
  itemsReturned: number;
  itemsFound: number;
  itemsClaimed: number;
  streak: number;
  recentTransactions: RewardTransaction[];
}

export interface AvailableReward {
  id: string;
  name: string;
  description: string;
  points: number;
  type: RewardType;
  value: number;
}

export interface RewardRedemption {
  _id: string;
  userId: string;
  points: number;
  rewardType: RewardType;
  item: {
    id: string;
    name: string;
    description: string;
    value: number;
  };
  status: RedemptionStatus;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  deliveryInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RedemptionRequest {
  success: boolean;
  message: string;
  data: RewardRedemption;
}

export interface TransactionsListResponse {
  success: boolean;
  data: RewardTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PendingRedemptionsResponse {
  success: boolean;
  data: RewardRedemption[];
}

export interface ApproveRedemptionResponse {
  success: boolean;
  message: string;
  data: RewardRedemption;
}

export interface MyRewardsResponse {
  success: boolean;
  data: UserRewardSummary;
}

export interface RewardsListResponse {
  success: boolean;
  data: AvailableReward[];
}

export interface MyRedemptionsResponse {
  success: boolean;
  data: RewardRedemption[];
}
