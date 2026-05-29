import mongoose, { Schema, Document, Types } from "mongoose";

export type TransactionType =
  | "earn_item_returned"
  | "earn_item_found"
  | "earn_item_claimed"
  | "redeem_reward"
  | "bonus_streak"
  | "admin_adjustment";

export type TransactionStatus = "pending" | "completed" | "cancelled";

export interface IRewardTransaction extends Document {
  userId: Types.ObjectId;
  amount: number;
  type: TransactionType;
  description: string;
  referenceId?: Types.ObjectId;
  referenceModel?: string;
  status: TransactionStatus;
  metadata?: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserReward extends Document {
  userId: Types.ObjectId;
  totalPoints: number;
  availablePoints: number;
  earnedPoints: number;
  redeemedPoints: number;
  itemsReturned: number;
  itemsFound: number;
  itemsClaimed: number;
  streak: number;
  lastActiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRewardRedemption extends Document {
  userId: Types.ObjectId;
  points: number;
  rewardType: "voucher" | "gift_card" | "coupon" | "merchandise" | "donation";
  item: {
    id: string;
    name: string;
    description: string;
    value: number;
  };
  status: "pending" | "approved" | "rejected" | "completed";
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  deliveryInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Schema
const RewardTransactionSchema = new Schema<IRewardTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: [
        "earn_item_returned",
        "earn_item_found",
        "earn_item_claimed",
        "redeem_reward",
        "bonus_streak",
        "admin_adjustment",
      ],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    referenceId: { type: Schema.Types.ObjectId, refPath: "referenceModel" },
    referenceModel: { type: String, enum: ["LostItem"] },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    metadata: { type: Map, of: Schema.Types.Mixed },
  },
  { timestamps: true },
);

// User Reward Schema
const UserRewardSchema = new Schema<IUserReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalPoints: { type: Number, default: 0 },
    availablePoints: { type: Number, default: 0 },
    earnedPoints: { type: Number, default: 0 },
    redeemedPoints: { type: Number, default: 0 },
    itemsReturned: { type: Number, default: 0 },
    itemsFound: { type: Number, default: 0 },
    itemsClaimed: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Reward Redemption Schema
const RewardRedemptionSchema = new Schema<IRewardRedemption>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    points: { type: Number, required: true, min: 1 },
    rewardType: {
      type: String,
      enum: ["voucher", "gift_card", "coupon", "merchandise", "donation"],
      required: true,
    },
    item: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      value: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    notes: { type: String, trim: true },
    deliveryInfo: {
      email: String,
      phone: String,
      address: String,
    },
  },
  { timestamps: true },
);

// Indexes
RewardTransactionSchema.index({ userId: 1, createdAt: -1 });
RewardTransactionSchema.index({ referenceId: 1, referenceModel: 1 });
UserRewardSchema.index({ availablePoints: -1 });
RewardRedemptionSchema.index({ userId: 1, status: 1 });

export const RewardTransaction = mongoose.model<IRewardTransaction>(
  "RewardTransaction",
  RewardTransactionSchema,
);
export const UserReward = mongoose.model<IUserReward>(
  "UserReward",
  UserRewardSchema,
);
export const RewardRedemption = mongoose.model<IRewardRedemption>(
  "RewardRedemption",
  RewardRedemptionSchema,
);
