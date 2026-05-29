import { Response, NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import { AuthRequest } from "../types/middlewareTypes";
import Notification from "../models/notification.modal";

//  Helper Functions

const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

//  Get User's Notifications

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const {
      page = "1",
      limit = "20",
      isRead,
      type,
      priority,
      fromDate,
      toDate,
    } = req.query;

    const query: any = {
      userId: new Types.ObjectId(userId),
    };

    // Filter by read status
    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    // Filter by notification type
    if (type) {
      const types = (type as string).split(",");
      query.type = { $in: types };
    }

    // Filter by priority
    if (priority) {
      const priorities = (priority as string).split(",");
      query.priority = { $in: priorities };
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate && !isNaN(Date.parse(fromDate as string))) {
        query.createdAt.$gte = new Date(fromDate as string);
      }
      if (toDate && !isNaN(Date.parse(toDate as string))) {
        query.createdAt.$lte = new Date(toDate as string);
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
    ]);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

//  Get Unread Count

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const unreadCount = await Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

//  Get Notification by ID

export const getNotificationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
      return;
    }

    const notification = await Notification.findOne({
      _id: new Types.ObjectId(id as string),
      userId: new Types.ObjectId(userId),
    }).lean();

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error: any) {
    console.error("Get notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

//  Mark Single Notification as Read

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id as string),
        userId: new Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true },
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found or already read",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error: any) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

//  Mark All Notifications as Read

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const result = await Notification.updateMany(
      {
        userId: new Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: {
        updatedCount: result.modifiedCount,
      },
    });
  } catch (error: any) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

//  Mark as Delivered

export const markAsDelivered = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id as string),
        userId: new Types.ObjectId(userId),
        isDelivered: false,
      },
      {
        $set: {
          isDelivered: true,
          deliveredAt: new Date(),
        },
      },
      { new: true },
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as delivered",
      data: { notification },
    });
  } catch (error: any) {
    console.error("Mark as delivered error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as delivered",
      error: error.message,
    });
  }
};

//  Mark as Clicked

export const markAsClicked = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id as string),
        userId: new Types.ObjectId(userId),
        isClicked: false,
      },
      {
        $set: {
          isClicked: true,
          clickedAt: new Date(),
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true },
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as clicked",
      data: { notification },
    });
  } catch (error: any) {
    console.error("Mark as clicked error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as clicked",
      error: error.message,
    });
  }
};

//  Delete Notification

export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
      return;
    }

    const notification = await Notification.findOneAndDelete({
      _id: new Types.ObjectId(id as string),
      userId: new Types.ObjectId(userId),
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

//  Delete All Read Notifications

export const deleteAllReadNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const result = await Notification.deleteMany({
      userId: new Types.ObjectId(userId),
      isRead: true,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} read notifications deleted`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error: any) {
    console.error("Delete read notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete read notifications",
      error: error.message,
    });
  }
};

//  Get Notification Statistics

export const getNotificationStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const stats = await Notification.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
        },
      },
      {
        $facet: {
          // Count by read status
          readStatus: [
            {
              $group: {
                _id: "$isRead",
                count: { $sum: 1 },
              },
            },
          ],
          // Count by type
          byType: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          // Count by priority
          byPriority: [
            {
              $group: {
                _id: "$priority",
                count: { $sum: 1 },
              },
            },
          ],
          // Recent trends (last 7 days)
          recentTrends: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const result = stats[0];
    const unreadCount =
      result?.readStatus?.find((s: any) => s._id === false)?.count || 0;
    const readCount =
      result?.readStatus?.find((s: any) => s._id === true)?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        total: unreadCount + readCount,
        unread: unreadCount,
        read: readCount,
        byType: result?.byType || [],
        byPriority: result?.byPriority || [],
        recentTrends: result?.recentTrends || [],
      },
    });
  } catch (error: any) {
    console.error("Get notification stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification statistics",
      error: error.message,
    });
  }
};
