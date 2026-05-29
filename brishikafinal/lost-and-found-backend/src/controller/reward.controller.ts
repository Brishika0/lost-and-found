import { Response } from "express";
import {
  getUserRewardSummary,
  getAvailableRewards,
  createRedemptionRequest,
  deductPointsForRedemption,
} from "../services/reward.service";
import { RewardRedemption, RewardTransaction } from "../models/reward.model";
import { AuthRequest } from "../types/middlewareTypes";
import mongoose from "mongoose";

// Get user's reward summary
export const getMyRewards = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const rewardSummary = await getUserRewardSummary(req.user._id);

    res.status(200).json({
      success: true,
      data: rewardSummary,
    });
  } catch (error: any) {
    console.error("Get rewards error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Get available rewards for redemption
export const getRewardsList = async (req: AuthRequest, res: Response) => {
  try {
    const rewards = await getAvailableRewards();

    res.status(200).json({
      success: true,
      data: rewards,
    });
  } catch (error: any) {
    console.error("Get rewards list error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Redeem points for a reward
export const redeemReward = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const {
      rewardId,
      rewardName,
      rewardPoints,
      rewardType,
      rewardValue,
      deliveryInfo,
    } = req.body;

    if (!rewardId || !rewardName || !rewardPoints || !rewardType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const rewardData = {
      id: rewardId,
      name: rewardName,
      points: rewardPoints,
      type: rewardType,
      value: rewardValue,
      description: `Redeem ${rewardPoints} points for ${rewardName}`,
    };

    const redemption = await createRedemptionRequest(
      req.user._id,
      rewardId,
      rewardData,
      deliveryInfo,
    );

    res.status(201).json({
      success: true,
      message: "Redemption request submitted successfully",
      data: redemption,
    });
  } catch (error: any) {
    console.error("Redeem reward error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Get user's redemption history
export const getMyRedemptions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const redemptions = await RewardRedemption.find({
      userId: new mongoose.Types.ObjectId(req.user._id),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: redemptions,
    });
  } catch (error: any) {
    console.error("Get redemptions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Admin: Approve redemption request
export const approveRedemption = async (req: AuthRequest, res: Response) => {
  try {
    if (
      req.user?.role !== "super_admin" &&
      req.user?.role !== "college_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const redemption = await RewardRedemption.findById(id);

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: "Redemption request not found",
      });
    }

    redemption.status = status;
    if (notes) redemption.notes = notes;

    if (status === "approved") {
      redemption.approvedBy = new mongoose.Types.ObjectId(req.user._id);
      redemption.approvedAt = new Date();

      // Deduct points from user
      await deductPointsForRedemption(
        redemption.userId.toString(),
        redemption.points,
        redemption._id.toString(),
      );
    }

    await redemption.save();

    res.status(200).json({
      success: true,
      message: `Redemption ${status}`,
      data: redemption,
    });
  } catch (error: any) {
    console.error("Approve redemption error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Admin: Get all pending redemptions
export const getPendingRedemptions = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (
      req.user?.role !== "super_admin" &&
      req.user?.role !== "college_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    const redemptions = await RewardRedemption.find({ status: "pending" })
      .populate("userId", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: redemptions,
    });
  } catch (error: any) {
    console.error("Get pending redemptions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Get reward transaction history
export const getRewardTransactions = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await RewardTransaction.find({
      userId: new mongoose.Types.ObjectId(req.user._id),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await RewardTransaction.countDocuments({
      userId: new mongoose.Types.ObjectId(req.user._id),
    });

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Get reward transactions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
