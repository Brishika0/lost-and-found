import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "../utils/cloudinary";
import College from "../models/college.model";
import { AuthRequest } from "../types/middlewareTypes";
import Zone from "../models/campusZone.modal";
import LostItem from "../models/lostItem.modal";
import User from "../models/user.model";

// CREATE
export const createLostItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      itemName,
      description,
      category,
      subCategory,
      status,
      locationDescription,
      specificLocation,
      zoneId,
      dateLost,
      dateFound,
      contactInfo,
      tags,
    } = req.body;

    // Validate required fields
    if (!itemName || !description || !category || !locationDescription) {
      res.status(400).json({
        success: false,
        message:
          "Please provide: itemName, description, category, locationDescription",
      });
      return;
    }

    // Check authentication
    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated or no college associated",
      });
      return;
    }

    // Verify college exists and is active
    const college = await College.findById(req.user.collegeId);
    if (!college || !college.isActive) {
      res.status(403).json({
        success: false,
        message: "Your college is not active or not found",
      });
      return;
    }

    // If zoneId is provided, verify it belongs to user's college
    if (zoneId) {
      const zone = await Zone.findOne({
        _id: zoneId,
        collegeId: req.user.collegeId,
        isActive: true,
      });
      if (!zone) {
        res.status(400).json({
          success: false,
          message: "Invalid zone or zone does not belong to your college",
        });
        return;
      }
    }

    // Parse JSON fields
    let parsedSpecificLocation = specificLocation;
    if (specificLocation && typeof specificLocation === "string") {
      try {
        parsedSpecificLocation = JSON.parse(specificLocation);
      } catch (error) {
        // Keep as is
      }
    }

    let parsedContactInfo = contactInfo;
    if (contactInfo && typeof contactInfo === "string") {
      try {
        parsedContactInfo = JSON.parse(contactInfo);
      } catch (error) {
        parsedContactInfo = { showContact: true };
      }
    }

    let parsedTags: string[] = [];
    if (tags && typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        parsedTags = tags.split(",").map((tag: string) => tag.trim());
      }
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    // Handle image uploads
    const images = [];
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadToCloudinary(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          `lost-found/${req.user.collegeId}`,
        );

        images.push({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: i === 0,
          uploadedAt: new Date(),
        });
      }
    }

    // Create lost item
    const lostItemData: any = {
      itemName,
      description,
      category,
      subCategory: subCategory || "",
      status: status || "lost",
      collegeId: req.user.collegeId,
      reportedBy: new mongoose.Types.ObjectId(req.user._id),
      locationDescription,
      contactInfo: parsedContactInfo || { showContact: true },
      images,
      tags: parsedTags,
      createdBy: new mongoose.Types.ObjectId(req.user._id),
    };

    // Add optional fields if provided
    if (zoneId) {
      lostItemData.zoneId = new mongoose.Types.ObjectId(zoneId);
    }

    if (parsedSpecificLocation) {
      lostItemData.specificLocation = parsedSpecificLocation;
    }

    if (dateLost) lostItemData.dateLost = new Date(dateLost);
    if (dateFound && status === "found")
      lostItemData.dateFound = new Date(dateFound);

    const lostItem = await LostItem.create(lostItemData);

    // Populate references for response
    const populatedItem = await LostItem.findById(lostItem._id)
      .populate("reportedBy", "name email avatar")
      .populate("collegeId", "name shortName domain")
      .populate("zoneId", "name type");

    res.status(201).json({
      success: true,
      message: `${status === "found" ? "Found" : "Lost"} item created successfully`,
      data: populatedItem,
    });
  } catch (error: any) {
    console.error("Create lost item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating lost item",
    });
  }
};

