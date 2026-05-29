// src/schema/coupon.schema.ts
import { z } from "zod";

// Coupon type enum
export const CouponTypeEnum = z.enum([
  "canteen",
  "cafeteria",
  "meal",
  "snack",
  "beverage",
]);
export type CouponType = z.infer<typeof CouponTypeEnum>;

// Discount type enum
export const DiscountTypeEnum = z.enum(["fixed", "percentage"]);
export type DiscountType = z.infer<typeof DiscountTypeEnum>;

// Redemption method enum
export const RedemptionMethodEnum = z.enum(["qr", "code", "manual"]);
export type RedemptionMethod = z.infer<typeof RedemptionMethodEnum>;

// Operating hours schema
export const operatingHoursSchema = z.object({
  start: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  end: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  days: z.array(z.string()).min(1, "At least one day must be selected"),
});

// Base coupon schema without refinements
const couponBaseSchema = z.object({
  // Basic Information
  couponType: CouponTypeEnum,
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .trim(),

  // Discount & Value
  discountType: DiscountTypeEnum,
  discountValue: z
    .number()
    .min(1, "Discount value must be at least 1")
    .max(100, "Percentage discount cannot exceed 100%"),
  pointsRequired: z
    .number()
    .min(1, "Points required must be at least 1")
    .int("Points must be a whole number"),
  originalValue: z
    .number()
    .min(1, "Original value must be at least 1")
    .positive("Original value must be positive"),

  validFrom: z
    .string()
    .min(1, "Valid from date is required")
    .datetime({ local: true }),
  validUntil: z
    .string()
    .min(1, "Valid until date is required")
    .datetime({ local: true }),

  // Quantity
  isUnlimited: z.boolean().default(true),
  totalQuantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be positive")
    .optional(),

  // College & Location
  collegeId: z
    .string()
    .min(1, "College is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid college ID format"),
  canteenName: z
    .string()
    .max(100, "Canteen name cannot exceed 100 characters")
    .optional()
    .nullable(),
  canteenLocation: z
    .string()
    .max(200, "Location cannot exceed 200 characters")
    .optional()
    .nullable(),
  operatingHours: operatingHoursSchema.optional(),

  // Restrictions
  minimumOrderValue: z
    .number()
    .min(0, "Minimum order value cannot be negative")
    .default(0)
    .optional(),
  maximumDiscount: z
    .number()
    .positive("Maximum discount must be positive")
    .optional()
    .nullable(),
  userLimitPerCoupon: z
    .number()
    .int("User limit must be a whole number")
    .min(1, "User limit must be at least 1")
    .default(1)
    .optional(),
  dailyUsageLimit: z
    .number()
    .int("Daily limit must be a whole number")
    .positive("Daily limit must be positive")
    .optional()
    .nullable(),
  weeklyUsageLimit: z
    .number()
    .int("Weekly limit must be a whole number")
    .positive("Weekly limit must be positive")
    .optional()
    .nullable(),
  allowedItems: z
    .array(z.string())
    .max(50, "Cannot have more than 50 allowed items")
    .default([]),

  // Redemption
  redemptionMethod: RedemptionMethodEnum.default("code"),

  // Terms
  termsAndConditions: z
    .array(z.string())
    .max(20, "Cannot have more than 20 terms")
    .default([]),
  instructions: z
    .string()
    .max(1000, "Instructions cannot exceed 1000 characters")
    .optional()
    .nullable(),

  // Media
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),

  // Display settings
  isFeatured: z.boolean().default(false),
  sortOrder: z
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be 0 or greater")
    .default(0),
});

// Main coupon schema with refinements
export const couponSchema = couponBaseSchema.superRefine((data, ctx) => {
  // Validate that validUntil is after validFrom
  if (data.validFrom && data.validUntil) {
    const fromDate = new Date(data.validFrom);
    const untilDate = new Date(data.validUntil);

    if (fromDate >= untilDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid until date must be after valid from date",
        path: ["validUntil"],
      });
    }
  }

  // Validate totalQuantity when not unlimited
  if (!data.isUnlimited && !data.totalQuantity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Total quantity is required when coupon is not unlimited",
      path: ["totalQuantity"],
    });
  }

  // Validate that totalQuantity is positive when provided
  if (!data.isUnlimited && data.totalQuantity && data.totalQuantity <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Total quantity must be greater than 0",
      path: ["totalQuantity"],
    });
  }

  // Validate maximum discount for percentage type
  if (data.discountType === "percentage" && data.maximumDiscount) {
    if (data.maximumDiscount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum discount must be greater than 0",
        path: ["maximumDiscount"],
      });
    }
  }

  // Validate daily usage limit
  if (data.dailyUsageLimit && data.dailyUsageLimit <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Daily usage limit must be greater than 0",
      path: ["dailyUsageLimit"],
    });
  }

  // Validate weekly usage limit
  if (data.weeklyUsageLimit && data.weeklyUsageLimit <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Weekly usage limit must be greater than 0",
      path: ["weeklyUsageLimit"],
    });
  }
});

