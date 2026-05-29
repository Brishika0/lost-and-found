import { Response, NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import Dispute, {
  DisputeType,
  DisputeStatus,
  ResolutionType,
  IDispute,
} from "../models/dispute.modal";
import LostItem from "../models/lostItem.modal";
import Notification from "../models/notification.modal";
import User, { IUser } from "../models/user.model";
import { AuthRequest } from "../types/middlewareTypes";
import {
  sendEmail,
  emailTemplates,
  sendDisputeEmail,
} from "../services/email.service";

//  Type Definitions

interface CreateDisputeBody {
  itemId: string;
  reportedAgainst: string;
  type: DisputeType;
  title: string;
  description: string;
  evidence?: Array<{
    url: string;
    type: "image" | "document" | "screenshot";
  }>;
  metadata?: Map<string, any>;
}

interface UpdateStatusBody {
  status: DisputeStatus;
  reason?: string;
}

interface AddMessageBody {
  content: string;
  attachments?: string[];
}

interface ResolveDisputeBody {
  resolutionType: ResolutionType;
  description: string;
  actionTaken?: string;
  updateItemStatus?: "claimed" | "returned";
}

interface EscalateDisputeBody {
  reason: string;
}

interface AssignAdminBody {
  adminId: string;
}

interface AddEvidenceBody {
  evidence: Array<{
    url: string;
    type: "image" | "document" | "screenshot";
  }>;
}

interface QueryParams {
  status?: string;
  type?: string;
  priority?: string;
  fromDate?: string;
  toDate?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  collegeId?: string;
}

//  Validation Functions

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

/**
 * Validate evidence files
 * Validates file URLs, types, and optional size/format checks
 */
const validateEvidence = (
  evidence: any[],
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!evidence || evidence.length === 0) {
    return { isValid: true, errors: [] };
  }

  if (!Array.isArray(evidence)) {
    return { isValid: false, errors: ["Evidence must be an array"] };
  }

  const validTypes = ["image", "document", "screenshot"];
  const maxEvidenceItems = 10;

  if (evidence.length > maxEvidenceItems) {
    errors.push(`Maximum ${maxEvidenceItems} evidence items allowed`);
  }

  for (let i = 0; i < evidence.length; i++) {
    const item = evidence[i];

    if (!item.url) {
      errors.push(`Evidence item ${i + 1}: URL is required`);
      continue;
    }

    // Validate URL format
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(item.url)) {
      errors.push(`Evidence item ${i + 1}: Invalid URL format`);
    }

    // Validate type
    if (!item.type) {
      errors.push(`Evidence item ${i + 1}: Type is required`);
    } else if (!validTypes.includes(item.type)) {
      errors.push(
        `Evidence item ${i + 1}: Type must be one of: ${validTypes.join(", ")}`,
      );
    }

    // Optional: Validate file extension matches type
    if (item.url && item.type === "image") {
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const hasValidExtension = imageExtensions.some((ext) =>
        item.url.toLowerCase().includes(ext),
      );
      if (!hasValidExtension) {
        errors.push(
          `Evidence item ${i + 1}: Image URL should end with ${imageExtensions.join(", ")}`,
        );
      }
    }

    // Optional: Check for suspicious file types
    const suspiciousExtensions = [".exe", ".bat", ".sh", ".php", ".asp"];
    if (
      suspiciousExtensions.some((ext) => item.url.toLowerCase().includes(ext))
    ) {
      errors.push(`Evidence item ${i + 1}: Suspicious file type not allowed`);
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate dispute type
 */
const validateDisputeType = (type: string): type is DisputeType => {
  const validTypes: DisputeType[] = [
    "wrongful_claim",
    "item_damage",
    "fake_item",
    "harassment",
    "communication_issue",
    "other",
  ];
  return validTypes.includes(type as DisputeType);
};

/**
 * Validate dispute status
 */
const validateDisputeStatus = (status: string): status is DisputeStatus => {
  const validStatuses: DisputeStatus[] = [
    "open",
    "under_review",
    "escalated",
    "resolved",
    "closed",
  ];
  return validStatuses.includes(status as DisputeStatus);
};

/**
 * Validate resolution type
 */
const validateResolutionType = (type: string): type is ResolutionType => {
  const validTypes: ResolutionType[] = [
    "resolved_in_favor_of_reporter",
    "resolved_in_favor_of_other",
    "mutual_agreement",
    "no_action",
    "other",
  ];
  return validTypes.includes(type as ResolutionType);
};

/**
 * Validate priority
 */
const validatePriority = (
  priority: string,
): priority is "low" | "medium" | "high" | "urgent" => {
  const validPriorities = ["low", "medium", "high", "urgent"];
  return validPriorities.includes(priority);
};

//  Helper Functions

/**
 * Check if user has permission to access a dispute
 */
const hasDisputePermission = async (
  dispute: IDispute,
  userId: string,
  userRole: string,
  userCollegeId?: string,
): Promise<boolean> => {
  // Super admin can access all
  if (userRole === "super_admin") return true;

  // College admin can access disputes within their college
  if (userRole === "college_admin") {
    const disputeCollegeId = dispute.collegeId?.toString();
    const adminCollegeId = userCollegeId?.toString();
    return disputeCollegeId === adminCollegeId;
  }

  // Regular users can only access disputes they're involved in

  // Helper function to get ID from populated or unpopulated field
  const getId = (field: any): string => {
    if (!field) return "";
    // If field has _id property (populated), return that
    if (field._id) return field._id.toString();
    // Otherwise, assume it's already an ObjectId or string
    return field.toString();
  };

  const reporterId = getId(dispute.reportedBy);
  const againstId = getId(dispute.reportedAgainst);
  const currentUserId = userId?.toString();

  console.log("Fixed permission check:", {
    reporterId,
    againstId,
    currentUserId,
    isReporter: reporterId === currentUserId,
    isReportedAgainst: againstId === currentUserId,
  });

  return reporterId === currentUserId || againstId === currentUserId;
};

/**
 * Create notification for dispute events
 */
const createDisputeNotification = async (
  userId: string,
  disputeId: string,
  title: string,
  message: string,
  type: string,
  data: any = {},
): Promise<void> => {
  await Notification.create({
    userId: new Types.ObjectId(userId),
    type: "dispute_update",
    title,
    message,
    priority: "medium",
    data: {
      disputeId: new Types.ObjectId(disputeId),
      ...data,
    },
  });
};

/**
 * Send email notification for dispute events
 */
const sendDisputeEmailNotification = async (
  user: IUser,
  template: keyof typeof emailTemplates,
  params: any,
): Promise<void> => {
  try {
    await sendDisputeEmail(user.email, user.name, template, params);
  } catch (error) {
    console.error("Failed to send dispute email:", error);
    // Don't throw - email failure shouldn't break the main flow
  }
};

/**
 * Determine priority based on dispute type and description
 */
const determinePriority = (
  type: DisputeType,
  description: string,
): "low" | "medium" | "high" | "urgent" => {
  if (type === "harassment") return "urgent";
  if (type === "fake_item" || type === "item_damage") return "high";
  if (type === "wrongful_claim") return "medium";

  // Check for urgent keywords in description
  const urgentKeywords = [
    "urgent",
    "emergency",
    "immediate",
    "asap",
    "danger",
    "threat",
  ];
  const lowerDesc = description.toLowerCase();
  if (urgentKeywords.some((keyword) => lowerDesc.includes(keyword))) {
    return "urgent";
  }

  return "low";
};

//  Controller Functions

/**
 * 1. Create Dispute
 */
export const createDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = req.body as CreateDisputeBody;
    const {
      itemId,
      reportedAgainst,
      type,
      title,
      description,
      evidence,
      metadata,
    } = body;

    const userId = req.user!._id;

    // Validate required fields
    if (!itemId || !reportedAgainst || !type || !title || !description) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: itemId, reportedAgainst, type, title, description",
      });
      return;
    }

    // Validate IDs
    if (!isValidObjectId(itemId)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
      return;
    }

    if (!isValidObjectId(reportedAgainst)) {
      res.status(400).json({
        success: false,
        message: "Invalid reported against user ID format",
      });
      return;
    }

    // Validate dispute type
    if (!validateDisputeType(type)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid dispute type. Must be one of: wrongful_claim, item_damage, fake_item, harassment, communication_issue, other",
      });
      return;
    }

    // Validate title length
    if (title.length < 5 || title.length > 200) {
      res.status(400).json({
        success: false,
        message: "Title must be between 5 and 200 characters",
      });
      return;
    }

    // Validate description length
    if (description.length < 10 || description.length > 5000) {
      res.status(400).json({
        success: false,
        message: "Description must be between 10 and 5000 characters",
      });
      return;
    }

    // Validate evidence if provided
    if (evidence) {
      const validation = validateEvidence(evidence);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Evidence validation failed",
          errors: validation.errors,
        });
        return;
      }
    }

    // Get the item to verify it exists and get collegeId
    const item = await LostItem.findById(itemId).session(session);
    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    // Verify reportedAgainst user exists
    const reportedUser = await User.findById(reportedAgainst).session(session);
    if (!reportedUser) {
      res.status(404).json({
        success: false,
        message: "Reported user not found",
      });
      return;
    }

    // Prevent self-reporting
    if (userId === reportedAgainst) {
      res.status(400).json({
        success: false,
        message: "You cannot file a dispute against yourself",
      });
      return;
    }

    // Check if there's already an open dispute for the same item and parties
    const existingDispute = await Dispute.findOne({
      itemId: new Types.ObjectId(itemId),
      reportedBy: new Types.ObjectId(userId),
      reportedAgainst: new Types.ObjectId(reportedAgainst),
      status: { $in: ["open", "under_review", "escalated"] },
    }).session(session);

    if (existingDispute) {
      res.status(409).json({
        success: false,
        message: "An open dispute already exists for this item and parties",
        disputeId: existingDispute._id,
      });
      return;
    }

    // Get the current user for email
    const currentUser = await User.findById(userId).session(session);
    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Create the dispute
    const dispute = new Dispute({
      itemId: new Types.ObjectId(itemId),
      collegeId: item.collegeId,
      reportedBy: new Types.ObjectId(userId),
      reportedAgainst: new Types.ObjectId(reportedAgainst),
      type,
      title,
      description,
      evidence: evidence || [],
      metadata: metadata || new Map(),
      status: "open",
      priority: determinePriority(type, description),
    });

    await dispute.save({ session });

    // Get college admins for notifications
    const collegeAdmins = await User.find({
      role: "college_admin",
      collegeId: item.collegeId,
      isActive: true,
    })
      .select("_id email name")
      .session(session);

    // Send email notifications
    await sendDisputeEmailNotification(reportedUser, "disputeFiled", {
      disputeTitle: title,
      itemName: item.itemName,
      disputeId: dispute._id.toString(),
    });

    // Send email to college admins
    for (const admin of collegeAdmins) {
      await sendDisputeEmailNotification(admin as IUser, "adminAlert", {
        alertType: "New Dispute Filed",
        details: `A new dispute "${title}" has been filed regarding item "${item.itemName}" by ${currentUser.name}`,
        actionUrl: `/admin/disputes/${dispute._id}`,
      });
    }

    // Create in-app notifications
    await createDisputeNotification(
      reportedAgainst,
      dispute._id.toString(),
      "Dispute Filed Against You",
      `A dispute has been filed against you regarding item "${item.itemName}". Please check the details.`,
      "dispute_update",
      { itemName: item.itemName },
    );

    for (const admin of collegeAdmins) {
      await createDisputeNotification(
        admin._id.toString(),
        dispute._id.toString(),
        "New Dispute Filed",
        `A new dispute has been filed in your college regarding item "${item.itemName}"`,
        "dispute_update",
        { itemName: item.itemName, collegeId: item.collegeId },
      );
    }

    await session.commitTransaction();

    const populatedDispute = await Dispute.findById(dispute._id)
      .populate("reportedBy", "name email avatar")
      .populate("reportedAgainst", "name email avatar")
      .populate("itemId", "itemName images");

    res.status(201).json({
      success: true,
      message: "Dispute filed successfully",
      data: { dispute: populatedDispute },
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Create dispute error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create dispute",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * 2. Get All Disputes (with filtering)
 */
export const getAllDisputes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const queryParams = req.query as QueryParams;
    const {
      status,
      type,
      priority,
      fromDate,
      toDate,
      page = "1",
      limit = "20",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const user = req.user!;
    const query: any = {};

    // Role-based filtering
    if (user.role === "super_admin") {
      // Super admin sees all disputes
    } else if (user.role === "college_admin") {
      if (!user.collegeId) {
        res.status(403).json({
          success: false,
          message: "College admin not associated with any college",
        });
        return;
      }
      query.collegeId = new Types.ObjectId(user.collegeId);
    } else {
      query.$or = [
        { reportedBy: new Types.ObjectId(user._id) },
        { reportedAgainst: new Types.ObjectId(user._id) },
      ];
    }

    // Apply filters
    if (status) {
      const statuses = status.split(",");
      const validStatuses = statuses.filter((s) => validateDisputeStatus(s));
      if (validStatuses.length) {
        query.status = { $in: validStatuses };
      }
    }

    if (type) {
      const types = type.split(",");
      const validTypes = types.filter((t) => validateDisputeType(t));
      if (validTypes.length) {
        query.type = { $in: validTypes };
      }
    }

    if (priority) {
      const priorities = priority.split(",");
      const validPriorities = priorities.filter((p) => validatePriority(p));
      if (validPriorities.length) {
        query.priority = { $in: validPriorities };
      }
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate && !isNaN(Date.parse(fromDate))) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate && !isNaN(Date.parse(toDate))) {
        query.createdAt.$lte = new Date(toDate);
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const [disputes, total] = await Promise.all([
      Dispute.find(query)
        .populate("reportedBy", "name email avatar")
        .populate("reportedAgainst", "name email avatar")
        .populate("assignedAdmin", "name email avatar")
        .populate("itemId", "itemName images status")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Dispute.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        disputes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("Get all disputes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch disputes",
      error: error.message,
    });
  }
};

/**
 * 3. Get Single Dispute by ID
 */
export const getDisputeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid dispute ID format",
      });
      return;
    }

    const dispute = await Dispute.findById(id)
      .populate("reportedBy", "name email avatar collegeId")
      .populate("reportedAgainst", "name email avatar collegeId")
      .populate("assignedAdmin", "name email avatar")
      .populate("itemId", "itemName description images status reportedBy")
      .populate("messages.userId", "name email avatar role");

    if (!dispute) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    // Check permission
    const hasPermission = await hasDisputePermission(
      dispute,
      user._id,
      user.role,
      user.collegeId,
    );

    console.log("User role:", user.role);
    console.log("User ID:", user._id);
    console.log("Dispute reportedBy:", dispute.reportedBy._id);
    console.log("Dispute reportedAgainst:", dispute.reportedAgainst._id);

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to view this dispute",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { dispute },
    });
  } catch (error: any) {
    console.error("Get dispute by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dispute",
      error: error.message,
    });
  }
};