export const getLostItems = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      collegeId,
      zoneId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      nearby,
      latitude,
      longitude,
      maxDistance = 5000,
      isActive,
      isVerified,
      showFlagged = false, // Add option to show flagged items
    } = req.query;

    // Base query - start with an empty object
    const query: any = {};

    // Filter by college (required for security)
    if (collegeId) {
      query.collegeId = new mongoose.Types.ObjectId(collegeId as string);
    } else {
      // If no college specified, return empty
      res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      });
      return;
    }

    // Apply isActive filter (only if provided)
    if (isActive !== undefined) {
      // Convert string to boolean
      query.isActive = isActive;
    }

    // Apply isFlagged filter (hide flagged by default)
    if (showFlagged) {
      // If explicitly asked to show flagged, don't filter by isFlagged
      // or you could show only flagged items
      if (showFlagged === "only") {
        query.isFlagged = true;
      }
      // Otherwise show all (both flagged and non-flagged)
    } else {
      // Default: hide flagged items
      query.isFlagged = false;
    }

    const user = req.user?.role === "student";

    // Apply isVerified filter (only if provided)
    if (isVerified !== undefined) {
      // Convert string to boolean
      query.isVerified = isVerified;
    }
    // If isVerified not provided, don't filter by it (show both verified and unverified)

    // Apply other filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (zoneId) query.zoneId = new mongoose.Types.ObjectId(zoneId as string);

    // Search by text
    if (search && typeof search === "string") {
      query.$text = { $search: search };
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort: any = {};

    // If nearby search with coordinates
    if (nearby === "true" && latitude && longitude) {
      query["specificLocation.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(longitude as string),
              parseFloat(latitude as string),
            ],
          },
          $maxDistance: parseInt(maxDistance as string),
        },
      };
    } else {
      // Regular sorting
      sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

      // If text search, add text score to sorting
      if (search) {
        sort.score = { $meta: "textScore" };
      }
    }

    const lostItems = await LostItem.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("reportedBy", "name email avatar")
      .populate("foundBy", "name email avatar")
      .populate("claimedBy", "name email avatar")
      .populate("zoneId", "name type")
      .populate("collegeId", "name shortName logo")
      .lean();

    const total = await LostItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: lostItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get lost items error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching lost items",
    });
  }
};

export const getTrendingItems = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { collegeId, limit = 10 } = req.query;

    if (!collegeId) {
      res.status(400).json({
        success: false,
        message: "College ID is required",
      });
      return;
    }

    const trending = await LostItem.getTrending(
      collegeId as string,
      parseInt(limit as string),
    );

    res.status(200).json({
      success: true,
      data: trending,
    });
  } catch (error: any) {
    console.error("Get trending items error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching trending items",
    });
  }
};

export const searchItems = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { q, collegeId, category, status, fromDate, toDate } = req.query;

    if (!q || !collegeId) {
      res.status(400).json({
        success: false,
        message: "Search query and college ID are required",
      });
      return;
    }

    const filters: any = {};
    if (category) filters.category = category as string;
    if (status) filters.status = status as string;
    if (fromDate) filters.fromDate = new Date(fromDate as string);
    if (toDate) filters.toDate = new Date(toDate as string);

    const results = await LostItem.searchItems(
      q as string,
      collegeId as string,
      filters,
    );

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("Search items error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error searching items",
    });
  }
};

export const getItemsByZone = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { zoneId } = req.params;
    const { collegeId } = req.query;

    if (!collegeId) {
      res.status(400).json({
        success: false,
        message: "College ID is required",
      });
      return;
    }

    // Verify zone belongs to college
    const zone = await Zone.findOne({
      _id: zoneId,
      collegeId: collegeId,
      isActive: true,
    });

    if (!zone) {
      res.status(404).json({
        success: false,
        message: "Zone not found in your college",
      });
      return;
    }

    const items = await LostItem.findByZone(zoneId as any);

    res.status(200).json({
      success: true,
      data: items,
      zone: zone,
    });
  } catch (error: any) {
    console.error("Get items by zone error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching items by zone",
    });
  }
};

export const getNearbyItems = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { latitude, longitude, maxDistance = 1000, collegeId } = req.query;

    if (!latitude || !longitude || !collegeId) {
      res.status(400).json({
        success: false,
        message: "Latitude, longitude, and college ID are required",
      });
      return;
    }

    const coordinates: [number, number] = [
      parseFloat(longitude as string),
      parseFloat(latitude as string),
    ];

    const items = await LostItem.getNearbyItems(
      coordinates,
      parseInt(maxDistance as string),
      { collegeId: new mongoose.Types.ObjectId(collegeId as string) },
    );

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    console.error("Get nearby items error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching nearby items",
    });
  }
};

