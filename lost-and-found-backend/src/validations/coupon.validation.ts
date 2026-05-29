import Joi from "joi";

export const createCouponSchema = Joi.object({
  couponType: Joi.string()
    .valid("canteen", "cafeteria", "meal", "snack", "beverage")
    .required(),
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  discountType: Joi.string().valid("fixed", "percentage").required(),
  discountValue: Joi.number().positive().required(),
  pointsRequired: Joi.number().positive().required(),
  originalValue: Joi.number().positive().required(),
  validFrom: Joi.date().required(),
  validUntil: Joi.date().greater(Joi.ref("validFrom")).required(),
  isUnlimited: Joi.boolean().default(true),
  totalQuantity: Joi.when("isUnlimited", {
    is: false,
    then: Joi.number().positive().required(),
    otherwise: Joi.optional(),
  }),
  collegeId: Joi.string().required(),
  canteenName: Joi.string().optional(),
  canteenLocation: Joi.string().optional(),
  operatingHours: Joi.object({
    start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    days: Joi.array().items(Joi.string()),
  }).optional(),
  minimumOrderValue: Joi.number().min(0).optional(),
  maximumDiscount: Joi.when("discountType", {
    is: "percentage",
    then: Joi.number().positive().optional(),
    otherwise: Joi.optional(),
  }),
  redemptionMethod: Joi.string().valid("qr", "code", "manual").default("code"),
  userLimitPerCoupon: Joi.number().positive().default(1),
  dailyUsageLimit: Joi.number().positive().optional(),
  weeklyUsageLimit: Joi.number().positive().optional(),
  allowedItems: Joi.array().items(Joi.string()).optional(),
  termsAndConditions: Joi.array().items(Joi.string()).optional(),
  instructions: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional(),
  isFeatured: Joi.boolean().default(false),
  sortOrder: Joi.number().integer().default(0),
});

// export const updateCouponSchema = Joi.object({
//   title: Joi.string().min(3).max(100),
//   description: Joi.string().min(10).max(500),
//   discountType: Joi.string().valid("fixed", "percentage"),
//   discountValue: Joi.number().positive(),
//   pointsRequired: Joi.number().positive(),
//   originalValue: Joi.number().positive(),
//   validFrom: Joi.date(),
//   validUntil: Joi.date().greater(Joi.ref("validFrom")),
//   isUnlimited: Joi.boolean(),
//   totalQuantity: Joi.number().positive(),
//   status: Joi.string().valid("active", "cancelled"),
//   canteenName: Joi.string(),
//   canteenLocation: Joi.string(),
//   operatingHours: Joi.object({
//     start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
//     end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
//     days: Joi.array().items(Joi.string()),
//   }),
//   minimumOrderValue: Joi.number().min(0),
//   maximumDiscount: Joi.number().positive(),
//   redemptionMethod: Joi.string().valid("qr", "code", "manual"),
//   userLimitPerCoupon: Joi.number().positive(),
//   dailyUsageLimit: Joi.number().positive(),
//   weeklyUsageLimit: Joi.number().positive(),
//   allowedItems: Joi.array().items(Joi.string()),
//   termsAndConditions: Joi.array().items(Joi.string()),
//   instructions: Joi.string(),
//   imageUrl: Joi.string().uri(),
//   isFeatured: Joi.boolean(),
//   sortOrder: Joi.number().integer(),
// });

export const updateCouponSchema = Joi.object({
  // Basic Info
  couponType: Joi.string().valid(
    "canteen",
    "cafeteria",
    "meal",
    "snack",
    "beverage",
  ),
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(500),

  // Discount & Value
  discountType: Joi.string().valid("fixed", "percentage"),
  discountValue: Joi.number().positive(),
  pointsRequired: Joi.number().positive(),
  originalValue: Joi.number().positive(),

  // Validity
  validFrom: Joi.date(),
  validUntil: Joi.date(),

  // Quantity
  isUnlimited: Joi.boolean(),
  totalQuantity: Joi.number().positive(),

  // College & Location
  collegeId: Joi.string().hex().length(24), // Allow super admin to change college
  canteenName: Joi.string().allow("", null),
  canteenLocation: Joi.string().allow("", null),
  operatingHours: Joi.object({
    start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    days: Joi.array().items(Joi.string()),
  }),

  // Restrictions
  minimumOrderValue: Joi.number().min(0),
  maximumDiscount: Joi.number().positive().allow(null),
  userLimitPerCoupon: Joi.number().positive(),
  dailyUsageLimit: Joi.number().positive().allow(null),
  weeklyUsageLimit: Joi.number().positive().allow(null),
  allowedItems: Joi.array().items(Joi.string()),

  // Redemption
  redemptionMethod: Joi.string().valid("qr", "code", "manual"),

  // Terms
  termsAndConditions: Joi.array().items(Joi.string()),
  instructions: Joi.string().allow("", null),

  // Media
  imageUrl: Joi.string().uri().allow("", null),

  // Display settings
  isFeatured: Joi.boolean(),
  sortOrder: Joi.number().integer(),

  // Status
  status: Joi.string().valid("active", "expired", "cancelled"),

  // Meta fields (these will be stripped but need to be allowed to prevent errors)
  _id: Joi.any().optional(),
  couponCode: Joi.string().optional(),
  qrCode: Joi.string().optional(),
  barCode: Joi.string().optional(),
  totalRedemptions: Joi.number().optional(),
  totalPointsRedeemed: Joi.number().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  __v: Joi.number().optional(),
  createdBy: Joi.any().optional(),
  updatedBy: Joi.any().optional(),
  remainingQuantity: Joi.number().optional(),
}).min(1); // At least one field must be provided

export const claimCouponSchema = Joi.object({
  couponId: Joi.string().required(),
  notes: Joi.string().optional(),
});

export const useCouponSchema = Joi.object({
  userCouponId: Joi.string().required(),
  itemsPurchased: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      price: Joi.number().min(0).required(),
    }),
  ),
  totalAmount: Joi.number().positive().required(),
});

export const verifyCouponSchema = Joi.object({
  couponCode: Joi.string(),
  userCouponId: Joi.string(),
}).xor("couponCode", "userCouponId");
