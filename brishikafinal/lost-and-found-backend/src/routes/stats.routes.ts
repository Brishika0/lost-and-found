import express from "express";
import { auth, requireRole } from "../middleware/auth.middleware";
import {
  getDashboardStats,
  getItemsStats,
  getUsersStats,
  getZonesStats,
  getDisputesStats,
  getChatsStats,
  getAllCollegesStats,
  exportAnalytics,
} from "../controller/stats.controller";

const router = express.Router();

// All stats routes require authentication
router.use(auth);

//  DASHBOARD
// GET /api/stats/dashboard - Main dashboard stats
router.get(
  "/dashboard",
  requireRole(["super_admin", "college_admin"]),
  getDashboardStats,
);

//  ITEMS STATS
// GET /api/stats/items - Items statistics
router.get(
  "/items",
  requireRole(["super_admin", "college_admin"]),
  getItemsStats,
);

//  USERS STATS
// GET /api/stats/users - Users statistics
router.get(
  "/users",
  requireRole(["super_admin", "college_admin"]),
  getUsersStats,
);

//  ZONES STATS
// GET /api/stats/zones - Zones statistics
router.get(
  "/zones",
  requireRole(["super_admin", "college_admin"]),
  getZonesStats,
);

//  DISPUTES STATS
// GET /api/stats/disputes - Disputes statistics
router.get(
  "/disputes",
  requireRole(["super_admin", "college_admin"]),
  getDisputesStats,
);

//  CHATS STATS
// GET /api/stats/chats - Chats statistics
router.get(
  "/chats",
  requireRole(["super_admin", "college_admin"]),
  getChatsStats,
);

//  COLLEGES STATS (Super Admin Only)
// GET /api/stats/colleges - All colleges statistics
router.get("/colleges", requireRole(["super_admin"]), getAllCollegesStats);

//  EXPORT ANALYTICS
// GET /api/stats/export - Export analytics report
router.get("/export", requireRole(["super_admin"]), exportAnalytics);

export default router;