export const getLostItemById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    const lostItem = await LostItem.findById(id)
      .populate("reportedBy", "name email avatar")
      .populate("foundBy", "name email avatar")
      .populate("claimedBy", "name email avatar")
      .populate("returnedTo", "name email avatar")
      .populate("verifiedBy", "name email")
      .populate("zoneId", "name type location")
      .populate("collegeId", "name shortName logo")
      .populate({
        path: "comments",
        match: { isActive: true, isHidden: false },
        populate: {
          path: "userId",
          select: "name email avatar",
        },
      });

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item is from the same college as user (if logged in)
    if (
      req.user?.collegeId &&
      lostItem.collegeId.toString() !== req.user.collegeId.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "You cannot view items from other colleges",
      });
      return;
    }

    // Add view
    if (req.user?._id) {
      await lostItem.addView(req.user._id);
    } else {
      await lostItem.addView();
    }

    res.status(200).json({
      success: true,
      data: lostItem,
    });
  } catch (error: any) {
    console.error("Get lost item by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching lost item",
    });
  }
};

export const getMyLostItems = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const { page = 1, limit = 10, status } = req.query;

    const query: any = {
      reportedBy: new mongoose.Types.ObjectId(req.user._id),
    };

    if (status) query.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const lostItems = await LostItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("zoneId", "name type")
      .populate("collegeId", "name shortName");

    const total = await LostItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: lostItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get my lost items error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching your items",
    });
  }
};

export const getMyInteractions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const [foundItems, claimedItems, returnedItems] = await Promise.all([
      LostItem.find({ foundBy: userId, isActive: true })
        .sort({ dateFound: -1 })
        .limit(20)
        .populate("reportedBy", "name email"),
      LostItem.find({ claimedBy: userId, isActive: true })
        .sort({ dateClaimed: -1 })
        .limit(20)
        .populate("reportedBy", "name email"),
      LostItem.find({ returnedTo: userId, isActive: true })
        .sort({ dateReturned: -1 })
        .limit(20)
        .populate("reportedBy", "name email"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        found: foundItems,
        claimed: claimedItems,
        returned: returnedItems,
      },
    });
  } catch (error: any) {
    console.error("Get interactions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching interactions",
    });
  }
};

// UPDATE
export const updateLostItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item belongs to user's college
    if (lostItem.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403).json({
        success: false,
        message: "You cannot update items from other colleges",
      });
      return;
    }

    // Check ownership or admin role
    const isOwner = lostItem.reportedBy.toString() === req.user._id;
    const isCollegeAdmin = req.user.role === "college_admin";
    const isSuperAdmin = req.user.role === "super_admin";

    if (!isOwner && !isCollegeAdmin && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to update this item",
      });
      return;
    }

    // If zoneId is being updated, verify it belongs to college
    if (updates.zoneId) {
      const zone = await Zone.findOne({
        _id: updates.zoneId,
        collegeId: req.user.collegeId,
        isActive: true,
      });
      if (!zone) {
        res.status(400).json({
          success: false,
          message: "Invalid zone or zone does not belong to your college",
        });
        return;
      }
    }

    // Parse JSON fields
    if (
      updates.specificLocation &&
      typeof updates.specificLocation === "string"
    ) {
      try {
        updates.specificLocation = JSON.parse(updates.specificLocation);
      } catch (error) {}
    }

    if (updates.contactInfo && typeof updates.contactInfo === "string") {
      try {
        updates.contactInfo = JSON.parse(updates.contactInfo);
      } catch (error) {}
    }

    if (updates.tags && typeof updates.tags === "string") {
      try {
        updates.tags = JSON.parse(updates.tags);
      } catch (error) {
        updates.tags = updates.tags.split(",").map((tag: string) => tag.trim());
      }
    }

    // Handle date fields
    if (updates.dateLost) updates.dateLost = new Date(updates.dateLost);
    if (updates.dateFound) updates.dateFound = new Date(updates.dateFound);
    if (updates.dateClaimed)
      updates.dateClaimed = new Date(updates.dateClaimed);
    if (updates.dateReturned)
      updates.dateReturned = new Date(updates.dateReturned);

    // Add updatedBy
    updates.updatedBy = new mongoose.Types.ObjectId(req.user._id);

    // Update the item
    const updatedItem = await LostItem.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    )
      .populate("reportedBy", "name email avatar")
      .populate("foundBy", "name email avatar")
      .populate("claimedBy", "name email avatar")
      .populate("zoneId", "name type")
      .populate("collegeId", "name shortName");

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (error: any) {
    console.error("Update lost item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating item",
    });
  }
};