/**
 * 4. Update Dispute Status
 */
export const updateDisputeStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as UpdateStatusBody;
    const { status, reason } = body;
    const user = req.user!;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid dispute ID format",
      });
      return;
    }

    if (!validateDisputeStatus(status)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: open, under_review, escalated, resolved, closed",
      });
      return;
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    // Check permission
    const hasPermission = await hasDisputePermission(
      dispute,
      user._id,
      user.role,
      user.collegeId,
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to update this dispute",
      });
      return;
    }

    // Regular users can only close their own disputes
    if (user.role === "student" && status !== "closed") {
      res.status(403).json({
        success: false,
        message: "Students can only close disputes",
      });
      return;
    }

    const oldStatus = dispute.status;
    dispute.status = status;

    // Add status change message
    if (reason) {
      dispute.messages.push({
        userId: new Types.ObjectId(user._id),
        content: `Status changed from ${oldStatus} to ${status}. Reason: ${reason}`,
        isAdmin: user.role !== "student",
        createdAt: new Date(),
      });
    }

    await dispute.save();

    // Get involved users for notifications
    const reportedByUser = await User.findById(dispute.reportedBy);
    const reportedAgainstUser = await User.findById(dispute.reportedAgainst);

    // Send email notifications
    const notificationMessage = `Dispute status changed from ${oldStatus} to ${status}`;

    if (reportedByUser && reportedByUser._id.toString() !== user._id) {
      await sendDisputeEmailNotification(reportedByUser, "disputeUpdate", {
        disputeTitle: dispute.title,
        status,
        message: reason || notificationMessage,
        disputeId: dispute._id.toString(),
      });
    }

    if (
      reportedAgainstUser &&
      reportedAgainstUser._id.toString() !== user._id
    ) {
      await sendDisputeEmailNotification(reportedAgainstUser, "disputeUpdate", {
        disputeTitle: dispute.title,
        status,
        message: reason || notificationMessage,
        disputeId: dispute._id.toString(),
      });
    }

    // Create in-app notifications
    const parties = [
      dispute.reportedBy.toString(),
      dispute.reportedAgainst.toString(),
    ];
    for (const partyId of parties) {
      if (partyId !== user._id) {
        await createDisputeNotification(
          partyId,
          dispute._id.toString(),
          "Dispute Status Updated",
          notificationMessage,
          "dispute_update",
          { status, oldStatus, reason },
        );
      }
    }

    const updatedDispute = await Dispute.findById(id)
      .populate("reportedBy", "name email avatar")
      .populate("reportedAgainst", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Dispute status updated successfully",
      data: { dispute: updatedDispute },
    });
  } catch (error: any) {
    console.error("Update dispute status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update dispute status",
      error: error.message,
    });
  }
};