// Schema for updating coupon - create a new base schema without refinements for partial
const updateCouponBaseSchema = z.object({
  couponType: CouponTypeEnum.optional(),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
  discountType: DiscountTypeEnum.optional(),
  discountValue: z
    .number()
    .min(1, "Discount value must be at least 1")
    .max(100, "Percentage discount cannot exceed 100%")
    .optional(),
  pointsRequired: z
    .number()
    .min(1, "Points required must be at least 1")
    .int("Points must be a whole number")
    .optional(),
  originalValue: z
    .number()
    .min(1, "Original value must be at least 1")
    .positive("Original value must be positive")
    .optional(),

  validFrom: z
    .string()
    .min(1, "Valid from date is required")
    .datetime({ local: true })
    .optional(),
  validUntil: z
    .string()
    .min(1, "Valid until date is required")
    .datetime({ local: true })
    .optional(),

  isUnlimited: z.boolean().default(true).optional(),
  totalQuantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be positive")
    .optional(),
  collegeId: z
    .string()
    .min(1, "College is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid college ID format")
    .optional(),
  canteenName: z
    .string()
    .max(100, "Canteen name cannot exceed 100 characters")
    .optional()
    .nullable(),
  canteenLocation: z
    .string()
    .max(200, "Location cannot exceed 200 characters")
    .optional()
    .nullable(),
  operatingHours: operatingHoursSchema.optional(),
  minimumOrderValue: z
    .number()
    .min(0, "Minimum order value cannot be negative")
    .default(0)
    .optional(),
  maximumDiscount: z
    .number()
    .positive("Maximum discount must be positive")
    .optional()
    .nullable(),
  userLimitPerCoupon: z
    .number()
    .int("User limit must be a whole number")
    .min(1, "User limit must be at least 1")
    .default(1)
    .optional(),
  dailyUsageLimit: z
    .number()
    .int("Daily limit must be a whole number")
    .positive("Daily limit must be positive")
    .optional()
    .nullable(),
  weeklyUsageLimit: z
    .number()
    .int("Weekly limit must be a whole number")
    .positive("Weekly limit must be positive")
    .optional()
    .nullable(),
  allowedItems: z
    .array(z.string())
    .max(50, "Cannot have more than 50 allowed items")
    .default([])
    .optional(),
  redemptionMethod: RedemptionMethodEnum.default("code").optional(),
  termsAndConditions: z
    .array(z.string())
    .max(20, "Cannot have more than 20 terms")
    .default([])
    .optional(),
  instructions: z
    .string()
    .max(1000, "Instructions cannot exceed 1000 characters")
    .optional()
    .nullable(),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  isFeatured: z.boolean().default(false).optional(),
  sortOrder: z
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be 0 or greater")
    .default(0)
    .optional(),
  status: z.enum(["active", "expired", "cancelled"]).optional(),
});

// Update coupon schema with its own refinements (if needed)
export const updateCouponSchema = updateCouponBaseSchema.superRefine(
  (data, ctx) => {
    // Validate that validUntil is after validFrom when both are provided
    if (data.validFrom && data.validUntil) {
      const fromDate = new Date(data.validFrom);
      const untilDate = new Date(data.validUntil);

      if (fromDate >= untilDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid until date must be after valid from date",
          path: ["validUntil"],
        });
      }
    }

    // Validate totalQuantity when isUnlimited is false and totalQuantity is provided
    if (data.isUnlimited === false && !data.totalQuantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total quantity is required when coupon is not unlimited",
        path: ["totalQuantity"],
      });
    }

    // Validate maximum discount for percentage type
    if (
      data.discountType === "percentage" &&
      data.maximumDiscount &&
      data.maximumDiscount <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum discount must be greater than 0",
        path: ["maximumDiscount"],
      });
    }
  },
);

// Schema for claiming a coupon
export const claimCouponSchema = z.object({
  couponId: z
    .string()
    .min(1, "Coupon ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid coupon ID format"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

// Schema for using a coupon
export const useCouponSchema = z
  .object({
    userCouponId: z
      .string()
      .min(1, "User coupon ID is required")
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid user coupon ID format"),
    itemsPurchased: z
      .array(
        z.object({
          name: z.string().min(1, "Item name is required"),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
          price: z.number().min(0, "Price cannot be negative"),
        }),
      )
      .optional(),
    totalAmount: z
      .number()
      .min(0.01, "Total amount must be at least 0.01")
      .positive("Total amount must be positive"),
  })
  .superRefine((data, ctx) => {
    // Validate that items total matches totalAmount
    if (data.itemsPurchased && data.itemsPurchased.length > 0) {
      const calculatedTotal = data.itemsPurchased.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const difference = Math.abs(calculatedTotal - data.totalAmount);

      if (difference > 0.01) {
        // Allow small rounding differences
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total amount does not match sum of purchased items",
          path: ["totalAmount"],
        });
      }
    }
  });

// Schema for verifying a coupon
export const verifyCouponSchema = z
  .object({
    couponCode: z.string().optional(),
    userCouponId: z.string().optional(),
  })
  .refine((data) => data.couponCode || data.userCouponId, {
    message: "Either coupon code or user coupon ID is required",
    path: ["couponCode"],
  });

// Schema for filtering coupons
export const couponFiltersSchema = z.object({
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(10).optional(),
  status: z.enum(["active", "expired", "cancelled"]).optional(),
  couponType: CouponTypeEnum.optional(),
  collegeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  search: z.string().max(100).optional(),
  sortBy: z
    .enum([
      "createdAt",
      "pointsRequired",
      "totalRedemptions",
      "validUntil",
      "title",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  isFeatured: z.boolean().optional(),
  minPoints: z.number().positive().optional(),
  maxPoints: z.number().positive().optional(),
});

// Type exports
export type CouponFormData = z.infer<typeof couponSchema>;
export type UpdateCouponFormData = z.infer<typeof updateCouponSchema>;
export type ClaimCouponFormData = z.infer<typeof claimCouponSchema>;
export type UseCouponFormData = z.infer<typeof useCouponSchema>;
export type VerifyCouponFormData = z.infer<typeof verifyCouponSchema>;
export type CouponFiltersFormData = z.infer<typeof couponFiltersSchema>;
