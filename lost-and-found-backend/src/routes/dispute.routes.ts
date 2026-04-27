import { Router } from "express";
import { auth, requireRole } from "../middleware/auth.middleware";
import disputeController from "../controller/dispute.controller";

const router = Router();

// Public Routes (None - All dispute routes require authentication)

// Protected Routes

/**
 * @route   POST /api/disputes
 * @desc    Create a new dispute
 * @access  Private (Students, College Admins, Super Admins)
 * @body    { itemId, reportedAgainst, type, title, description, evidence, metadata }
 */
router.post("/", auth, disputeController.createDispute);

/**
 * @route   GET /api/disputes
 * @desc    Get all disputes with filtering and pagination
 * @access  Private (Role-based: Users see their own, College Admins see college-wide, Super Admins see all)
 * @query   { status, type, priority, fromDate, toDate, page, limit, sortBy, sortOrder }
 */
router.get("/", auth, disputeController.getAllDisputes);

/**
 * @route   GET /api/disputes/my
 * @desc    Get disputes for current authenticated user
 * @access  Private
 * @query   { status, page, limit, sortBy, sortOrder }
 */
router.get("/my", auth, disputeController.getMyDisputes);

/**
 * @route   GET /api/disputes/statistics
 * @desc    Get dispute statistics and analytics
 * @access  Private (Role-based)
 * @query   { collegeId } - For super admins to filter by college
 */
router.get("/statistics", auth, disputeController.getDisputeStatistics);

/**
 * @route   GET /api/disputes/item/:itemId
 * @desc    Get all disputes for a specific item
 * @access  Private (Role-based: Item owner, college admins, super admins)
 * @param   { itemId } - Lost item ID
 */
router.get("/item/:itemId", auth, disputeController.getDisputesByItem);

/**
 * @route   GET /api/disputes/:id
 * @desc    Get single dispute by ID
 * @access  Private (Involved parties, college admins, super admins)
 * @param   { id } - Dispute ID
 */
router.get("/:id", auth, disputeController.getDisputeById);

/**
 * @route   PUT /api/disputes/:id/status
 * @desc    Update dispute status
 * @access  Private (Admins, or students can only close their own disputes)
 * @param   { id } - Dispute ID
 * @body    { status, reason }
 */
router.put("/:id/status", auth, disputeController.updateDisputeStatus);

/**
 * @route   POST /api/disputes/:id/messages
 * @desc    Add a message to dispute thread
 * @access  Private (Involved parties, admins)
 * @param   { id } - Dispute ID
 * @body    { content, attachments }
 */
router.post("/:id/messages", auth, disputeController.addDisputeMessage);

/**
 * @route   POST /api/disputes/:id/resolve
 * @desc    Resolve a dispute (Admin only)
 * @access  Private (College Admins, Super Admins)
 * @param   { id } - Dispute ID
 * @body    { resolutionType, description, actionTaken, updateItemStatus }
 */
router.post(
  "/:id/resolve",
  auth,
  requireRole(["college_admin", "super_admin"]),
  disputeController.resolveDispute,
);

/**
 * @route   POST /api/disputes/:id/escalate
 * @desc    Escalate dispute to super admin (College Admin only)
 * @access  Private (College Admins only)
 * @param   { id } - Dispute ID
 * @body    { reason }
 */
router.post(
  "/:id/escalate",
  auth,
  requireRole(["college_admin"]),
  disputeController.escalateDispute,
);

/**
 * @route   POST /api/disputes/:id/assign
 * @desc    Assign an admin to handle the dispute
 * @access  Private (College Admins, Super Admins)
 * @param   { id } - Dispute ID
 * @body    { adminId }
 */
router.post(
  "/:id/assign",
  auth,
  requireRole(["college_admin", "super_admin"]),
  disputeController.assignAdminToDispute,
);

/**
 * @route   POST /api/disputes/:id/evidence
 * @desc    Add evidence to a dispute
 * @access  Private (Involved parties, admins)
 * @param   { id } - Dispute ID
 * @body    { evidence: [{ url, type }] }
 */
router.post("/:id/evidence", auth, disputeController.addDisputeEvidence);

/**
 * @route   DELETE /api/disputes/:id/archive
 * @desc    Archive/delete a dispute (Super Admin only)
 * @access  Private (Super Admins only)
 * @param   { id } - Dispute ID
 */
router.delete(
  "/:id/archive",
  auth,
  requireRole(["super_admin"]),
  disputeController.archiveDispute,
);

export default router;
