export type CouponType =
  | "canteen"
  | "cafeteria"
  | "meal"
  | "snack"
  | "beverage";
export type CouponDiscountType = "fixed" | "percentage";
export type CouponStatus = "active" | "used" | "expired" | "cancelled";
export type CouponRedemptionMethod = "qr" | "code" | "manual";
export type UserCouponStatus = "active" | "used" | "expired" | "cancelled";

export interface OperatingHours {
  start: string;
  end: string;
  days: string[];
}

export interface Location {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: [number, number];
}

export interface College {
  _id: string;
  name: string;
  shortName: string;
  location?: Location;
}

export interface Coupon {
  _id: string;
  couponCode: string;
  couponType: CouponType;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  pointsRequired: number;
  originalValue: number;
  validFrom: string;
  validUntil: string;
  isUnlimited: boolean;
  totalQuantity?: number;
  remainingQuantity?: number;
  collegeId: College | string;
  canteenName?: string;
  canteenLocation?: string;
  operatingHours?: OperatingHours;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  redemptionMethod: CouponRedemptionMethod;
  qrCode?: string;
  barCode?: string;
  userLimitPerCoupon?: number;
  dailyUsageLimit?: number;
  weeklyUsageLimit?: number;
  allowedItems?: string[];
  status: CouponStatus;
  isFeatured: boolean;
  sortOrder: number;
  termsAndConditions?: string[];
  instructions?: string;
  imageUrl?: string;
  totalRedemptions: number;
  totalPointsRedeemed: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserCoupon {
  _id: string;
  userId: string;
  couponId: Coupon | string;
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
  status: UserCouponStatus;
  redeemedAt?: string;
  usedAt?: string;
  expiresAt: string;
  qrCode?: string;
  redemptionMethod: CouponRedemptionMethod;
  transactionId?: string;
  redemptionId?: string;
  usedByCanteenStaff?: {
    staffId: string;
    staffName: string;
    verifiedAt: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CouponRedemption {
  _id: string;
  couponId: Coupon | string;
  userCouponId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  collegeId: string;
  couponCode: string;
  pointsUsed: number;
  redemptionMethod: CouponRedemptionMethod;
  verifiedBy?: string;
  verifiedAt?: string;
  rewardTransactionId: string;
  rewardRedemptionId: string;
  canteenName?: string;
  itemsPurchased?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount?: number;
  discountApplied?: number;
  status: "pending" | "completed" | "failed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableCoupon extends Coupon {
  userClaimed: boolean;
  userClaimStatus: UserCouponStatus | null;
}

export interface CouponDetails extends Coupon {
  userHasClaimed: boolean;
  userCouponStatus: UserCouponStatus | null;
  userCanClaim: boolean;
  userAvailablePoints: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CouponFilters {
  page?: number;
  limit?: number;
  status?: CouponStatus;
  couponType?: CouponType;
  collegeId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ClaimCouponRequest {
  couponId: string;
  notes?: string;
}

export interface UseCouponRequest {
  userCouponId: string;
  itemsPurchased?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

export interface VerifyCouponRequest {
  couponCode?: string;
  userCouponId?: string;
}

export interface CreateCouponRequest {
  couponType: CouponType;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  pointsRequired: number;
  originalValue: number;
  validFrom: string;
  validUntil: string;
  isUnlimited: boolean;
  totalQuantity?: number;
  collegeId: string;
  canteenName?: string;
  canteenLocation?: string;
  operatingHours?: OperatingHours;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  redemptionMethod?: CouponRedemptionMethod;
  userLimitPerCoupon?: number;
  dailyUsageLimit?: number;
  weeklyUsageLimit?: number;
  allowedItems?: string[];
  termsAndConditions?: string[];
  instructions?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {
  status?: CouponStatus;
}

export interface CouponAnalytics {
  totalRedemptions: number;
  totalPointsRedeemed: number;
  totalValueRedeemed: number;
  totalDiscountGiven: number;
  averageDiscountPerRedemption: number;
  uniqueUsers: number;
  redemptionsByDay: Array<{
    _id: string;
    count: number;
  }>;
}

export interface CollegeCouponStats {
  collegeId: string;
  stats: Array<{
    _id: CouponStatus;
    count: number;
    totalPointsRequired: number;
    totalRedemptions: number;
    totalPointsRedeemed: number;
  }>;
  activeCoupons: number;
  totalUserCoupons: number;
}