/**
 * 5. Add Message to Dispute
 */
export const addDisputeMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as AddMessageBody;
    const { content, attachments } = body;
    const user = req.user!;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid dispute ID format",
      });
      return;
    }

    if (!content || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Message content is required",
      });
      return;
    }

    if (content.length > 5000) {
      res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters",
      });
      return;
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    // Check permission
    const hasPermission = await hasDisputePermission(
      dispute,
      user._id,
      user.role,
      user.collegeId,
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to add messages to this dispute",
      });
      return;
    }

    // Add message
    dispute.messages.push({
      userId: new Types.ObjectId(user._id),
      content: content.trim(),
      isAdmin: user.role !== "student",
      attachments: attachments || [],
      createdAt: new Date(),
    });

    await dispute.save();

    // Get the current user for email
    const currentUser = await User.findById(user._id);

    // Send email notifications to other parties
    const parties = [
      dispute.reportedBy.toString(),
      dispute.reportedAgainst.toString(),
    ];
    if (dispute.assignedAdmin) {
      parties.push(dispute.assignedAdmin.toString());
    }

    const uniqueParties = [...new Set(parties)];

    for (const partyId of uniqueParties) {
      if (partyId !== user._id) {
        const partyUser = await User.findById(partyId);
        if (partyUser) {
          await sendDisputeEmailNotification(partyUser, "newMessageInDispute", {
            disputeTitle: dispute.title,
            senderName: currentUser?.name || "Someone",
            messagePreview: content.substring(0, 100),
            disputeId: dispute._id.toString(),
          });
        }

        await createDisputeNotification(
          partyId,
          dispute._id.toString(),
          "New Message in Dispute",
          `New message added to dispute: "${dispute.title}"`,
          "dispute_update",
          { messagePreview: content.substring(0, 100) },
        );
      }
    }

    const updatedDispute = await Dispute.findById(id).populate(
      "messages.userId",
      "name email avatar role",
    );

    res.status(200).json({
      success: true,
      message: "Message added successfully",
      data: { messages: updatedDispute?.messages },
    });
  } catch (error: any) {
    console.error("Add dispute message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add message",
      error: error.message,
    });
  }
};

