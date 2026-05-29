import express from "express";
import {
  // Core CRUD
  GetColleges,
  GetCollegeById,
  CreateCollege,
  UpdateCollege,
  DeleteCollege,
  UpdateCollegeStatus,

  // Admin management
  AddCollegeAdmin,
  RemoveCollegeAdmin,

  // Additional features
  GetCollegesByDomain,
  GetCollegeStats,
} from "../controller/college.controller";
import { auth, requireRole } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = express.Router();

// PUBLIC ROUTES
// GET /api/colleges - Get all colleges with pagination
router.get("/", GetColleges);

// GET /api/colleges/:id - Get single college by ID
router.get("/:id", GetCollegeById);

// POST /api/colleges/verify-domain - Check if domain exists (for registration)
router.post("/verify-domain", GetCollegesByDomain);

// PROTECTED ROUTES
// All routes below require authentication
router.use(auth);

// SUPER ADMIN ONLY
// POST /api/colleges - Create new college
router.post(
  "/",
  requireRole(["super_admin"]),
  upload.single("logo"),
  CreateCollege,
);

// PUT /api/colleges/:id - Update college
router.put(
  "/:id",
  requireRole(["super_admin"]),
  upload.single("logo"),
  UpdateCollege,
);

// PATCH /api/colleges/:id/status - Activate/deactivate college
router.patch("/:id/status", requireRole(["super_admin"]), UpdateCollegeStatus);

// DELETE /api/colleges/:id - Delete college
router.delete("/:id", requireRole(["super_admin"]), DeleteCollege);

// POST /api/colleges/:id/admins - Add admin to college
router.post("/:id/admins", requireRole(["super_admin"]), AddCollegeAdmin);

// DELETE /api/colleges/:id/admins/:adminId - Remove admin from college
router.delete(
  "/:id/admins/:adminId",
  requireRole(["super_admin"]),
  RemoveCollegeAdmin,
);

// SUPER ADMIN + COLLEGE ADMIN
// GET /api/colleges/:id/stats - Get college statistics
router.get(
  "/:id/stats",
  requireRole(["super_admin", "college_admin"]),
  GetCollegeStats,
);

export default router;
