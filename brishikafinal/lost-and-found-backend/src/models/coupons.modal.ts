import mongoose, { Schema, Document, Types } from "mongoose";

export type CouponType =
  | "canteen"
  | "cafeteria"
  | "meal"
  | "snack"
  | "beverage";
export type CouponDiscountType = "fixed" | "percentage";
export type CouponStatus = "active" | "used" | "expired" | "cancelled";
export type CouponRedemptionMethod = "qr" | "code" | "manual";

export interface ICoupon extends Document {
  // Basic Information
  couponCode: string;
  couponType: CouponType;
  title: string;
  description: string;

  // Value & Discount
  discountType: CouponDiscountType;
  discountValue: number; // Fixed amount or percentage (e.g., 50 for 50% or $5)
  minimumOrderValue?: number; // Minimum points/order value required
  maximumDiscount?: number; // Maximum discount for percentage type

  // Points Cost
  pointsRequired: number; // How many points needed to redeem this coupon
  originalValue: number; // Actual monetary/canteen value of coupon

  // Redemption Details
  redemptionMethod: CouponRedemptionMethod;
  qrCode?: string; // QR code data or URL
  barCode?: string; // Barcode data

  // Validity Period
  validFrom: Date;
  validUntil: Date;
  isUnlimited: boolean; // If false, limited quantity
  totalQuantity?: number; // Total coupons available (if not unlimited)
  remainingQuantity?: number; // Remaining coupons

  // College Specific
  collegeId: Types.ObjectId; // Which college's canteen/cafeteria this coupon belongs to
  canteenName?: string; // Specific canteen/cafeteria name
  canteenLocation?: string; // Location within college
  operatingHours?: {
    start: string; // e.g., "09:00"
    end: string; // e.g., "17:00"
    days: string[]; // ["monday", "tuesday", ...]
  };

  // Usage Restrictions
  allowedItems?: string[]; // Specific items this coupon can be used for
  userLimitPerCoupon?: number; // Max times a single user can redeem this coupon
  dailyUsageLimit?: number; // Max redemptions per day
  weeklyUsageLimit?: number; // Max redemptions per week

  // Status
  status: CouponStatus;
  isFeatured: boolean; // Featured coupons shown at top
  sortOrder: number; // Display order

  // Metadata
  termsAndConditions?: string[];
  instructions?: string;
  imageUrl?: string; // Coupon image/icon