/**
 * 6. Resolve Dispute
 */
export const resolveDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const body = req.body as ResolveDisputeBody;
    const { resolutionType, description, actionTaken, updateItemStatus } = body;
    const user = req.user!;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid dispute ID format",
      });
      return;
    }

    if (!validateResolutionType(resolutionType)) {
      res.status(400).json({
        success: false,
        message:
          "Invalid resolution type. Must be one of: resolved_in_favor_of_reporter, resolved_in_favor_of_other, mutual_agreement, no_action, other",
      });
      return;
    }

    if (!description || description.trim().length < 10) {
      res.status(400).json({
        success: false,
        message:
          "Resolution description is required and must be at least 10 characters",
      });
      return;
    }

    const dispute = await Dispute.findById(id).session(session);
    if (!dispute) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    // Check permission (only admins can resolve)
    if (user.role !== "super_admin" && user.role !== "college_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can resolve disputes",
      });
      return;
    }

    // College admin can only resolve disputes in their college
    if (
      user.role === "college_admin" &&
      dispute.collegeId.toString() !== user.collegeId
    ) {
      res.status(403).json({
        success: false,
        message: "You can only resolve disputes in your college",
      });
      return;
    }

    // Resolve the dispute
    dispute.status = "resolved";
    dispute.resolution = {
      type: resolutionType,
      description,
      resolvedBy: new Types.ObjectId(user._id),
      resolvedAt: new Date(),
      actionTaken: actionTaken || undefined,
    };

    await dispute.save({ session });

    // Update item status if specified
    if (updateItemStatus) {
      const item = await LostItem.findById(dispute.itemId).session(session);
      if (item) {
        if (updateItemStatus === "claimed") {
          item.status = "claimed";
          item.claimedBy = dispute.reportedBy;
          item.dateClaimed = new Date();
          await item.save({ session });
        } else if (updateItemStatus === "returned") {
          item.status = "returned";
          item.returnedTo = dispute.reportedAgainst;
          item.dateReturned = new Date();
          await item.save({ session });
        }
      }
    }

    // Get involved users for email notifications
    const reportedByUser = await User.findById(dispute.reportedBy).session(
      session,
    );
    const reportedAgainstUser = await User.findById(
      dispute.reportedAgainst,
    ).session(session);
    const resolvingAdmin = await User.findById(user._id).session(session);

    // Send email notifications to both parties
    if (reportedByUser) {
      await sendDisputeEmailNotification(reportedByUser, "disputeResolved", {
        disputeTitle: dispute.title,
        resolutionType,
        description,
        disputeId: dispute._id.toString(),
      });
    }

    if (reportedAgainstUser) {
      await sendDisputeEmailNotification(
        reportedAgainstUser,
        "disputeResolved",
        {
          disputeTitle: dispute.title,
          resolutionType,
          description,
          disputeId: dispute._id.toString(),
        },
      );
    }

    // Create in-app notifications
    const parties = [
      dispute.reportedBy.toString(),
      dispute.reportedAgainst.toString(),
    ];
    for (const partyId of parties) {
      await createDisputeNotification(
        partyId,
        dispute._id.toString(),
        "Dispute Resolved",
        `Dispute resolved: ${resolutionType.replace(/_/g, " ")}. ${description}`,
        "dispute_update",
        { resolutionType, actionTaken, resolvedBy: resolvingAdmin?.name },
      );
    }

    await session.commitTransaction();

    const resolvedDispute = await Dispute.findById(id)
      .populate("reportedBy", "name email")
      .populate("reportedAgainst", "name email")
      .populate("resolution.resolvedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Dispute resolved successfully",
      data: { dispute: resolvedDispute },
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Resolve dispute error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve dispute",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * 7. Escalate Dispute
 */
export const escalateDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as EscalateDisputeBody;
    const { reason } = body;
    const user = req.user!;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid dispute ID format",
      });
      return;
    }

    if (!reason || reason.trim().length < 10) {
      res.status(400).json({
        success: false,
        message:
          "Escalation reason is required and must be at least 10 characters",
      });
      return;
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    // Check permission (only college admins can escalate to super admin)
    if (user.role !== "college_admin") {
      res.status(403).json({
        success: false,
        message: "Only college admins can escalate disputes",
      });
      return;
    }

    if (dispute.collegeId.toString() !== user.collegeId) {
      res.status(403).json({
        success: false,
        message: "You can only escalate disputes in your college",
      });
      return;
    }

    if (dispute.isEscalated) {
      res.status(400).json({
        success: false,
        message: "Dispute is already escalated",
      });
      return;
    }

    // Find a super admin to assign to
    // const superAdmin = await User.findOne({
    //   role: "super_admin",
    //   isActive: true,
    // });
    // if (!superAdmin) {
    //   res.status(500).json({
    //     success: false,
    //     message: "No super admin available to handle escalation",
    //   });
    //   return;
    // }

    dispute.isEscalated = true;
    dispute.status = "escalated";
    dispute.escalatedTo = new Types.ObjectId("000000000000000000000001"); // Assign to a default super admin (replace with actual ID)
    dispute.escalatedAt = new Date();
    dispute.escalationReason = reason;

    await dispute.save();

    // Send email to super admin
    const collegeAdmin = await User.findById(user._id);
    // await sendDisputeEmailNotification(superAdmin, "disputeEscalated", {
    //   disputeTitle: dispute.title,
    //   reason,
    //   disputeId: dispute._id.toString(),
    // });

    // Send email to college admin confirming escalation
    if (collegeAdmin) {
      await sendDisputeEmailNotification(collegeAdmin, "disputeUpdate", {
        disputeTitle: dispute.title,
        status: "escalated",
        message: `Dispute has been escalated to super admin. Reason: ${reason}`,
        disputeId: dispute._id.toString(),
      });
    }

    // Create notification for super admin
    await createDisputeNotification(
      "000000000000000000000001", // Replace with actual super admin ID
      dispute._id.toString(),
      "Dispute Escalated",
      `Dispute "${dispute.title}" has been escalated by a college admin. Reason: ${reason}`,
      "dispute_update",
      { collegeId: dispute.collegeId, escalatedBy: user._id, reason },
    );

    res.status(200).json({
      success: true,
      message: "Dispute escalated successfully",
      data: {
        dispute: await Dispute.findById(id).populate(
          "escalatedTo",
          "name email",
        ),
      },
    });
  } catch (error: any) {
    console.error("Escalate dispute error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to escalate dispute",
      error: error.message,
    });
  }
};

