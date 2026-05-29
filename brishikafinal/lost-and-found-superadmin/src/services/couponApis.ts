import type {
  Coupon,
  UserCoupon,
  CouponRedemption,
  AvailableCoupon,
  CouponDetails,
  CouponFilters,
  ClaimCouponRequest,
  UseCouponRequest,
  VerifyCouponRequest,
  CreateCouponRequest,
  UpdateCouponRequest,
  CouponAnalytics,
  CollegeCouponStats,
  ApiResponse,
} from "@/types/coupon.types";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to handle response
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      success: false,
      message: "An unexpected error occurred",
    }));
    throw errorData;
  }
  return response.json();
}

// Helper to build query params
function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const couponApis = {
  // Admin/College Admin Endpoints

  // Create coupon
  createCoupon: async (
    data: CreateCouponRequest,
  ): Promise<ApiResponse<Coupon>> => {
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<ApiResponse<Coupon>>(response);
  },

  // Update coupon
  updateCoupon: async (
    couponId: string,
    data: UpdateCouponRequest,
  ): Promise<ApiResponse<Coupon>> => {
    const response = await fetch(`${API_BASE_URL}/coupons/${couponId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<ApiResponse<Coupon>>(response);
  },

  // Delete coupon
  deleteCoupon: async (couponId: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/coupons/${couponId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<ApiResponse<null>>(response);
  },

  // Get all coupons (admin with filters)
  getAllCoupons: async (
    filters: CouponFilters = {},
  ): Promise<ApiResponse<Coupon[]>> => {
    const queryString = buildQueryParams(filters);
    const response = await fetch(`${API_BASE_URL}/coupons/all${queryString}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<ApiResponse<Coupon[]>>(response);
  },

  // Get coupon by ID (admin)
  getCouponByIdAdmin: async (
    couponId: string,
  ): Promise<ApiResponse<Coupon>> => {
    const response = await fetch(`${API_BASE_URL}/coupons/admin/${couponId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<ApiResponse<Coupon>>(response);
  },

  // Get coupons by college
  getCouponsByCollege: async (
    collegeId: string,
  ): Promise<ApiResponse<Coupon[]>> => {
    const response = await fetch(
      `${API_BASE_URL}/coupons/college/${collegeId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return handleResponse<ApiResponse<Coupon[]>>(response);
  },

  // Get coupon redemptions
  getCouponRedemptions: async (
    couponId: string,
    page?: number,
    limit?: number,
  ): Promise<ApiResponse<CouponRedemption[]>> => {
    const queryString = buildQueryParams({ page, limit });
    const response = await fetch(
      `${API_BASE_URL}/coupons/redemptions/${couponId}${queryString}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return handleResponse<ApiResponse<CouponRedemption[]>>(response);
  },

  // Get coupon analytics
  getCouponAnalytics: async (
    couponId: string,
  ): Promise<ApiResponse<CouponAnalytics>> => {
    const response = await fetch(
      `${API_BASE_URL}/coupons/analytics/${couponId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return handleResponse<ApiResponse<CouponAnalytics>>(response);
  },

  // Get college coupon stats
  getCollegeCouponStats: async (
    collegeId?: string,
  ): Promise<ApiResponse<CollegeCouponStats>> => {
    const queryString = collegeId ? buildQueryParams({ collegeId }) : "";
    const response = await fetch(
      `${API_BASE_URL}/coupons/stats/college${queryString}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return handleResponse<ApiResponse<CollegeCouponStats>>(response);
  },

  // User Endpoints

  // Get available coupons for user's college
  getAvailableCoupons: async (): Promise<ApiResponse<AvailableCoupon[]>> => {
    const response = await fetch(`${API_BASE_URL}/coupons/available`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<ApiResponse<AvailableCoupon[]>>(response);
  },

  // Get user's claimed coupons
  getUserCoupons: async (
    status?: string,
  ): Promise<ApiResponse<UserCoupon[]>> => {
    const queryString = status ? buildQueryParams({ status }) : "";
    const response = await fetch(
      `${API_BASE_URL}/coupons/my-coupons${queryString}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return handleResponse<ApiResponse<UserCoupon[]>>(response);
  },

  // Get coupon details
  getCouponDetails: async (
    couponId: string,
  ): Promise<ApiResponse<CouponDetails>> => {
    const response = await fetch(`${API_BASE_URL}/coupons/${couponId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<ApiResponse<CouponDetails>>(response);
  },

  // Claim coupon (redeem points)
  claimCoupon: async (
    data: ClaimCouponRequest,
  ): Promise<
    ApiResponse<{
      userCoupon: UserCoupon;
      pointsRemaining: number;
      pointsUsed: number;
    }>
  > => {
    const response = await fetch(`${API_BASE_URL}/coupons/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Use coupon (at canteen/cafeteria)
  useCoupon: async (
    data: UseCouponRequest,
  ): Promise<
    ApiResponse<{
      couponCode: string;
      originalAmount: number;
      discountAmount: number;
      finalAmount: number;
      savings: number;
    }>
  > => {
    const response = await fetch(`${API_BASE_URL}/coupons/use`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Verify coupon (for canteen staff)
  verifyCoupon: async (
    data: VerifyCouponRequest,
  ): Promise<
    ApiResponse<{
      couponCode: string;
      title: string;
      description: string;
      discountValue: number;
      discountType: string;
      expiresAt: string;
      userId: string;
    }>
  > => {
    const response = await fetch(`${API_BASE_URL}/coupons/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Get user's redemption history
  getMyRedemptionHistory: async (
    page?: number,
    limit?: number,
  ): Promise<ApiResponse<CouponRedemption[]>> => {
    const queryString = buildQueryParams({ page, limit });
    const response = await fetch(
      `${API_BASE_URL}/coupons/my-redemptions${queryString}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return handleResponse<ApiResponse<CouponRedemption[]>>(response);
  },
};
