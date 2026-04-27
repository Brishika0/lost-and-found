import express from "express";
import {
  // Get users
  getStudents,
  getCollegeAdmins,
  getUserById,
  getUserStats,

  // Create/Update/Delete
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  permanentDeleteUser,
  verifyUserEmail,
} from "../controller/user.controller";
import { auth, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

//  ALL ROUTES REQUIRE AUTHENTICATION
router.use(auth);

//  PUBLIC (AUTHENTICATED) ROUTES
// Any authenticated user can view their own profile
router.get("/me", getUserById); // Special case - gets current user

//  STUDENT ROUTES
// Get all students (Super Admin or College Admin)
router.get(
  "/students",
  requireRole(["super_admin", "college_admin"]),
  getStudents,
);

//  COLLEGE ADMIN ROUTES
// Get all college admins (Super Admin only)
router.get("/admins", requireRole(["super_admin"]), getCollegeAdmins);

//  USER STATISTICS
// Get user statistics (Super Admin or College Admin)
router.get(
  "/stats",
  requireRole(["super_admin", "college_admin"]),
  getUserStats,
);

//  SINGLE USER OPERATIONS
// Get single user by ID (Super Admin or College Admin)
router.get("/:id", requireRole(["super_admin", "college_admin"]), getUserById);

// Create new user (Super Admin or College Admin)
router.post("/", requireRole(["super_admin", "college_admin"]), createUser);

// Update user (Super Admin or College Admin)
router.put("/:id", requireRole(["super_admin", "college_admin"]), updateUser);

// Toggle user active status (Super Admin or College Admin)
router.patch(
  "/:id/toggle-status",
  requireRole(["super_admin", "college_admin"]),
  toggleUserStatus,
);

// Soft delete user (Super Admin only)
router.delete("/:id", requireRole(["super_admin"]), deleteUser);

// Permanent delete user (Super Admin only)
router.delete(
  "/:id/permanent",
  requireRole(["super_admin"]),
  permanentDeleteUser,
);

// Verify a single user's email
router.patch(
  "/:id/verify-email",
  requireRole(["super_admin", "college_admin"]),
  verifyUserEmail,
);

export default router;