/**
 * 8. Assign Admin to Dispute
 */
export const assignAdminToDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as AssignAdminBody;
    const { adminId } = body;
    const user = req.user!;

    console.log("Assign admin request:", { id, adminId, userId: user._id });

    if (!isValidObjectId(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid dispute ID format",
      });
      return;
    }

    if (!isValidObjectId(adminId)) {
      res.status(400).json({
        success: false,
        message: "Valid admin ID is required",
      });
      return;
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    // Check permission
    if (user.role !== "super_admin" && user.role !== "college_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can assign disputes",
      });
      return;
    }

    // Verify the admin exists and has appropriate role
    const admin = await User.findById(adminId);
    if (
      !admin ||
      (admin.role !== "college_admin" && admin.role !== "super_admin")
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid admin. User must be a college admin or super admin",
      });
      return;
    }

    // College admin can only assign admins from their college
    if (user.role === "college_admin") {
      if (dispute.collegeId.toString() !== user.collegeId) {
        res.status(403).json({
          success: false,
          message: "You can only assign disputes in your college",
        });
        return;
      }
      if (
        admin.collegeId?.toString() !== user.collegeId &&
        admin.role !== "super_admin"
      ) {
        res.status(403).json({
          success: false,
          message: "You can only assign admins from your college",
        });
        return;
      }
    }

    dispute.assignedAdmin = new Types.ObjectId(adminId);
    if (dispute.status === "open") {
      dispute.status = "under_review";
    }
    await dispute.save();

    // Send email to assigned admin
    const assigningAdmin = await User.findById(user._id);
    await sendDisputeEmailNotification(admin, "disputeAssigned", {
      disputeTitle: dispute.title,
      assignedBy: assigningAdmin?.name || "Admin",
      disputeId: dispute._id.toString(),
    });

    // Create notification for assigned admin
    await createDisputeNotification(
      adminId,
      dispute._id.toString(),
      "Dispute Assigned to You",
      `You have been assigned to handle dispute: "${dispute.title}"`,
      "dispute_update",
      { assignedBy: user._id },
    );

    const updatedDispute = await Dispute.findById(id).populate(
      "assignedAdmin",
      "name email avatar",
    );

    res.status(200).json({
      success: true,
      message: "Admin assigned successfully",
      data: { dispute: updatedDispute },
    });
  } catch (error: any) {
    console.error("Assign admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign admin",
      error: error.message,
    });
  }
};

