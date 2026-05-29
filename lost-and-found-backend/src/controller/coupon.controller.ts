// src/controllers/coupon.controller.ts
import { Response } from "express";
import mongoose from "mongoose";
import { Coupon, UserCoupon, CouponRedemption } from "../models/coupons.modal";
import { generateCouponCode, generateQRCode } from "../utils/coupon.utils";
import {
  RewardRedemption,
  RewardTransaction,
  UserReward,
} from "../models/reward.model";
import { AuthRequest } from "../types/middlewareTypes";
import Notification from "../models/notification.modal";
import User from "../models/user.model";
import { format } from "date-fns";

// Helper function to check if user has access to a college
const hasCollegeAccess = (
  user: AuthRequest["user"],
  collegeId: string,
): boolean => {
  // Super admin has access to all colleges
  if (user?.role === "super_admin") return true;
  // College admin can only access their own college
  if (user?.role === "college_admin") return user?.collegeId === collegeId;
  // Students can only access their own college
  if (user?.role === "student") return user?.collegeId === collegeId;
  return false;
};

// Admin Controllers

// Create Coupon
export const createCoupon = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const {
      couponType,
      title,
      description,
      discountType,
      discountValue,
      pointsRequired,
      originalValue,
      validFrom,
      validUntil,
      isUnlimited,
      totalQuantity,
      collegeId,
      canteenName,
      canteenLocation,
      operatingHours,
      minimumOrderValue,
      maximumDiscount,
      redemptionMethod,
      userLimitPerCoupon,
      dailyUsageLimit,
      weeklyUsageLimit,
      allowedItems,
      termsAndConditions,
      instructions,
      imageUrl,
      isFeatured,
      sortOrder,
    } = req.body;

    // Validate college access
    if (!hasCollegeAccess(user, collegeId)) {
      throw new Error("You can only create coupons for your college");
    }

    // Determine the college ID to use
    const targetCollegeId =
      user.role === "super_admin" ? collegeId : user.collegeId;

    if (!targetCollegeId) {
      throw new Error("College ID is required");
    }

    // Generate unique coupon code
    const couponCode = await generateCouponCode(couponType);

    const couponData: any = {
      couponCode,
      couponType,
      title,
      description,
      discountType,
      discountValue,
      pointsRequired,
      originalValue,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isUnlimited,
      collegeId: new mongoose.Types.ObjectId(targetCollegeId),
      redemptionMethod: redemptionMethod || "code",
      createdBy: new mongoose.Types.ObjectId(
        user.role === "super_admin" ? "000000000000000000000001" : user._id,
      ),
    };

    // Optional fields
    if (canteenName) couponData.canteenName = canteenName;
    if (canteenLocation) couponData.canteenLocation = canteenLocation;
    if (operatingHours) couponData.operatingHours = operatingHours;
    if (minimumOrderValue) couponData.minimumOrderValue = minimumOrderValue;
    if (maximumDiscount) couponData.maximumDiscount = maximumDiscount;
    if (userLimitPerCoupon) couponData.userLimitPerCoupon = userLimitPerCoupon;
    if (dailyUsageLimit) couponData.dailyUsageLimit = dailyUsageLimit;
    if (weeklyUsageLimit) couponData.weeklyUsageLimit = weeklyUsageLimit;
    if (allowedItems) couponData.allowedItems = allowedItems;
    if (termsAndConditions) couponData.termsAndConditions = termsAndConditions;
    if (instructions) couponData.instructions = instructions;
    if (imageUrl) couponData.imageUrl = imageUrl;
    if (isFeatured !== undefined) couponData.isFeatured = isFeatured;
    if (sortOrder !== undefined) couponData.sortOrder = sortOrder;

    // Handle limited quantity
    if (!isUnlimited) {
      if (!totalQuantity) {
        throw new Error("Total quantity required for limited coupons");
      }
      couponData.totalQuantity = totalQuantity;
      couponData.remainingQuantity = totalQuantity;
    }

    const coupon = new Coupon(couponData);
    await coupon.save({ session });

    await session.commitTransaction();
    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Update Coupon
