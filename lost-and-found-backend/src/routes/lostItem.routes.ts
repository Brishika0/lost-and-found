import express from "express";
import {
  // Create
  createLostItem,

  // Read
  getLostItems,
  getLostItemById,
  getMyLostItems,
  getMyInteractions,
  getTrendingItems,
  searchItems,
  getItemsByZone,
  getNearbyItems,

  // Update
  updateLostItem,
  updateLostItemStatus,
  verifyItem,

  // Image Management
  addImages,
  setPrimaryImage,
  removeImage,

  // Delete
  deleteLostItem,
  permanentDeleteLostItem,

  // Social Actions
  likeLostItem,
  unlikeLostItem,
  shareLostItem,
  flagLostItem,

  // Admin Actions
  getFlaggedItems,
  resolveItemFlags,
} from "../controller/lostItem.controller";
import { auth, requireRole } from "../middleware/auth.middleware";
import { uploadMultiple } from "../middleware/upload.middleware";

const router = express.Router();

// PUBLIC ROUTES (require collegeId in query)
router.get("/", getLostItems); // GET /api/lost-items?collegeId=xxx
router.get("/trending", getTrendingItems); // GET /api/lost-items/trending?collegeId=xxx
router.get("/search", searchItems); // GET /api/lost-items/search?q=xxx&collegeId=xxx
router.get("/nearby", getNearbyItems); // GET /api/lost-items/nearby?lat=xx&lng=xx&collegeId=xxx
router.get("/zone/:zoneId", getItemsByZone); // GET /api/lost-items/zone/:zoneId?collegeId=xxx
router.get("/:id", getLostItemById); // GET /api/lost-items/:id

// PROTECTED ROUTES (require authentication)
router.use(auth); // All routes below require authentication

// User's own items
router.get("/user/me", getMyLostItems); // GET /api/lost-items/user/me
router.get("/user/interactions", getMyInteractions); // GET /api/lost-items/user/interactions

// Create item (with multiple image upload)
router.post("/", uploadMultiple, createLostItem); // POST /api/lost-items

// Update item
router.put("/:id", uploadMultiple, updateLostItem); // PUT /api/lost-items/:id
router.patch("/:id/status", updateLostItemStatus); // PATCH /api/lost-items/:id/status

// Image management
router.post("/:id/images", uploadMultiple, addImages); // POST /api/lost-items/:id/images
router.patch("/:id/images/:imageId/primary", setPrimaryImage); // PATCH /api/lost-items/:id/images/:imageId/primary
router.delete("/:id/images/:imageId", removeImage); // DELETE /api/lost-items/:id/images/:imageId

// Social actions
router.post("/:id/like", likeLostItem); // POST /api/lost-items/:id/like
router.delete("/:id/like", unlikeLostItem); // DELETE /api/lost-items/:id/like
router.post("/:id/share", shareLostItem); // POST /api/lost-items/:id/share
router.post("/:id/flag", flagLostItem); // POST /api/lost-items/:id/flag

// Delete (soft delete)
router.delete("/:id", deleteLostItem); // DELETE /api/lost-items/:id

// ADMIN ROUTES
// Verify item (admin only)
router.patch(
  "/:id/verify",
  requireRole(["college_admin", "super_admin"]),
  verifyItem,
);

// Flagged items management (admin only)
router.get(
  "/admin/flagged",
  requireRole(["college_admin", "super_admin"]),
  getFlaggedItems,
);
router.patch(
  "/:id/resolve-flags",
  requireRole(["college_admin", "super_admin"]),
  resolveItemFlags,
);

// Permanent delete (admin only)
router.delete(
  "/:id/permanent",
  requireRole(["college_admin", "super_admin"]),
  permanentDeleteLostItem,
);

export default router;

// make image primary, remove image api needs some changes