/**
 * 9. Get Disputes by Item
 */
export const getDisputesByItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const user = req.user!;

    if (!isValidObjectId(itemId as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
      return;
    }

    // Verify item exists and user has permission
    const item = await LostItem.findById(itemId);
    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    // Check permission
    let hasPermission = false;
    if (user.role === "super_admin") {
      hasPermission = true;
    } else if (user.role === "college_admin") {
      hasPermission = item.collegeId.toString() === user.collegeId;
    } else {
      hasPermission = item.reportedBy.toString() === user._id;
    }

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to view disputes for this item",
      });
      return;
    }

    const disputes = await Dispute.find({
      itemId: new Types.ObjectId(itemId as string),
    })
      .populate("reportedBy", "name email avatar")
      .populate("reportedAgainst", "name email avatar")
      .populate("assignedAdmin", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { disputes, count: disputes.length },
    });
  } catch (error: any) {
    console.error("Get disputes by item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch disputes for item",
      error: error.message,
    });
  }
};

/**
 * 10. Get Disputes for Current User
 */
export const getMyDisputes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const queryParams = req.query as QueryParams;
    const {
      status,
      page = "1",
      limit = "20",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    const userId = req.user!._id;
    const query: any = {
      $or: [
        { reportedBy: new Types.ObjectId(userId) },
        { reportedAgainst: new Types.ObjectId(userId) },
      ],
    };

    if (status) {
      const statuses = status.split(",");
      const validStatuses = statuses.filter((s) => validateDisputeStatus(s));
      if (validStatuses.length) {
        query.status = { $in: validStatuses };
      }
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const [disputes, total] = await Promise.all([
      Dispute.find(query)
        .populate("reportedBy", "name email avatar")
        .populate("reportedAgainst", "name email avatar")
        .populate("assignedAdmin", "name email avatar")
        .populate("itemId", "itemName images status")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Dispute.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        disputes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("Get my disputes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your disputes",
      error: error.message,
    });
  }
};

/**
 * 11. Get Dispute Statistics
 */
export const getDisputeStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { collegeId } = req.query;

    let matchFilter: any = {};

    // Apply role-based filtering
    if (user.role === "super_admin") {
      if (collegeId && isValidObjectId(collegeId as string)) {
        matchFilter.collegeId = new Types.ObjectId(collegeId as string);
      }
    } else if (user.role === "college_admin") {
      if (!user.collegeId) {
        res.status(403).json({
          success: false,
          message: "College admin not associated with any college",
        });
        return;
      }
      matchFilter.collegeId = new Types.ObjectId(user.collegeId);
    } else {
      matchFilter.$or = [
        { reportedBy: new Types.ObjectId(user._id) },
        { reportedAgainst: new Types.ObjectId(user._id) },
      ];
    }

    // Get statistics using aggregation
    const stats = await Dispute.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          statusBreakdown: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          typeBreakdown: [
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          priorityBreakdown: [
            { $group: { _id: "$priority", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          totalCounts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
                underReview: {
                  $sum: { $cond: [{ $eq: ["$status", "under_review"] }, 1, 0] },
                },
                escalated: {
                  $sum: { $cond: [{ $eq: ["$status", "escalated"] }, 1, 0] },
                },
                resolved: {
                  $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
                },
                closed: {
                  $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
                },
              },
            },
          ],
          resolutionTime: [
            {
              $match: {
                status: "resolved",
                "resolution.resolvedAt": { $exists: true },
              },
            },
            {
              $project: {
                resolutionTime: {
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
                averageHours: { $avg: "$resolutionTime" },
                fastestHours: { $min: "$resolutionTime" },
                slowestHours: { $max: "$resolutionTime" },
                totalResolved: { $sum: 1 },
              },
            },
          ],
          recentTrends: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
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
            { $limit: 30 },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: stats[0]?.statusBreakdown || [],
        typeBreakdown: stats[0]?.typeBreakdown || [],
        priorityBreakdown: stats[0]?.priorityBreakdown || [],
        totalCounts: stats[0]?.totalCounts[0] || {
          total: 0,
          open: 0,
          underReview: 0,
          escalated: 0,
          resolved: 0,
          closed: 0,
        },
        resolutionTime: stats[0]?.resolutionTime[0] || null,
        recentTrends: stats[0]?.recentTrends || [],
      },
    });
  } catch (error: any) {
    console.error("Get dispute statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dispute statistics",
      error: error.message,
    });
  }
};