export const updateLostItemStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, foundBy, claimedBy, returnedTo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (!["lost", "found", "claimed", "returned"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item belongs to user's college
    if (lostItem.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403).json({
        success: false,
        message: "You cannot update items from other colleges",
      });
      return;
    }

    // Check ownership or admin role
    const isOwner = lostItem.reportedBy.toString() === req.user._id;
    const isCollegeAdmin = req.user.role === "college_admin";
    const isSuperAdmin = req.user.role === "super_admin";

    if (!isOwner && !isCollegeAdmin && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to update this item",
      });
      return;
    }

    // Prepare update object
    const update: any = {
      status,
      updatedBy: new mongoose.Types.ObjectId(req.user._id),
    };

    // Set appropriate date fields and user references
    switch (status) {
      case "found":
        update.dateFound = new Date();
        if (foundBy) {
          // Verify foundBy user belongs to same college
          const user = await User.findById(foundBy);
          if (
            user &&
            user.collegeId?.toString() === req.user.collegeId.toString()
          ) {
            update.foundBy = new mongoose.Types.ObjectId(foundBy);
          }
        }
        break;
      case "claimed":
        update.dateClaimed = new Date();
        if (claimedBy) {
          const user = await User.findById(claimedBy);
          if (
            user &&
            user.collegeId?.toString() === req.user.collegeId.toString()
          ) {
            update.claimedBy = new mongoose.Types.ObjectId(claimedBy);
          }
        }
        break;
      case "returned":
        update.dateReturned = new Date();
        if (returnedTo) {
          const user = await User.findById(returnedTo);
          if (
            user &&
            user.collegeId?.toString() === req.user.collegeId.toString()
          ) {
            update.returnedTo = new mongoose.Types.ObjectId(returnedTo);
          }
        }
        break;
    }

    const updatedItem = await LostItem.findByIdAndUpdate(id, update, {
      new: true,
    })
      .populate("reportedBy", "name email avatar")
      .populate("foundBy", "name email avatar")
      .populate("claimedBy", "name email avatar")
      .populate("returnedTo", "name email avatar");

    res.status(200).json({
      success: true,
      message: `Item status updated to ${status}`,
      data: updatedItem,
    });
  } catch (error: any) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating item status",
    });
  }
};

export const verifyItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can verify items",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item belongs to admin's college
    if (lostItem.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403).json({
        success: false,
        message: "You cannot verify items from other colleges",
      });
      return;
    }

    await lostItem.verify(req.user._id);

    res.status(200).json({
      success: true,
      message: "Item verified successfully",
      data: {
        isVerified: lostItem.isVerified,
        verifiedBy: lostItem.verifiedBy,
        verifiedAt: lostItem.verifiedAt,
      },
    });
  } catch (error: any) {
    console.error("Verify item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error verifying item",
    });
  }
};

// IMAGE MANAGEMENT
export const addImages = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item belongs to user's college
    if (lostItem.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403).json({
        success: false,
        message: "You cannot update items from other colleges",
      });
      return;
    }

    // Check ownership or admin role
    const isOwner = lostItem.reportedBy.toString() === req.user._id;
    const isCollegeAdmin = req.user.role === "college_admin";
    const isSuperAdmin = req.user.role === "super_admin";

    if (!isOwner && !isCollegeAdmin && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to update this item",
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No images provided",
      });
      return;
    }

    const newImages = [];
    const currentImages = lostItem.images || [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadToCloudinary(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        `lost-found/${req.user.collegeId}`,
      );

      newImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: currentImages.length === 0 && i === 0,
        uploadedAt: new Date(),
      });
    }

    lostItem.images.push(...newImages);
    lostItem.updatedBy = new mongoose.Types.ObjectId(req.user._id);
    await lostItem.save();

    res.status(200).json({
      success: true,
      message: `${newImages.length} image(s) added successfully`,
      data: lostItem.images,
    });
  } catch (error: any) {
    console.error("Add images error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error adding images",
    });
  }
};

