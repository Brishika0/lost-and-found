// routes/notification.routes.ts
import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import {
  getMyNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  markAsDelivered,
  markAsClicked,
  deleteNotification,
  deleteAllReadNotifications,
  getNotificationStats,
} from "../controller/notification.controller";

const router = Router();

// All notification routes require authentication
router.use(auth);

//  GET Routes

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications with pagination and filters
 * @access  Private
 * @query   { page, limit, isRead, type, priority, fromDate, toDate }
 */
router.get("/", getMyNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get("/unread-count", getUnreadCount);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Private
 */
router.get("/stats", getNotificationStats);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get single notification by ID
 * @access  Private
 * @param   { id } - Notification ID
 */
router.get("/:id", getNotificationById);

//  PUT/POST Routes

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 * @param   { id } - Notification ID
 */
router.put("/:id/read", markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put("/read-all", markAllAsRead);

/**
 * @route   PUT /api/notifications/:id/delivered
 * @desc    Mark notification as delivered (for frontend tracking)
 * @access  Private
 * @param   { id } - Notification ID
 */
router.put("/:id/delivered", markAsDelivered);

/**
 * @route   PUT /api/notifications/:id/clicked
 * @desc    Mark notification as clicked (when user clicks on it)
 * @access  Private
 * @param   { id } - Notification ID
 */
router.put("/:id/clicked", markAsClicked);

//  DELETE Routes

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a single notification
 * @access  Private
 * @param   { id } - Notification ID
 */
router.delete("/:id", deleteNotification);

/**
 * @route   DELETE /api/notifications/read/all
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete("/read/all", deleteAllReadNotifications);

export default router;