export const updateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { couponId } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const updates = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check permissions
    if (!hasCollegeAccess(user, coupon.collegeId.toString())) {
      return res.status(403).json({
        success: false,
        message: "You can only update coupons for your college",
      });
    }

    // Prevent updating certain fields if coupon has been redeemed
    if (coupon.totalRedemptions > 0) {
      const restrictedFields = [
        "pointsRequired",
        "discountValue",
        "discountType",
        "originalValue",
      ];
      const attemptedRestricted = restrictedFields.some(
        (field) => updates[field] !== undefined,
      );

      if (attemptedRestricted) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot change value-related fields after coupon has been redeemed",
        });
      }
    }

    Object.assign(coupon, updates);
    coupon.updatedBy = new mongoose.Types.ObjectId(
      user.role === "super_admin" ? "000000000000000000000001" : user._id,
    );
    await coupon.save();

    res.json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Coupon
export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { couponId } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check permissions
    if (!hasCollegeAccess(user, coupon.collegeId.toString())) {
      return res.status(403).json({
        success: false,
        message: "You can only delete coupons for your college",
      });
    }

    // Check if coupon has been used
    if (coupon.totalRedemptions > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete coupon that has been redeemed. Consider marking as inactive instead.",
      });
    }

    await coupon.deleteOne();

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Coupons (Admin with filters)
export const getAllCoupons = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const {
      page = 1,
      limit = 20,
      status,
      couponType,
      collegeId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query: any = {};

    // Filter by college
    if (user.role === "college_admin") {
      query.collegeId = new mongoose.Types.ObjectId(user.collegeId);
    } else if (user.role === "super_admin" && collegeId) {
      query.collegeId = new mongoose.Types.ObjectId(collegeId as string);
    } else if (user.role === "super_admin") {
      // Super admin can see all, no filter
    }

    if (status) query.status = status;
    if (couponType) query.couponType = couponType;

    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate("collegeId", "name shortName")
        .populate("createdBy", "name email")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Coupon.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Coupon by ID (Admin)
export const getCouponById = async (req: AuthRequest, res: Response) => {
  try {
    const { couponId } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const coupon = await Coupon.findById(couponId)
      .populate("collegeId", "name shortName location")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check permissions
    if (!hasCollegeAccess(user, coupon.collegeId._id.toString())) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Coupons by College
export const getCouponsByCollege = async (req: AuthRequest, res: Response) => {
  try {
    const { collegeId } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!hasCollegeAccess(user, collegeId as string)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const coupons = await Coupon.find({
      collegeId: new mongoose.Types.ObjectId(collegeId as string),
    }).sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// User Controllers

// Get Available Coupons for User's College
export const getAvailableCoupons = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log("=== getAvailableCoupons Debug ===");
    console.log("User:", {
      id: user._id,
      collegeId: user.collegeId,
      role: user.role,
    });

    if (!user.collegeId && user.role !== "super_admin") {
      console.log("User has no collegeId, returning empty");
      return res.status(400).json({
        success: false,
        message: "User has no college associated",
      });
    }

    const now = new Date();
    console.log("Current server time:", now.toISOString());
    console.log("Current server time (local):", now.toString());

    const query: any = {
      status: "active",
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    };

    // Filter by college for non-super admins
    if (user.role !== "super_admin") {
      query.collegeId = new mongoose.Types.ObjectId(user.collegeId);
    }

    // Only show coupons with remaining quantity
    query.$or = [{ isUnlimited: true }, { remainingQuantity: { $gt: 0 } }];

    console.log("MongoDB Query:", JSON.stringify(query, null, 2));

    const coupons = await Coupon.find(query)
      .sort({ isFeatured: -1, sortOrder: 1, pointsRequired: 1 })
      .select("-__v -createdBy -updatedBy");

    console.log(`Found ${coupons.length} coupons`);

    // Log first coupon details if exists
    if (coupons.length > 0) {
      console.log("First coupon:", {
        id: coupons[0]._id,
        title: coupons[0].title,
        validFrom: coupons[0].validFrom,
        validUntil: coupons[0].validUntil,
        status: coupons[0].status,
        collegeId: coupons[0].collegeId,
      });
    } else {
      // Check if the specific coupon exists but doesn't match query
      const specificCoupon = await Coupon.findById("6a109dec5afe393e00f6d674");
      if (specificCoupon) {
        console.log("Specific coupon found:", {
          id: specificCoupon._id,
          title: specificCoupon.title,
          status: specificCoupon.status,
          collegeId: specificCoupon.collegeId,
          validFrom: specificCoupon.validFrom,
          validUntil: specificCoupon.validUntil,
          isUnlimited: specificCoupon.isUnlimited,
          remainingQuantity: specificCoupon.remainingQuantity,
        });

        // Check why it's not matching
        const now = new Date();
        console.log("Date checks:", {
          validFromCheck: specificCoupon.validFrom <= now,
          validUntilCheck: specificCoupon.validUntil >= now,
          statusCheck: specificCoupon.status === "active",
          collegeCheck:
            specificCoupon.collegeId.toString() === user.collegeId?.toString(),
          unlimitedCheck:
            specificCoupon.isUnlimited || specificCoupon.remainingQuantity! > 0,
        });
      }
    }

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error: any) {
    console.error("Error in getAvailableCoupons:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get User's Claimed Coupons
export const getUserCoupons = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { status = "active" } = req.query;

    const userCoupons = await UserCoupon.find({
      userId: new mongoose.Types.ObjectId(user._id),
      status,
    })
      .populate(
        "couponId",
        "title description discountType discountValue originalValue imageUrl canteenName operatingHours",
      )
      .sort({ createdAt: -1 });

    // Check for expired coupons
    const now = new Date();
    const expiredCoupons = userCoupons.filter(
      (uc: any) => uc.status === "active" && uc.expiresAt < now,
    );

    if (expiredCoupons.length > 0) {
      await UserCoupon.updateMany(
        { _id: { $in: expiredCoupons.map((uc: any) => uc._id) } },
        { status: "expired" },
      );

      // Refetch if needed
      if (status === "active") {
        const updatedUserCoupons = await UserCoupon.find({
          userId: new mongoose.Types.ObjectId(user._id),
          status: "active",
        })
          .populate(
            "couponId",
            "title description discountType discountValue originalValue imageUrl canteenName operatingHours",
          )
          .sort({ createdAt: -1 });

        return res.json({
          success: true,
          data: updatedUserCoupons,
        });
      }
    }

    res.json({
      success: true,
      data: userCoupons,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Coupon Details
export const getCouponDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { couponId } = req.params;
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const coupon = await Coupon.findById(couponId)
      .populate("collegeId", "name shortName location")
      .select("-__v");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check if coupon belongs to user's college (for non-super admins)
    if (
      user.role !== "super_admin" &&
      coupon.collegeId._id.toString() !== user.collegeId
    ) {
      return res.status(403).json({
        success: false,
        message: "This coupon is not available for your college",
      });
    }

    // Check if user has claimed this coupon
    const userCoupon = await UserCoupon.findOne({
      userId: new mongoose.Types.ObjectId(user._id),
      couponId: coupon._id,
    });

    // Check if user can claim (has enough points)
    const userReward = await UserReward.findOne({
      userId: new mongoose.Types.ObjectId(user._id),
    });
    const canClaim =
      (userReward?.availablePoints || 0) >= coupon.pointsRequired;

    res.json({
      success: true,
      data: {
        ...coupon.toObject(),
        userHasClaimed: !!userCoupon,
        userCouponStatus: userCoupon?.status,
        userCanClaim: canClaim,
        userAvailablePoints: userReward?.availablePoints || 0,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Claim Coupon (Redeem Points)
export const claimCoupon = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { couponId, notes } = req.body;

    // Get coupon
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Check if coupon belongs to user's college (for non-super admins)
    if (
      user.role !== "super_admin" &&
      coupon.collegeId.toString() !== user.collegeId
    ) {
      throw new Error("This coupon is not available for your college");
    }

    // Check if user already claimed this coupon
    const existingUserCoupon = await UserCoupon.findOne({
      userId: new mongoose.Types.ObjectId(user._id),
      couponId: coupon._id,
      status: { $in: ["active", "used"] },
    });

    if (existingUserCoupon) {
      throw new Error("You have already claimed this coupon");
    }

    // Get user's reward points
    const userReward = await UserReward.findOne({
      userId: new mongoose.Types.ObjectId(user._id),
    });

    if (!userReward || userReward.availablePoints < coupon.pointsRequired) {
      throw new Error("Insufficient points to claim this coupon");
    }

    // Create reward transaction
    const transaction = new RewardTransaction({
      userId: new mongoose.Types.ObjectId(user._id),
      amount: -coupon.pointsRequired,
      type: "redeem_reward",
      description: `Redeemed ${coupon.pointsRequired} points for coupon: ${coupon.title}`,
      status: "completed",
      metadata: new Map([
        ["couponId", coupon._id.toString()],
        ["couponCode", coupon.couponCode],
      ]),
    });

    await transaction.save({ session });

    // Create reward redemption record
    const redemption = new RewardRedemption({
      userId: new mongoose.Types.ObjectId(user._id),
      points: coupon.pointsRequired,
      rewardType: "voucher",
      item: {
        id: coupon._id.toString(),
        name: coupon.title,
        description: coupon.description,
        value: coupon.originalValue,
      },
      status: "approved",
      notes: notes || `Redeemed for ${coupon.title}`,
      deliveryInfo: {
        email: user.email,
      },
    });

    await redemption.save({ session });

    // Update user's points
    userReward.availablePoints -= coupon.pointsRequired;
    userReward.redeemedPoints += coupon.pointsRequired;
    await userReward.save({ session });

    // Generate QR code if needed
    let qrCodeData = null;
    if (coupon.redemptionMethod === "qr") {
      qrCodeData = await generateQRCode(coupon.couponCode);
    }

    // Create user coupon
    const userCoupon = new UserCoupon({
      userId: new mongoose.Types.ObjectId(user._id),
      couponId: coupon._id,
      couponCode: coupon.couponCode,
      couponData: {
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        originalValue: coupon.originalValue,
        couponType: coupon.couponType,
      },
      pointsUsed: coupon.pointsRequired,
      status: "active",
      redeemedAt: new Date(),
      expiresAt: coupon.validUntil,
      qrCode: qrCodeData,
      redemptionMethod: coupon.redemptionMethod,
      transactionId: transaction._id,
      redemptionId: redemption._id,
    });

    await userCoupon.save({ session });

    // Update coupon statistics
    coupon.totalRedemptions += 1;
    coupon.totalPointsRedeemed += coupon.pointsRequired;
    if (!coupon.isUnlimited) {
      coupon.remainingQuantity! -= 1;
    }
    await coupon.save({ session });

    // ==================== CREATE NOTIFICATIONS ====================

    // Notification 1: Reward earned notification (points deducted)
    const rewardNotification = new Notification({
      userId: new mongoose.Types.ObjectId(user._id),
      type: "reward_earned",
      title: "Coupon Redeemed Successfully! 🎉",
      message: `You have successfully redeemed ${coupon.pointsRequired} points for "${coupon.title}". Your coupon code is: ${coupon.couponCode}`,
      priority: "medium",
      data: {
        couponId: coupon._id.toString(),
        couponCode: coupon.couponCode,
        pointsUsed: coupon.pointsRequired,
        pointsRemaining: userReward.availablePoints,
        couponTitle: coupon.title,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await rewardNotification.save({ session });

    // Notification 2: Points balance update notification
    const pointsNotification = new Notification({
      userId: new mongoose.Types.ObjectId(user._id),
      type: "reward_earned",
      title: "Points Balance Updated",
      message: `You have used ${coupon.pointsRequired} points. Your remaining balance is ${userReward.availablePoints} points.`,
      priority: "low",
      data: {
        pointsUsed: coupon.pointsRequired,
        pointsRemaining: userReward.availablePoints,
        transactionId: transaction._id.toString(),
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await pointsNotification.save({ session });

    // Notification 3: If low stock warning (if applicable)
    if (
      !coupon.isUnlimited &&
      coupon.remainingQuantity &&
      coupon.remainingQuantity <= 5
    ) {
      // Notify admin about low stock (optional)
      const adminUsers = await User.find({
        role: { $in: ["super_admin", "college_admin"] },
        collegeId: coupon.collegeId,
      }).select("_id");

      for (const admin of adminUsers) {
        const lowStockNotification = new Notification({
          userId: admin._id,
          type: "admin_approval",
          title: "Low Stock Alert! ⚠️",
          message: `Coupon "${coupon.title}" has only ${coupon.remainingQuantity} remaining!`,
          priority: "high",
          data: {
            couponId: coupon._id.toString(),
            couponTitle: coupon.title,
            remainingQuantity: coupon.remainingQuantity,
          },
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        });
        await lowStockNotification.save({ session });
      }
    }

    // Notification 4: Expiry reminder (if coupon expires soon)
    const daysUntilExpiry = Math.ceil(
      (coupon.validUntil.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      const expiryNotification = new Notification({
        userId: new mongoose.Types.ObjectId(user._id),
        type: "reward_earned",
        title: "Coupon Expiring Soon! ⏰",
        message: `Your coupon "${coupon.title}" will expire in ${daysUntilExpiry} days on ${format(coupon.validUntil, "PPP")}. Don't forget to use it!`,
        priority: "high",
        data: {
          couponId: coupon._id.toString(),
          couponCode: coupon.couponCode,
          couponTitle: coupon.title,
          expiryDate: coupon.validUntil,
          daysUntilExpiry,
        },
        expiresAt: coupon.validUntil,
      });
      await expiryNotification.save({ session });
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Coupon claimed successfully",
      data: {
        userCoupon,
        pointsRemaining: userReward.availablePoints,
        pointsUsed: coupon.pointsRequired,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Use Coupon (At Canteen/Cafeteria)
export const useCoupon = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { userCouponId, itemsPurchased, totalAmount } = req.body;

    // Get user's coupon
    const userCoupon = await UserCoupon.findById(userCouponId);
    if (!userCoupon) {
      throw new Error("Coupon not found");
    }

    // Verify ownership
    if (userCoupon.userId.toString() !== user._id.toString()) {
      throw new Error("You don't own this coupon");
    }

    // Check coupon status
    if (userCoupon.status !== "active") {
      throw new Error(`Coupon is ${userCoupon.status}`);
    }

    // Check if expired
    if (userCoupon.expiresAt < new Date()) {
      userCoupon.status = "expired";
      await userCoupon.save({ session });
      throw new Error("Coupon has expired");
    }

    // Get coupon details
    const coupon = await Coupon.findById(userCoupon.couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
      if (coupon.maximumDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, totalAmount);
    }

    if (coupon.minimumOrderValue && totalAmount < coupon.minimumOrderValue) {
      throw new Error(
        `Minimum order value of $${coupon.minimumOrderValue} required`,
      );
    }

    // Create redemption record
    const couponRedemption = new CouponRedemption({
      couponId: coupon._id,
      userCouponId: userCoupon._id,
      userId: new mongoose.Types.ObjectId(user._id),
      collegeId: coupon.collegeId,
      couponCode: userCoupon.couponCode,
      pointsUsed: userCoupon.pointsUsed,
      redemptionMethod: userCoupon.redemptionMethod,
      rewardTransactionId: userCoupon.transactionId,
      rewardRedemptionId: userCoupon.redemptionId,
      itemsPurchased: itemsPurchased || [],
      totalAmount,
      discountApplied: discountAmount,
      status: "completed",
      verifiedAt: new Date(),
    });

    await couponRedemption.save({ session });

    // Update user coupon status
    userCoupon.status = "used";
    userCoupon.usedAt = new Date();
    await userCoupon.save({ session });

    // ==================== CREATE NOTIFICATIONS ====================

    // Notification 1: Coupon used successfully
    const usedNotification = new Notification({
      userId: new mongoose.Types.ObjectId(user._id),
      type: "reward_earned",
      title: "Coupon Used Successfully! ✅",
      message: `You have successfully used "${coupon.title}" and saved $${discountAmount.toFixed(2)} on your purchase of $${totalAmount.toFixed(2)}.`,
      priority: "medium",
      data: {
        couponId: coupon._id.toString(),
        couponCode: userCoupon.couponCode,
        couponTitle: coupon.title,
        originalAmount: totalAmount,
        discountAmount,
        finalAmount: totalAmount - discountAmount,
        itemsPurchased,
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await usedNotification.save({ session });

    // Notification 2: Savings summary notification
    const savingsNotification = new Notification({
      userId: new mongoose.Types.ObjectId(user._id),
      type: "reward_earned",
      title: "You Saved Money! 💰",
      message: `Your coupon saved you $${discountAmount.toFixed(2)} today. Total savings from coupons: $${userCoupon.pointsUsed * 0.01}`,
      priority: "low",
      data: {
        couponId: coupon._id.toString(),
        couponTitle: coupon.title,
        discountAmount,
        totalSaved: userCoupon.pointsUsed * 0.01,
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await savingsNotification.save({ session });

    // Notification 3: Feedback request (optional)
    const feedbackNotification = new Notification({
      userId: new mongoose.Types.ObjectId(user._id),
      type: "reward_earned",
      title: "How was your experience? ⭐",
      message: `We'd love to hear about your experience using "${coupon.title}" at ${coupon.canteenName || "our partner"}!`,
      priority: "low",
      data: {
        couponId: coupon._id.toString(),
        couponTitle: coupon.title,
        feedbackRequest: true,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await feedbackNotification.save({ session });

    // Notification 4: Notify admin about coupon usage (for tracking)
    if (coupon.totalRedemptions + 1 >= (coupon.totalQuantity || 0) * 0.8) {
      const adminUsers = await User.find({
        role: { $in: ["super_admin", "college_admin"] },
        collegeId: coupon.collegeId,
      }).select("_id");

      for (const admin of adminUsers) {
        const adminNotification = new Notification({
          userId: admin._id,
          type: "admin_approval",
          title: "Coupon Popular! 📈",
          message: `Coupon "${coupon.title}" has been redeemed ${coupon.totalRedemptions + 1} times and is ${Math.round(((coupon.totalRedemptions + 1) / (coupon.totalQuantity || 1)) * 100)}% utilized.`,
          priority: "medium",
          data: {
            couponId: coupon._id.toString(),
            couponTitle: coupon.title,
            redemptionCount: coupon.totalRedemptions + 1,
            totalQuantity: coupon.totalQuantity,
            utilizationPercentage: Math.round(
              ((coupon.totalRedemptions + 1) / (coupon.totalQuantity || 1)) *
                100,
            ),
          },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        await adminNotification.save({ session });
      }
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Coupon used successfully",
      data: {
        couponCode: userCoupon.couponCode,
        originalAmount: totalAmount,
        discountAmount,
        finalAmount: totalAmount - discountAmount,
        savings: discountAmount,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Verify Coupon (For Canteen Staff)
export const verifyCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { couponCode, userCouponId } = req.body;
    const staff = req.user;

    if (!staff) {
      throw new Error("User not authenticated");
    }

    if (staff.role !== "college_admin" && staff.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only college admins can verify coupons",
      });
    }

    let userCoupon;
    if (couponCode) {
      userCoupon = await UserCoupon.findOne({ couponCode }).populate(
        "couponId",
        "title description discountValue canteenName collegeId",
      );
    } else if (userCouponId) {
      userCoupon = await UserCoupon.findById(userCouponId).populate(
        "couponId",
        "title description discountValue canteenName collegeId",
      );
    } else {
      throw new Error("Coupon code or ID required");
    }

    if (!userCoupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check if coupon belongs to staff's college
    const coupon = await Coupon.findById(userCoupon.couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    if (
      staff.role !== "super_admin" &&
      coupon.collegeId.toString() !== staff.collegeId
    ) {
      return res.status(403).json({
        success: false,
        message: "This coupon is not valid for your college",
      });
    }

    // Check status
    if (userCoupon.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Coupon is ${userCoupon.status}`,
        data: { status: userCoupon.status },
      });
    }

    // Check expiry
    if (userCoupon.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
        data: { expiresAt: userCoupon.expiresAt },
      });
    }

    res.json({
      success: true,
      message: "Coupon is valid",
      data: {
        couponCode: userCoupon.couponCode,
        title: userCoupon.couponData.title,
        description: userCoupon.couponData.description,
        discountValue: userCoupon.couponData.discountValue,
        discountType: userCoupon.couponData.discountType,
        expiresAt: userCoupon.expiresAt,
        userId: userCoupon.userId,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Coupon Redemptions (Admin)
export const getCouponRedemptions = async (req: AuthRequest, res: Response) => {
  try {
    const { couponId } = req.params;
    const user = req.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { page = 1, limit = 20 } = req.query;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check permissions
    if (!hasCollegeAccess(user, coupon.collegeId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [redemptions, total] = await Promise.all([
      CouponRedemption.find({
        couponId: new mongoose.Types.ObjectId(couponId as string),
      })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CouponRedemption.countDocuments({
        couponId: new mongoose.Types.ObjectId(couponId as string),
      }),
    ]);

    res.json({
      success: true,
      data: redemptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Redemption History
export const getMyRedemptionHistory = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [redemptions, total] = await Promise.all([
      CouponRedemption.find({ userId: new mongoose.Types.ObjectId(user._id) })
        .populate("couponId", "title couponType imageUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CouponRedemption.countDocuments({
        userId: new mongoose.Types.ObjectId(user._id),
      }),
    ]);

    res.json({
      success: true,
      data: redemptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Coupon Analytics
export const getCouponAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { couponId } = req.params;
    const user = req.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Check permissions
    if (!hasCollegeAccess(user, coupon.collegeId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Get redemption analytics
    const redemptions = await CouponRedemption.find({ couponId: coupon._id });

    const analytics = {
      totalRedemptions: coupon.totalRedemptions,
      totalPointsRedeemed: coupon.totalPointsRedeemed,
      totalValueRedeemed: redemptions.reduce(
        (sum: number, r: any) => sum + (r.totalAmount || 0),
        0,
      ),
      totalDiscountGiven: redemptions.reduce(
        (sum: number, r: any) => sum + (r.discountApplied || 0),
        0,
      ),
      averageDiscountPerRedemption:
        redemptions.length > 0
          ? redemptions.reduce(
              (sum: number, r: any) => sum + (r.discountApplied || 0),
              0,
            ) / redemptions.length
          : 0,
      uniqueUsers: new Set(redemptions.map((r: any) => r.userId.toString()))
        .size,
      redemptionsByDay: await CouponRedemption.aggregate([
        { $match: { couponId: coupon._id } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get College Coupon Stats
export const getCollegeCouponStats = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    let collegeId: mongoose.Types.ObjectId | undefined;

    if (user.role === "super_admin" && req.query.collegeId) {
      collegeId = new mongoose.Types.ObjectId(req.query.collegeId as string);
    } else if (user.collegeId) {
      collegeId = new mongoose.Types.ObjectId(user.collegeId);
    } else {
      return res.status(400).json({
        success: false,
        message: "College ID required",
      });
    }

    const stats = await Coupon.aggregate([
      { $match: { collegeId: collegeId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalPointsRequired: { $sum: "$pointsRequired" },
          totalRedemptions: { $sum: "$totalRedemptions" },
          totalPointsRedeemed: { $sum: "$totalPointsRedeemed" },
        },
      },
    ]);

    const activeCoupons = await Coupon.countDocuments({
      collegeId: collegeId,
      status: "active",
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    const totalUserCoupons = await UserCoupon.countDocuments({
      couponId: {
        $in: await Coupon.find({ collegeId: collegeId }).distinct("_id"),
      },
    });

    res.json({
      success: true,
      data: {
        collegeId,
        stats,
        activeCoupons,
        totalUserCoupons,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