export const setPrimaryImage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id, imageId } = req.params; // imageId is the publicId

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item belongs to user's college
    if (lostItem.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403).json({
        success: false,
        message: "You cannot update items from other colleges",
      });
      return;
    }

    // Check ownership or admin role
    const isOwner = lostItem.reportedBy.toString() === req.user._id;
    const isCollegeAdmin = req.user.role === "college_admin";
    const isSuperAdmin = req.user.role === "super_admin";

    if (!isOwner && !isCollegeAdmin && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to update this item",
      });
      return;
    }

    // Check if images exist
    if (!lostItem.images || lostItem.images.length === 0) {
      res.status(400).json({
        success: false,
        message: "No images to set as primary",
      });
      return;
    }

    // Find the image by publicId (imageId parameter is the publicId)
    const imageIndex = lostItem.images.findIndex(
      (img) => img.publicId === imageId,
    );

    if (imageIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Image not found with the provided publicId",
      });
      return;
    }

    // Set all images to isPrimary: false, then set the selected one to true
    lostItem.images = lostItem.images.map((img, index) => ({
      ...img,
      isPrimary: index === imageIndex,
    }));

    lostItem.updatedBy = new mongoose.Types.ObjectId(req.user._id);
    await lostItem.save();

    res.status(200).json({
      success: true,
      message: "Primary image updated successfully",
      data: lostItem.images,
    });
  } catch (error: any) {
    console.error("Set primary image error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error setting primary image",
    });
  }
};

export const removeImage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id, imageId } = req.params; // imageId is the publicId

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item belongs to user's college
    if (lostItem.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403).json({
        success: false,
        message: "You cannot update items from other colleges",
      });
      return;
    }

    // Check ownership or admin role
    const isOwner = lostItem.reportedBy.toString() === req.user._id;
    const isCollegeAdmin = req.user.role === "college_admin";
    const isSuperAdmin = req.user.role === "super_admin";

    if (!isOwner && !isCollegeAdmin && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to update this item",
      });
      return;
    }

    // Find the image to remove by publicId
    const imageToRemove = lostItem.images.find(
      (img) => img.publicId === imageId,
    );

    if (!imageToRemove) {
      res.status(404).json({
        success: false,
        message: "Image not found with the provided publicId",
      });
      return;
    }

    // Delete from Cloudinary
    if (imageToRemove.publicId) {
      await deleteFromCloudinary(imageToRemove.publicId);
    }

    // Check if this was the primary image
    const wasPrimary = imageToRemove.isPrimary;

    // Remove from array by filtering out the image with matching publicId
    lostItem.images = lostItem.images.filter((img) => img.publicId !== imageId);

    // If we removed the primary image and there are other images, make the first one primary
    if (wasPrimary && lostItem.images.length > 0) {
      lostItem.images[0].isPrimary = true;
    }

    lostItem.updatedBy = new mongoose.Types.ObjectId(req.user._id);
    await lostItem.save();

    res.status(200).json({
      success: true,
      message: "Image removed successfully",
      data: lostItem.images,
    });
  } catch (error: any) {
    console.error("Remove image error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error removing image",
    });
  }
};

// DELETE
export const deleteLostItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item belongs to user's college
    if (lostItem.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403).json({
        success: false,
        message: "You cannot delete items from other colleges",
      });
      return;
    }

    // Check ownership or admin role
    const isOwner = lostItem.reportedBy.toString() === req.user._id;
    const isCollegeAdmin = req.user.role === "college_admin";
    const isSuperAdmin = req.user.role === "super_admin";

    if (!isOwner && !isCollegeAdmin && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to delete this item",
      });
      return;
    }

    // Soft delete
    lostItem.isActive = false;
    lostItem.updatedBy = new mongoose.Types.ObjectId(req.user._id);
    await lostItem.save();

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete lost item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting item",
    });
  }
};