/**
 * 12. Add Evidence to Dispute
 */
export const addDisputeEvidence = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body as AddEvidenceBody;
    const { evidence } = body;
    const user = req.user!;

    if (!isValidObjectId(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid dispute ID format",
      });
      return;
    }

    if (!evidence || !Array.isArray(evidence) || evidence.length === 0) {
      res.status(400).json({
        success: false,
        message: "Evidence array is required",
      });
      return;
    }

    const validation = validateEvidence(evidence);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: "Evidence validation failed",
        errors: validation.errors,
      });
      return;
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    // Check permission
    const hasPermission = await hasDisputePermission(
      dispute,
      user._id,
      user.role,
      user.collegeId,
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: "You don't have permission to add evidence to this dispute",
      });
      return;
    }

    // Add evidence
    const newEvidence = evidence.map((item) => ({
      url: item.url,
      type: item.type,
      uploadedAt: new Date(),
    }));

    dispute.evidence?.push(...newEvidence);
    await dispute.save();

    // Notify other parties about new evidence
    const parties = [
      dispute.reportedBy.toString(),
      dispute.reportedAgainst.toString(),
    ];
    if (dispute.assignedAdmin) {
      parties.push(dispute.assignedAdmin.toString());
    }

    const uniqueParties = [...new Set(parties)];
    for (const partyId of uniqueParties) {
      if (partyId !== user._id) {
        await createDisputeNotification(
          partyId,
          dispute._id.toString(),
          "New Evidence Added",
          `New evidence has been added to dispute: "${dispute.title}"`,
          "dispute_update",
          { evidenceCount: newEvidence.length },
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Evidence added successfully",
      data: { evidence: dispute.evidence },
    });
  } catch (error: any) {
    console.error("Add evidence error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add evidence",
      error: error.message,
    });
  }
};

