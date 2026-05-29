import express from "express";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  getCouponsByCollege,
  getAvailableCoupons,
  getUserCoupons,
  claimCoupon,
  getCouponDetails,
  useCoupon,
  verifyCoupon,
  getCouponRedemptions,
  getMyRedemptionHistory,
  getCouponAnalytics,
  getCollegeCouponStats,
} from "../controller/coupon.controller";
import { auth, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createCouponSchema,
  updateCouponSchema,
  claimCouponSchema,
  useCouponSchema,
  verifyCouponSchema,
} from "../validations/coupon.validation";

const router = express.Router();

//  Admin & College Admin Routes

// Create coupon (Super Admin & College Admin)
router.post(
  "/",
  auth,
  requireRole(["super_admin", "college_admin"]),
  validate(createCouponSchema),
  createCoupon,
);

// Get all coupons (with filters)
router.get(
  "/all",
  auth,
  requireRole(["super_admin", "college_admin"]),
  getAllCoupons,
);

// Update coupon
router.put(
  "/:couponId",
  auth,
  requireRole(["super_admin", "college_admin"]),
  validate(updateCouponSchema),
  updateCoupon,
);

// Delete coupon
router.delete(
  "/:couponId",
  auth,
  requireRole(["super_admin", "college_admin"]),
  deleteCoupon,
);

// Get coupon by ID (admin)
router.get(
  "/admin/:couponId",
  auth,
  requireRole(["super_admin", "college_admin"]),
  getCouponById,
);

// Get coupons by college
router.get(
  "/college/:collegeId",
  auth,
  requireRole(["super_admin", "college_admin"]),
  getCouponsByCollege,
);

// Get coupon redemptions
router.get(
  "/redemptions/:couponId",
  auth,
  requireRole(["super_admin", "college_admin"]),
  getCouponRedemptions,
);

// Get coupon analytics
router.get(
  "/analytics/:couponId",
  auth,
  requireRole(["super_admin", "college_admin"]),
  getCouponAnalytics,
);

// Get college coupon stats
router.get(
  "/stats/college",
  auth,
  requireRole(["super_admin", "college_admin"]),
  getCollegeCouponStats,
);

//  User Routes
// IMPORTANT: Place specific routes BEFORE dynamic routes like "/:couponId"

// Get available coupons for user's college
router.get(
  "/available",
  auth,
  requireRole(["student", "college_admin"]),
  getAvailableCoupons,
);

// Get user's claimed coupons
router.get(
  "/my-coupons",
  auth,
  requireRole(["student", "college_admin"]),
  getUserCoupons,
);

// Get user's redemption history
router.get(
  "/my-redemptions",
  auth,
  requireRole(["student", "college_admin"]),
  getMyRedemptionHistory,
);

// Get coupon details - THIS MUST COME AFTER SPECIFIC ROUTES
router.get(
  "/:couponId",
  auth,
  requireRole(["student", "college_admin"]),
  getCouponDetails,
);

// Claim a coupon (redeem points)
router.post(
  "/claim",
  auth,
  requireRole(["student", "college_admin"]),
  validate(claimCouponSchema),
  claimCoupon,
);

// Use a coupon (at canteen/cafeteria)
router.post(
  "/use",
  auth,
  requireRole(["student", "college_admin"]),
  validate(useCouponSchema),
  useCoupon,
);

// Verify coupon (for canteen staff)
router.post(
  "/verify",
  auth,
  requireRole(["college_admin"]),
  validate(verifyCouponSchema),
  verifyCoupon,
);

export default router;