export const permanentDeleteLostItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Only college admin or super admin can permanently delete
    if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can permanently delete items",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item belongs to admin's college
    if (lostItem.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403).json({
        success: false,
        message: "You cannot delete items from other colleges",
      });
      return;
    }

    // Delete all images from Cloudinary
    const publicIds = lostItem.images
      .map((img) => img.publicId)
      .filter((id): id is string => id !== undefined);

    if (publicIds.length > 0) {
      await deleteMultipleFromCloudinary(publicIds);
    }

    // Permanently delete from database
    await lostItem.deleteOne();

    res.status(200).json({
      success: true,
      message: "Item permanently deleted",
    });
  } catch (error: any) {
    console.error("Permanent delete error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error permanently deleting item",
    });
  }
};

// SOCIAL ACTIONS
export const likeLostItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item is from same college (optional - you can allow cross-college likes)
    if (
      req.user.collegeId &&
      lostItem.collegeId.toString() !== req.user.collegeId.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "You cannot like items from other colleges",
      });
      return;
    }

    await lostItem.like(req.user._id);

    res.status(200).json({
      success: true,
      message: "Item liked successfully",
      data: {
        likesCount: lostItem.likesCount,
      },
    });
  } catch (error: any) {
    console.error("Like item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error liking item",
    });
  }
};

export const unlikeLostItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    await lostItem.unlike(req.user._id);

    res.status(200).json({
      success: true,
      message: "Item unliked successfully",
      data: {
        likesCount: lostItem.likesCount,
      },
    });
  } catch (error: any) {
    console.error("Unlike item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error unliking item",
    });
  }
};

export const shareLostItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { sharedOn = "timeline" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    await lostItem.share(req.user._id, sharedOn);

    res.status(200).json({
      success: true,
      message: "Item shared successfully",
      data: {
        sharesCount: lostItem.sharesCount,
      },
    });
  } catch (error: any) {
    console.error("Share item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error sharing item",
    });
  }
};

export const flagLostItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (!reason) {
      res.status(400).json({
        success: false,
        message: "Please provide a reason for flagging",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    await lostItem.flag(req.user._id, reason, description);

    res.status(200).json({
      success: true,
      message: "Item flagged successfully",
      data: {
        flagCount: lostItem.flagCount,
        isFlagged: lostItem.isFlagged,
      },
    });
  } catch (error: any) {
    console.error("Flag item error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error flagging item",
    });
  }
};

// ADMIN ACTIONS
export const getFlaggedItems = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can view flagged items",
      });
      return;
    }

    const { page = 1, limit = 20 } = req.query;

    const query: any = {
      collegeId: req.user.collegeId,
      isFlagged: true,
    };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const flaggedItems = await LostItem.find(query)
      .sort({ flagCount: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("reportedBy", "name email")
      .populate("flags.user", "name email");

    const total = await LostItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: flaggedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get flagged items error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching flagged items",
    });
  }
};

export const resolveItemFlags = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'keep' or 'remove'

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
      return;
    }

    if (!req.user?._id || !req.user?.collegeId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (req.user.role !== "college_admin" && req.user.role !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can resolve flags",
      });
      return;
    }

    const lostItem = await LostItem.findById(id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
      return;
    }

    // Check if item belongs to admin's college
    if (lostItem.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403).json({
        success: false,
        message: "You cannot modify items from other colleges",
      });
      return;
    }

    // Mark all flags as resolved
    lostItem.flags = lostItem.flags.map((flag) => ({
      ...flag,
      resolved: true,
      resolvedBy: new mongoose.Types.ObjectId(req.user?._id!),
      resolvedAt: new Date(),
    }));

    // If action is 'remove', deactivate the item
    if (action === "remove") {
      lostItem.isActive = false;
    }

    lostItem.isFlagged = false;
    lostItem.updatedBy = new mongoose.Types.ObjectId(req.user._id);
    await lostItem.save();

    res.status(200).json({
      success: true,
      message: `Flags resolved successfully. Item ${action === "remove" ? "deactivated" : "kept visible"}.`,
    });
  } catch (error: any) {
    console.error("Resolve flags error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error resolving flags",
    });
  }
};