/**
 * 13. Archive/Delete Dispute (Super Admin only)
 */
export const archiveDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    if (!isValidObjectId(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid dispute ID format",
      });
      return;
    }

    // Only super admin can archive/delete
    if (user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only super admins can archive disputes",
      });
      return;
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    // Soft delete - set status to closed with note
    dispute.status = "closed";
    dispute.messages.push({
      userId: new Types.ObjectId(user._id),
      content: "This dispute has been archived by super admin",
      isAdmin: true,
      createdAt: new Date(),
    });

    await dispute.save();

    // Notify involved parties about archiving
    const parties = [
      dispute.reportedBy.toString(),
      dispute.reportedAgainst.toString(),
    ];
    for (const partyId of parties) {
      await createDisputeNotification(
        partyId,
        dispute._id.toString(),
        "Dispute Archived",
        `Dispute "${dispute.title}" has been archived by super admin`,
        "dispute_update",
        { archivedBy: user._id },
      );
    }

    res.status(200).json({
      success: true,
      message: "Dispute archived successfully",
      data: { disputeId: dispute._id, status: dispute.status },
    });
  } catch (error: any) {
    console.error("Archive dispute error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive dispute",
      error: error.message,
    });
  }
};

//  Export all controllers

export default {
  createDispute,
  getAllDisputes,
  getDisputeById,
  updateDisputeStatus,
  addDisputeMessage,
  resolveDispute,
  escalateDispute,
  assignAdminToDispute,
  getDisputesByItem,
  getMyDisputes,
  getDisputeStatistics,
  addDisputeEvidence,
  archiveDispute,
};
