import express from "express";
import {
  // Create
  addComment,

  // Read
  getComments,
  getReplies,
  getCommentById,
  getUserComments,

  // Update
  updateComment,
  pinComment,
  hideComment,

  // Delete
  deleteComment,
  permanentDeleteComment,

  // Social Actions
  likeComment,
  unlikeComment,
  flagComment,

  // Admin Actions
  getFlaggedComments,
  resolveCommentFlags,
} from "../controller/comment.controller";
import { auth, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

//  PUBLIC ROUTES
// Get comments for a lost item
router.get("/lost-items/:itemId/comments", getComments);

// Get replies for a comment
router.get("/comments/:commentId/replies", getReplies);

// Get single comment by ID
router.get("/comments/:commentId", getCommentById);

// Get comments by user
router.get("/users/:userId/comments", getUserComments);

//  PROTECTED ROUTES (require authentication)
router.use(auth); // All routes below require authentication

// Add comment to lost item
router.post("/lost-items/:itemId/comments", addComment);

// Update comment
router.put("/comments/:commentId", updateComment);

// Delete comment (soft delete)
router.delete("/comments/:commentId", deleteComment);

// Social actions
router.post("/comments/:commentId/like", likeComment);
router.delete("/comments/:commentId/like", unlikeComment);
router.post("/comments/:commentId/flag", flagComment);

//  ADMIN ROUTES
// Pin/unpin comment (admin only)
router.patch(
  "/comments/:commentId/pin",
  requireRole(["college_admin", "super_admin"]),
  pinComment,
);

// Hide/unhide comment (admin only)
router.patch(
  "/comments/:commentId/hide",
  requireRole(["college_admin", "super_admin"]),
  hideComment,
);

// Permanent delete (admin only)
router.delete(
  "/comments/:commentId/permanent",
  requireRole(["college_admin", "super_admin"]),
  permanentDeleteComment,
);

// Flagged comments management (admin only)
router.get(
  "/admin/comments/flagged",
  requireRole(["college_admin", "super_admin"]),
  getFlaggedComments,
);
router.patch(
  "/comments/:commentId/resolve-flags",
  requireRole(["college_admin", "super_admin"]),
  resolveCommentFlags,
);

export default router;