  // Tracking
  totalRedemptions: number; // Total number of times redeemed
  totalPointsRedeemed: number; // Total points used for this coupon
  createdBy: Types.ObjectId; // Admin who created
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCoupon extends Document {
  userId: Types.ObjectId;
  couponId: Types.ObjectId;
  couponCode: string;
  couponData: {
    title: string;
    description: string;
    discountType: CouponDiscountType;
    discountValue: number;
    originalValue: number;
    couponType: CouponType;
  };
  pointsUsed: number;
  status: "active" | "used" | "expired" | "cancelled";
  redeemedAt?: Date;
  usedAt?: Date;
  expiresAt: Date;
  qrCode?: string;
  redemptionMethod: CouponRedemptionMethod;

  // Usage tracking
  transactionId?: Types.ObjectId; // Reference to RewardTransaction
  redemptionId?: Types.ObjectId; // Reference to RewardRedemption

  // For offline usage
  usedByCanteenStaff?: {
    staffId?: Types.ObjectId;
    staffName?: string;
    verifiedAt: Date;
    notes?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface ICouponRedemption extends Document {
  couponId: Types.ObjectId;
  userCouponId: Types.ObjectId;
  userId: Types.ObjectId;
  collegeId: Types.ObjectId;
  couponCode: string;
  pointsUsed: number;

  // Redemption details
  redemptionMethod: CouponRedemptionMethod;
  verifiedBy?: Types.ObjectId; // Staff who verified
  verifiedAt?: Date;

  // Transaction info
  rewardTransactionId: Types.ObjectId;
  rewardRedemptionId: Types.ObjectId;

  // Canteen/Cafeteria info
  canteenName?: string;
  itemsPurchased?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount?: number; // Actual purchase amount
  discountApplied?: number; // Discount amount applied

  status: "pending" | "completed" | "failed";
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Coupon Schema
const CouponSchema = new Schema<ICoupon>(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    couponType: {
      type: String,
      enum: ["canteen", "cafeteria", "meal", "snack", "beverage"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["fixed", "percentage"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    minimumOrderValue: {
      type: Number,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      min: 0,
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    originalValue: {
      type: Number,
      required: true,
      min: 0,
    },
    redemptionMethod: {
      type: String,
      enum: ["qr", "code", "manual"],
      default: "code",
    },
    qrCode: String,
    barCode: String,
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isUnlimited: {
      type: Boolean,
      default: true,
    },
    totalQuantity: {
      type: Number,
      required: function (this: ICoupon) {
        return !this.isUnlimited;
      },
      min: 1,
    },
    remainingQuantity: {
      type: Number,
      required: function (this: ICoupon) {
        return !this.isUnlimited;
      },
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    canteenName: {
      type: String,
      trim: true,
    },
    canteenLocation: {
      type: String,
      trim: true,
    },
    operatingHours: {
      start: String,
      end: String,
      days: [String],
    },
    allowedItems: [String],
    userLimitPerCoupon: {
      type: Number,
      default: 1,
    },
    dailyUsageLimit: Number,
    weeklyUsageLimit: Number,
    status: {
      type: String,
      enum: ["active", "used", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    termsAndConditions: [String],
    instructions: String,
    imageUrl: String,
    totalRedemptions: {
      type: Number,
      default: 0,
    },
    totalPointsRedeemed: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// User Coupon Schema (when user redeems a coupon)
const UserCouponSchema = new Schema<IUserCoupon>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    couponCode: {
      type: String,
      required: true,
      index: true,
    },
    couponData: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      discountType: {
        type: String,
        enum: ["fixed", "percentage"],
        required: true,
      },
      discountValue: { type: Number, required: true },
      originalValue: { type: Number, required: true },
      couponType: {
        type: String,
        enum: ["canteen", "cafeteria", "meal", "snack", "beverage"],
        required: true,
      },
    },
    pointsUsed: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "used", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    redeemedAt: Date,
    usedAt: Date,
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    qrCode: String,
    redemptionMethod: {
      type: String,
      enum: ["qr", "code", "manual"],
      required: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "RewardTransaction",
    },
    redemptionId: {
      type: Schema.Types.ObjectId,
      ref: "RewardRedemption",
    },
    usedByCanteenStaff: {
      staffId: { type: Schema.Types.ObjectId, ref: "User" },
      staffName: String,
      verifiedAt: Date,
      notes: String,
    },
  },
  {
    timestamps: true,
  },
);

// Coupon Redemption Schema (tracking when coupon is actually used at canteen)
const CouponRedemptionSchema = new Schema<ICouponRedemption>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },
    userCouponId: {
      type: Schema.Types.ObjectId,
      ref: "UserCoupon",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    couponCode: {
      type: String,
      required: true,
    },
    pointsUsed: {
      type: Number,
      required: true,
    },
    redemptionMethod: {
      type: String,
      enum: ["qr", "code", "manual"],
      required: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    rewardTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "RewardTransaction",
      required: true,
    },
    rewardRedemptionId: {
      type: Schema.Types.ObjectId,
      ref: "RewardRedemption",
      required: true,
    },
    canteenName: String,
    itemsPurchased: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: Number,
    discountApplied: Number,
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

// Indexes
CouponSchema.index({ collegeId: 1, status: 1, validFrom: 1, validUntil: 1 });
CouponSchema.index({ pointsRequired: 1 });
CouponSchema.index({ isFeatured: 1, sortOrder: 1 });
CouponSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 }); // Auto-expire

UserCouponSchema.index({ userId: 1, status: 1, expiresAt: 1 });
UserCouponSchema.index({ couponCode: 1, status: 1 });
UserCouponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-remove expired

CouponRedemptionSchema.index({ userId: 1, createdAt: -1 });
CouponRedemptionSchema.index({ couponId: 1, createdAt: -1 });
CouponRedemptionSchema.index({ verifiedAt: -1 });

// Pre-save middleware to generate unique coupon code
CouponSchema.pre("save", async function (next) {
  if (!this.couponCode) {
    const prefix = this.couponType.substring(0, 3).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.couponCode = `${prefix}-${randomStr}`;
  }
});

// Update remaining quantity when coupon is redeemed
CouponSchema.methods.decrementQuantity = async function () {
  if (!this.isUnlimited && this.remainingQuantity > 0) {
    this.remainingQuantity -= 1;
    this.totalRedemptions += 1;
    await this.save();
  }
  return this;
};

// Check if coupon is available
CouponSchema.methods.isAvailable = function (): boolean {
  const now = new Date();
  if (this.status !== "active") return false;
  if (now < this.validFrom || now > this.validUntil) return false;
  if (!this.isUnlimited && this.remainingQuantity <= 0) return false;
  return true;
};

export const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);
export const UserCoupon = mongoose.model<IUserCoupon>(
  "UserCoupon",
  UserCouponSchema,
);
export const CouponRedemption = mongoose.model<ICouponRedemption>(
  "CouponRedemption",
  CouponRedemptionSchema,
);

export default Coupon;
