import express from "express";
import { auth, requireRole } from "../middleware/auth.middleware";
import {
  getMyRewards,
  getRewardsList,
  redeemReward,
  getMyRedemptions,
  approveRedemption,
  getPendingRedemptions,
  getRewardTransactions,
} from "../controller/reward.controller";

const router = express.Router();

router.use(auth);

// User routes
router.get("/my-rewards", getMyRewards);
router.get("/available", getRewardsList);
router.post("/redeem", redeemReward);
router.get("/my-redemptions", getMyRedemptions);
router.get("/transactions", getRewardTransactions);

// Admin routes
router.get(
  "/pending-redemptions",
  requireRole(["super_admin", "college_admin"]),
  getPendingRedemptions,
);
router.patch(
  "/redemptions/:id/approve",
  requireRole(["super_admin", "college_admin"]),
  approveRedemption,
);

export default router;
