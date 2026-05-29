import { Response } from "express";
import mongoose from "mongoose";
import User from "../models/user.model";
import College from "../models/college.model";
import Comment from "../models/comment.model";
import { AuthRequest } from "../types/middlewareTypes";
import LostItem from "../models/lostItem.modal";
import Zone from "../models/campusZone.modal";
import Dispute from "../models/dispute.modal";
import Conversation from "../models/conversation.modal";

//  TYPES

interface DateRange {
  startDate: Date;
  endDate: Date;
}

//  HELPER FUNCTIONS

const getDateRange = (period: "day" | "week" | "month" | "year"): DateRange => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "day":
      startDate.setDate(startDate.getDate() - 1);
      break;
    case "week":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
};

//  DASHBOARD STATS

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/stats/dashboard
 * @access  Private (Admin or Super Admin)
 */
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";

    let filter: any = {};

    // Apply college filter for non-super admin
    if (!isSuperAdmin && userCollegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(userCollegeId);
    }

    // Get all stats in parallel
    const [
      totalStudents,
      totalAdmins,
      totalLostItems,
      totalFoundItems,
      totalReturnedItems,
      activeItems,
      totalZones,
      totalChats,
      pendingDisputes,
      totalComments,
      recentItems,
      recentUsers,
    ] = await Promise.all([
      // Student count
      User.countDocuments({ ...filter, role: "student" }),

      // Admin count
      User.countDocuments({ ...filter, role: "college_admin" }),

      // Lost items
      LostItem.countDocuments({ ...filter, status: "lost", isActive: true }),

      // Found items
      LostItem.countDocuments({ ...filter, status: "found", isActive: true }),

      // Returned items
      LostItem.countDocuments({
        ...filter,
        status: "returned",
        isActive: true,
      }),

      // Active items (lost or found)
      LostItem.countDocuments({
        ...filter,
        status: { $in: ["lost", "found"] },
        isActive: true,
      }),

      // Zones count
      Zone.countDocuments(filter),

      // Chats count
      Conversation.countDocuments(filter),

      // Pending disputes
      Dispute.countDocuments({
        ...(filter.collegeId ? { collegeId: filter.collegeId } : {}),
        status: { $in: ["open", "under_review"] },
      }),

      // Comments count
      Comment.countDocuments(),

      // Recent items (last 5)
      LostItem.find(filter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select("itemName status createdAt images")
        .lean(),

      // Recent users (last 5)
      User.find(filter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role avatar createdAt")
        .lean(),
    ]);

    // Calculate resolution rate
    const totalResolved = totalReturnedItems;
    const totalItems = totalLostItems + totalFoundItems + totalReturnedItems;
    const resolutionRate =
      totalItems > 0 ? Math.round((totalResolved / totalItems) * 100) : 0;

    const stats = {
      overview: {
        totalStudents,
        totalAdmins,
        totalUsers: totalStudents + totalAdmins,
        totalItems: totalItems,
        totalZones,
        totalChats,
        pendingDisputes,
        totalComments,
      },
      items: {
        lost: totalLostItems,
        found: totalFoundItems,
        returned: totalReturnedItems,
        active: activeItems,
        resolutionRate: `${resolutionRate}%`,
      },
      recentItems,
      recentUsers,
    };

    // Add college-specific info for non-super admin
    if (!isSuperAdmin && userCollegeId) {
      const college = await College.findById(userCollegeId).select(
        "name shortName logo",
      );
      (stats as any).college = college;
    }

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

//  ITEMS STATS

/**
 * @desc    Get items statistics with filters
 * @route   GET /api/stats/items
 * @access  Private (Admin or Super Admin)
 */
export const getItemsStats = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";
    const { period = "month", collegeId, category, status } = req.query;

    let filter: any = {};

    // Apply college filter
    if (isSuperAdmin && collegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(collegeId as string);
    } else if (!isSuperAdmin && userCollegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(userCollegeId);
    }

    // Apply category filter
    if (category) {
      filter.category = category;
    }

    // Apply status filter
    if (status) {
      filter.status = status;
    }

    const { startDate, endDate } = getDateRange(
      period as "day" | "week" | "month" | "year",
    );
    filter.createdAt = { $gte: startDate, $lte: endDate };

    // Get items by status
    const itemsByStatus = await LostItem.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get items by category
    const itemsByCategory = await LostItem.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get items by zone
    const itemsByZone = await LostItem.aggregate([
      { $match: { ...filter, zoneId: { $exists: true, $ne: null } } },
      {
        $lookup: {
          from: "zones",
          localField: "zoneId",
          foreignField: "_id",
          as: "zone",
        },
      },
      { $unwind: { path: "$zone", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$zone.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Daily trend
    const dailyTrend = await LostItem.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const stats = {
      period,
      total: await LostItem.countDocuments(filter),
      itemsByStatus,
      itemsByCategory,
      itemsByZone,
      dailyTrend,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Items stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

//  USERS STATS

/**
 * @desc    Get users statistics
 * @route   GET /api/stats/users
 * @access  Private (Admin or Super Admin)
 */
export const getUsersStats = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";
    const { collegeId } = req.query;

    let filter: any = {};

    // Apply college filter
    if (isSuperAdmin && collegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(collegeId as string);
    } else if (!isSuperAdmin && userCollegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(userCollegeId);
    }

    // Users by role
    const usersByRole = await User.aggregate([
      { $match: filter },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Active vs inactive
    const activeUsers = await User.countDocuments({
      ...filter,
      isActive: true,
    });
    const inactiveUsers = await User.countDocuments({
      ...filter,
      isActive: false,
    });

    // Verified vs unverified emails
    const verifiedUsers = await User.countDocuments({
      ...filter,
      isEmailVerified: true,
    });
    const unverifiedUsers = await User.countDocuments({
      ...filter,
      isEmailVerified: false,
    });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await User.countDocuments({
      ...filter,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Users by college (super admin only)
    let usersByCollege = null;
    if (isSuperAdmin) {
      usersByCollege = await User.aggregate([
        { $match: { role: { $in: ["student", "college_admin"] } } },
        {
          $lookup: {
            from: "colleges",
            localField: "collegeId",
            foreignField: "_id",
            as: "college",
          },
        },
        { $unwind: { path: "$college", preserveNullAndEmptyArrays: true } },
        { $group: { _id: "$college.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    }

    // Active users by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeByDay = await User.aggregate([
      { $match: { ...filter, lastActive: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastActive" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      overview: {
        totalUsers: await User.countDocuments(filter),
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        unverifiedUsers,
        recentRegistrations,
      },
      usersByRole,
      usersByCollege,
      activeByDay,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Users stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

//  ZONES STATS

/**
 * @desc    Get zones statistics
 * @route   GET /api/stats/zones
 * @access  Private (Admin or Super Admin)
 */
export const getZonesStats = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";
    const { collegeId } = req.query;

    let filter: any = {};

    // Apply college filter
    if (isSuperAdmin && collegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(collegeId as string);
    } else if (!isSuperAdmin && userCollegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(userCollegeId);
    }

    // Zones by type
    const zonesByType = await Zone.aggregate([
      { $match: filter },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Active vs inactive zones
    const activeZones = await Zone.countDocuments({
      ...filter,
      isActive: true,
    });
    const inactiveZones = await Zone.countDocuments({
      ...filter,
      isActive: false,
    });

    // Indoor vs outdoor
    const indoorZones = await Zone.countDocuments({
      ...filter,
      isIndoor: true,
    });
    const outdoorZones = await Zone.countDocuments({
      ...filter,
      isIndoor: false,
    });

    // Zones with items count
    const zonesWithItems = await LostItem.aggregate([
      { $match: { zoneId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$zoneId",
          itemCount: { $sum: 1 },
        },
      },
      { $sort: { itemCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "zones",
          localField: "_id",
          foreignField: "_id",
          as: "zone",
        },
      },
      { $unwind: "$zone" },
      {
        $project: {
          zoneName: "$zone.name",
          zoneType: "$zone.type",
          itemCount: 1,
        },
      },
    ]);

    const stats = {
      overview: {
        totalZones: await Zone.countDocuments(filter),
        activeZones,
        inactiveZones,
        indoorZones,
        outdoorZones,
      },
      zonesByType,
      zonesWithItems,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Zones stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

//  DISPUTES STATS

/**
 * @desc    Get disputes statistics
 * @route   GET /api/stats/disputes
 * @access  Private (Admin or Super Admin)
 */
export const getDisputesStats = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";
    const { collegeId } = req.query;

    let filter: any = {};

    // Apply college filter
    if (isSuperAdmin && collegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(collegeId as string);
    } else if (!isSuperAdmin && userCollegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(userCollegeId);
    }

    // Disputes by status
    const disputesByStatus = await Dispute.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Disputes by type
    const disputesByType = await Dispute.aggregate([
      { $match: filter },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Disputes by priority
    const disputesByPriority = await Dispute.aggregate([
      { $match: filter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Average resolution time
    const resolutionTimeResult = await Dispute.aggregate([
      {
        $match: {
          ...filter,
          status: "resolved",
          "resolution.resolvedAt": { $exists: true },
        },
      },
      {
        $addFields: {
          resolutionTimeHours: {
            $divide: [
              { $subtract: ["$resolution.resolvedAt", "$createdAt"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$resolutionTimeHours" },
          fastest: { $min: "$resolutionTimeHours" },
          slowest: { $max: "$resolutionTimeHours" },
        },
      },
    ]);

    const stats = {
      overview: {
        totalDisputes: await Dispute.countDocuments(filter),
        openDisputes: await Dispute.countDocuments({
          ...filter,
          status: "open",
        }),
        underReview: await Dispute.countDocuments({
          ...filter,
          status: "under_review",
        }),
        escalated: await Dispute.countDocuments({
          ...filter,
          status: "escalated",
        }),
        resolved: await Dispute.countDocuments({
          ...filter,
          status: "resolved",
        }),
      },
      disputesByStatus,
      disputesByType,
      disputesByPriority,
      resolutionTime: resolutionTimeResult[0] || null,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Disputes stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

//  CHATS STATS

/**
 * @desc    Get chats statistics
 * @route   GET /api/stats/chats
 * @access  Private (Admin or Super Admin)
 */
export const getChatsStats = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";
    const { collegeId } = req.query;

    let filter: any = {};

    // Apply college filter
    if (isSuperAdmin && collegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(collegeId as string);
    } else if (!isSuperAdmin && userCollegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(userCollegeId);
    }

    // Total chats
    const totalChats = await Conversation.countDocuments(filter);

    // Active chats
    const activeChats = await Conversation.countDocuments({
      ...filter,
      status: "active",
    });

    // Pending requests
    const pendingRequests = await Conversation.countDocuments({
      ...filter,
      status: "pending",
    });

    // Chats by item
    const chatsByItem = await Conversation.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "lostitems",
          localField: "itemId",
          foreignField: "_id",
          as: "item",
        },
      },
      { $unwind: "$item" },
      { $group: { _id: "$item.itemName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Messages trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const messagesTrend = await Conversation.aggregate([
      { $match: filter },
      { $unwind: "$messages" },
      { $match: { "messages.createdAt": { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$messages.createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const stats = {
      overview: {
        totalChats,
        activeChats,
        pendingRequests,
      },
      chatsByItem,
      messagesTrend,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Chats stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

//  COLLEGE STATS (Super Admin Only)

/**
 * @desc    Get all colleges statistics (Super Admin only)
 * @route   GET /api/stats/colleges
 * @access  Private (Super Admin only)
 */
export const getAllCollegesStats = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin only.",
      });
    }

    const colleges = await College.find({ isActive: true }).select(
      "_id name shortName domain",
    );

    const collegeStats = await Promise.all(
      colleges.map(async (college) => {
        const [
          totalStudents,
          totalAdmins,
          totalLostItems,
          totalFoundItems,
          totalReturnedItems,
          totalZones,
          totalChats,
        ] = await Promise.all([
          User.countDocuments({ collegeId: college._id, role: "student" }),
          User.countDocuments({
            collegeId: college._id,
            role: "college_admin",
          }),
          LostItem.countDocuments({
            collegeId: college._id,
            status: "lost",
            isActive: true,
          }),
          LostItem.countDocuments({
            collegeId: college._id,
            status: "found",
            isActive: true,
          }),
          LostItem.countDocuments({
            collegeId: college._id,
            status: "returned",
            isActive: true,
          }),
          Zone.countDocuments({ collegeId: college._id, isActive: true }),
          Conversation.countDocuments({ collegeId: college._id }),
        ]);

        const totalItems =
          totalLostItems + totalFoundItems + totalReturnedItems;
        const resolutionRate =
          totalItems > 0
            ? Math.round((totalReturnedItems / totalItems) * 100)
            : 0;

        return {
          collegeId: college._id,
          collegeName: college.name,
          shortName: college.shortName,
          domain: college.domain,
          stats: {
            users: {
              students: totalStudents,
              admins: totalAdmins,
              total: totalStudents + totalAdmins,
            },
            items: {
              lost: totalLostItems,
              found: totalFoundItems,
              returned: totalReturnedItems,
              total: totalItems,
              resolutionRate: `${resolutionRate}%`,
            },
            zones: totalZones,
            chats: totalChats,
          },
        };
      }),
    );

    // Overall summary
    const summary = {
      totalColleges: colleges.length,
      totalStudents: collegeStats.reduce(
        (acc, curr) => acc + curr.stats.users.students,
        0,
      ),
      totalAdmins: collegeStats.reduce(
        (acc, curr) => acc + curr.stats.users.admins,
        0,
      ),
      totalItems: collegeStats.reduce(
        (acc, curr) => acc + curr.stats.items.total,
        0,
      ),
      totalZones: collegeStats.reduce((acc, curr) => acc + curr.stats.zones, 0),
      totalChats: collegeStats.reduce((acc, curr) => acc + curr.stats.chats, 0),
    };

    return res.status(200).json({
      success: true,
      data: {
        colleges: collegeStats,
        summary,
      },
    });
  } catch (error: any) {
    console.error("Colleges stats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

//  EXPORT ANALYTICS

/**
 * @desc    Generate and export analytics report
 * @route   GET /api/stats/export
 * @access  Private (Super Admin only)
 */
export const exportAnalytics = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin only.",
      });
    }

    const { collegeId, period = "month" } = req.query;

    let filter: any = {};
    if (collegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(collegeId as string);
    }

    const { startDate, endDate } = getDateRange(
      period as "day" | "week" | "month" | "year",
    );

    const [itemsData, usersData, zonesData, disputesData] = await Promise.all([
      LostItem.aggregate([
        {
          $match: { ...filter, createdAt: { $gte: startDate, $lte: endDate } },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        {
          $match: { ...filter, createdAt: { $gte: startDate, $lte: endDate } },
        },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Zone.aggregate([
        {
          $match: { ...filter, createdAt: { $gte: startDate, $lte: endDate } },
        },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Dispute.aggregate([
        {
          $match: { ...filter, createdAt: { $gte: startDate, $lte: endDate } },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      period,
      dateRange: { startDate, endDate },
      data: {
        items: itemsData,
        users: usersData,
        zones: zonesData,
        disputes: disputesData,
      },
    };

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Export analytics error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
