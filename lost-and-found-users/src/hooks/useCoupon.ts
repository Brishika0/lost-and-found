import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { couponApis } from "@/services/couponApis";
import type {
  CouponFilters,
  ClaimCouponRequest,
  UseCouponRequest,
  VerifyCouponRequest,
  CreateCouponRequest,
  UpdateCouponRequest,
} from "@/types/coupon.types";

// Query Keys
export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (filters: CouponFilters) => [...couponKeys.lists(), filters] as const,
  details: () => [...couponKeys.all, "detail"] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
  admin: () => [...couponKeys.all, "admin"] as const,
  adminDetail: (id: string) => [...couponKeys.admin(), id] as const,
  available: () => [...couponKeys.all, "available"] as const,
  userCoupons: (status?: string) =>
    [...couponKeys.all, "user", status] as const,
  redemptions: (couponId: string) =>
    [...couponKeys.all, "redemptions", couponId] as const,
  myRedemptions: () => [...couponKeys.all, "my-redemptions"] as const,
  analytics: (couponId: string) =>
    [...couponKeys.all, "analytics", couponId] as const,
  collegeStats: (collegeId?: string) =>
    [...couponKeys.all, "stats", collegeId] as const,
};

// Query Hooks

// Get available coupons for user's college
export const useAvailableCoupons = () => {
  return useQuery({
    queryKey: couponKeys.available(),
    queryFn: async () => {
      const response = await couponApis.getAvailableCoupons();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Get user's claimed coupons
export const useUserCoupons = (status?: string) => {
  return useQuery({
    queryKey: couponKeys.userCoupons(status),
    queryFn: async () => {
      const response = await couponApis.getUserCoupons(status);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Get coupon details
export const useCouponDetails = (couponId: string) => {
  return useQuery({
    queryKey: couponKeys.detail(couponId),
    queryFn: async () => {
      const response = await couponApis.getCouponDetails(couponId);
      return response.data;
    },
    enabled: !!couponId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get all coupons (admin)
export const useAllCoupons = (filters: CouponFilters) => {
  return useQuery({
    queryKey: couponKeys.list(filters),
    queryFn: async () => {
      const response = await couponApis.getAllCoupons(filters);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Get coupon by ID (admin)
export const useCouponByIdAdmin = (couponId: string) => {
  return useQuery({
    queryKey: couponKeys.adminDetail(couponId),
    queryFn: async () => {
      const response = await couponApis.getCouponByIdAdmin(couponId);
      return response.data;
    },
    enabled: !!couponId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get coupons by college (admin)
export const useCouponsByCollege = (collegeId: string) => {
  return useQuery({
    queryKey: couponKeys.list({ collegeId }),
    queryFn: async () => {
      const response = await couponApis.getCouponsByCollege(collegeId);
      return response.data;
    },
    enabled: !!collegeId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get coupon redemptions (admin)
export const useCouponRedemptions = (
  couponId: string,
  page?: number,
  limit?: number,
) => {
  return useQuery({
    queryKey: [...couponKeys.redemptions(couponId), { page, limit }],
    queryFn: async () => {
      const response = await couponApis.getCouponRedemptions(
        couponId,
        page,
        limit,
      );
      return response;
    },
    enabled: !!couponId,
    staleTime: 3 * 60 * 1000,
  });
};

// Get coupon analytics (admin)
export const useCouponAnalytics = (couponId: string) => {
  return useQuery({
    queryKey: couponKeys.analytics(couponId),
    queryFn: async () => {
      const response = await couponApis.getCouponAnalytics(couponId);
      return response.data;
    },
    enabled: !!couponId,
    staleTime: 10 * 60 * 1000,
  });
};

// Get college coupon stats (admin)
export const useCollegeCouponStats = (collegeId?: string) => {
  return useQuery({
    queryKey: couponKeys.collegeStats(collegeId),
    queryFn: async () => {
      const response = await couponApis.getCollegeCouponStats(collegeId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get user's redemption history
export const useMyRedemptionHistory = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: [...couponKeys.myRedemptions(), { page, limit }],
    queryFn: async () => {
      const response = await couponApis.getMyRedemptionHistory(page, limit);
      return response;
    },
    staleTime: 3 * 60 * 1000,
  });
};

// Mutation Hooks

// Create coupon
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCouponRequest) => {
      const response = await couponApis.createCoupon(data);
      return response.data;
    },
    onSuccess: (variables) => {
      toast.success("Coupon created successfully");
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: couponKeys.collegeStats(variables.collegeId as any),
      });
      queryClient.invalidateQueries({ queryKey: couponKeys.available() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create coupon");
    },
  });
};

// Update coupon
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      couponId,
      data,
    }: {
      couponId: string;
      data: UpdateCouponRequest;
    }) => {
      const response = await couponApis.updateCoupon(couponId, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Coupon updated successfully");
      queryClient.invalidateQueries({
        queryKey: couponKeys.detail(variables.couponId),
      });
      queryClient.invalidateQueries({
        queryKey: couponKeys.adminDetail(variables.couponId),
      });
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.available() });

      if (data.collegeId) {
        const collegeId =
          typeof data.collegeId === "string"
            ? data.collegeId
            : data.collegeId._id;
        queryClient.invalidateQueries({
          queryKey: couponKeys.collegeStats(collegeId),
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update coupon");
    },
  });
};

// Delete coupon
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: string) => {
      const response = await couponApis.deleteCoupon(couponId);
      return response.data;
    },
    onSuccess: (_, couponId) => {
      toast.success("Coupon deleted successfully");
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.available() });
      queryClient.removeQueries({ queryKey: couponKeys.detail(couponId) });
      queryClient.removeQueries({ queryKey: couponKeys.adminDetail(couponId) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });
};

// Claim coupon
export const useClaimCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClaimCouponRequest) => {
      const response = await couponApis.claimCoupon(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Coupon claimed successfully");
      queryClient.invalidateQueries({ queryKey: couponKeys.available() });
      queryClient.invalidateQueries({ queryKey: couponKeys.userCoupons() });
      queryClient.invalidateQueries({ queryKey: ["userReward"] });
      queryClient.invalidateQueries({ queryKey: couponKeys.myRedemptions() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to claim coupon");
    },
  });
};

// Use coupon
export const useUseCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UseCouponRequest) => {
      const response = await couponApis.useCoupon(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Coupon used successfully");
      queryClient.invalidateQueries({ queryKey: couponKeys.userCoupons() });
      queryClient.invalidateQueries({ queryKey: couponKeys.myRedemptions() });
      queryClient.invalidateQueries({ queryKey: couponKeys.available() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to use coupon");
    },
  });
};

// Verify coupon (for canteen staff)
export const useVerifyCoupon = () => {
  return useMutation({
    mutationFn: async (data: VerifyCouponRequest) => {
      const response = await couponApis.verifyCoupon(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Coupon verified successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to verify coupon");
    },
  });
};

// Combined Hooks

// Hook to check if user can claim a coupon
export const useCanClaimCoupon = (couponId: string) => {
  const { data: couponDetails } = useCouponDetails(couponId);
  const { data: userCoupons } = useUserCoupons("active");

  const hasClaimed = userCoupons?.some(
    (uc) => typeof uc.couponId !== "string" && uc.couponId._id === couponId,
  );

  const isAvailable =
    couponDetails?.status === "active" &&
    new Date(couponDetails?.validFrom) <= new Date() &&
    new Date(couponDetails?.validUntil) >= new Date();

  const hasPoints =
    (couponDetails?.userAvailablePoints ?? 0) >=
    (couponDetails?.pointsRequired ?? 0);

  return {
    canClaim: !hasClaimed && isAvailable && hasPoints,
    hasClaimed,
    isAvailable,
    hasPoints,
    pointsRequired: couponDetails?.pointsRequired ?? 0,
    availablePoints: couponDetails?.userAvailablePoints ?? 0,
  };
};

// Hook to get featured coupons
export const useFeaturedCoupons = () => {
  const { data: coupons, ...rest } = useAvailableCoupons();
  const featuredCoupons = coupons?.filter((coupon) => coupon.isFeatured) ?? [];
  return {
    data: featuredCoupons,
    ...rest,
  };
};

// Hook to get coupons by type
export const useCouponsByType = (couponType: string) => {
  const { data: coupons, ...rest } = useAvailableCoupons();
  const filteredCoupons =
    coupons?.filter((coupon) => coupon.couponType === couponType) ?? [];
  return {
    data: filteredCoupons,
    ...rest,
  };
};

// Hook to get cheapest coupons first
export const useCheapestCoupons = (limit?: number) => {
  const { data: coupons, ...rest } = useAvailableCoupons();
  const sortedCoupons = [...(coupons ?? [])].sort(
    (a, b) => a.pointsRequired - b.pointsRequired,
  );
  const limitedCoupons = limit ? sortedCoupons.slice(0, limit) : sortedCoupons;
  return {
    data: limitedCoupons,
    ...rest,
  };
};

// Hook to get most popular coupons
export const usePopularCoupons = (limit?: number) => {
  const { data: coupons, ...rest } = useAvailableCoupons();
  const sortedCoupons = [...(coupons ?? [])].sort(
    (a, b) => b.totalRedemptions - a.totalRedemptions,
  );
  const limitedCoupons = limit ? sortedCoupons.slice(0, limit) : sortedCoupons;
  return {
    data: limitedCoupons,
    ...rest,
  };
};
