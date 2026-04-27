import mongoose, { Types } from "mongoose";
import Zone from "../models/campusZone.modal";
import { AuthRequest } from "../types/middlewareTypes";
import { Response } from "express";

// GET ZONES

export const getZones = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "50",
      type,
      search,
      isActive = "true",
      collegeId: queryCollegeId,
    } = req.query;

    const user = req.user;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = user?.role === "super_admin";

    let filterCollegeId: Types.ObjectId | null = null;

    // Determine which college to filter by
    if (isSuperAdmin) {
      if (queryCollegeId) {
        if (!Types.ObjectId.isValid(queryCollegeId as string)) {
          res.status(400).json({
            success: false,
            message: "Invalid college ID format",
          });
          return;
        }
        filterCollegeId = new Types.ObjectId(queryCollegeId as string);
      }
    } else {
      if (!userCollegeId) {
        res.status(403).json({
          success: false,
          message: "No college associated with this account",
        });
        return;
      }
      filterCollegeId = new Types.ObjectId(userCollegeId);
    }

    // Build filter with proper typing
    const filter: any = {
      isActive: isActive === "true",
    };

    if (filterCollegeId) {
      filter.collegeId = filterCollegeId;
    }

    if (type) {
      filter.type = type as string;
    }

    if (search && typeof search === "string") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { building: { $regex: search, $options: "i" } },
      ];
      filter.tags = { $in: [new RegExp(search, "i")] };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [zones, total] = await Promise.all([
      Zone.find(filter)
        .populate("parentZoneId", "name type")
        .populate("collegeId", "name shortName domain")
        .sort({ type: 1, name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Zone.countDocuments(filter),
    ]);

    let collegeStats = null;
    if (isSuperAdmin && !filterCollegeId) {
      collegeStats = await Zone.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$collegeId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "colleges",
            localField: "_id",
            foreignField: "_id",
            as: "college",
          },
        },
        { $unwind: "$college" },
        {
          $project: {
            collegeId: "$_id",
            collegeName: "$college.name",
            collegeShortName: "$college.shortName",
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);
    }

    res.status(200).json({
      success: true,
      data: zones,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      ...(collegeStats && { collegeStats }),
    });
  } catch (error: any) {
    console.error("Get zones error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching zones",
    });
  }
};

// GET ZONE BY ID

export const getZoneById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = user?.role === "super_admin";

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    if (!Types.ObjectId.isValid(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid zone ID format",
      });
      return;
    }

    const zone = await Zone.findById(id)
      .populate("parentZoneId", "name type")
      .populate("collegeId", "name shortName domain")
      .lean();

    if (!zone) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    if (!isSuperAdmin) {
      if (zone.collegeId._id.toString() !== userCollegeId?.toString()) {
        res.status(403).json({
          success: false,
          message: "You can only view zones from your college",
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: zone,
    });
  } catch (error: any) {
    console.error("Get zone by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching zone",
    });
  }
};

// GET NEARBY ZONES

export const getNearbyZones = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { collegeId, latitude, longitude, maxDistance = "1000" } = req.query;
    const user = req.user;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = user?.role === "super_admin";

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: "latitude and longitude are required",
      });
      return;
    }

    let filterCollegeId: Types.ObjectId | null = null;

    if (isSuperAdmin) {
      if (collegeId) {
        if (!Types.ObjectId.isValid(collegeId as string)) {
          res.status(400).json({
            success: false,
            message: "Invalid college ID format",
          });
          return;
        }
        filterCollegeId = new Types.ObjectId(collegeId as string);
      }
    } else {
      if (!userCollegeId) {
        res.status(403).json({
          success: false,
          message: "No college associated with this account",
        });
        return;
      }
      filterCollegeId = new Types.ObjectId(userCollegeId);
    }

    const coordinates: [number, number] = [
      parseFloat(longitude as string),
      parseFloat(latitude as string),
    ];
    const maxDistanceNum = parseInt(maxDistance as any);

    const zones = await Zone.find({
      ...(filterCollegeId && { collegeId: filterCollegeId }),
      "location.coordinates": {
        $near: {
          $geometry: { type: "Point", coordinates },
          $maxDistance: maxDistanceNum,
        },
      },
      isActive: true,
    })
      .populate("collegeId", "name shortName")
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      data: zones,
    });
  } catch (error: any) {
    console.error("Get nearby zones error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching nearby zones",
    });
  }
};

// CREATE ZONE

export const createZone = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      name,
      type,
      description,
      location,
      building,
      floor,
      roomNumbers,
      boundaries,
      isIndoor,
      images,
      tags,
      parentZoneId,
      metadata,
      collegeId,
    } = req.body;

    const user = req.user;
    const userRole = req.user?.role;
    const isSuperAdmin = userRole === "super_admin";
    const isCollegeAdmin = userRole === "college_admin";

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    if (!isSuperAdmin && !isCollegeAdmin) {
      res.status(403).json({
        success: false,
        message: "Only admins can create zones",
      });
      return;
    }

    // ✅ REQUIRED: collegeId must be in request body for ALL users
    if (!collegeId) {
      res.status(400).json({
        success: false,
        message: "College ID is required in request body",
      });
      return;
    }

    // ✅ Validate collegeId format
    if (!Types.ObjectId.isValid(collegeId)) {
      res.status(400).json({
        success: false,
        message: `Invalid college ID format: "${collegeId}". Must be a 24-character hex string.`,
      });
      return;
    }

    const targetCollegeId = new Types.ObjectId(collegeId);

    // ✅ Verify college exists
    const College = mongoose.model("College");
    const college = await College.findById(targetCollegeId);
    if (!college) {
      res.status(404).json({
        success: false,
        message: "College not found",
      });
      return;
    }

    // Validate required fields
    if (!name || !type || !location?.coordinates) {
      res.status(400).json({
        success: false,
        message: "Name, type, and location coordinates are required",
      });
      return;
    }

    if (
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      res.status(400).json({
        success: false,
        message: "Location coordinates must be [longitude, latitude]",
      });
      return;
    }

    // Verify parent zone if provided
    if (parentZoneId) {
      if (!Types.ObjectId.isValid(parentZoneId)) {
        res.status(400).json({
          success: false,
          message: "Invalid parent zone ID format",
        });
        return;
      }

      const parentZone = await Zone.findById(parentZoneId);
      if (!parentZone) {
        res.status(404).json({
          success: false,
          message: "Parent zone not found",
        });
        return;
      }

      if (parentZone.collegeId.toString() !== targetCollegeId.toString()) {
        res.status(400).json({
          success: false,
          message: "Parent zone must belong to the same college",
        });
        return;
      }
    }

    const zone = await Zone.create({
      collegeId: targetCollegeId,
      name: name.trim(),
      type,
      description: description?.trim(),
      location: {
        type: "Point",
        coordinates: location.coordinates,
        address: location.address,
      },
      building: building?.trim(),
      floor: floor ? parseInt(floor) : undefined,
      roomNumbers: roomNumbers || [],
      boundaries,
      isIndoor: isIndoor !== undefined ? isIndoor : true,
      isActive: true,
      images: images || [],
      tags: tags || [],
      parentZoneId: parentZoneId || null,
      metadata: metadata || {},
    });

    const populatedZone = await Zone.findById(zone._id)
      .populate("collegeId", "name shortName domain")
      .populate("parentZoneId", "name type");

    res.status(201).json({
      success: true,
      message: "Zone created successfully",
      data: populatedZone,
    });
  } catch (error: any) {
    console.error("Create zone error:", error);

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "A zone with this name already exists in this college",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Error creating zone",
    });
  }
};
// UPDATE ZONE

export const updateZone = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";
    const isCollegeAdmin = userRole === "college_admin";

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    if (!isSuperAdmin && !isCollegeAdmin) {
      res.status(403).json({
        success: false,
        message: "Only admins can update zones",
      });
      return;
    }

    if (!Types.ObjectId.isValid(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid zone ID format",
      });
      return;
    }

    const zone = await Zone.findById(id).populate("collegeId", "_id");

    if (!zone) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    if (isCollegeAdmin) {
      if (zone.collegeId._id.toString() !== userCollegeId?.toString()) {
        res.status(403).json({
          success: false,
          message: "You can only update zones in your college",
        });
        return;
      }
    }

    const updateData: Record<string, unknown> = {};

    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.description !== undefined)
      updateData.description = updates.description?.trim();

    if (updates.location !== undefined) {
      updateData.location = {
        type: "Point",
        coordinates: updates.location.coordinates,
        address: updates.location.address,
      };
    }

    if (updates.building !== undefined)
      updateData.building = updates.building?.trim();
    if (updates.floor !== undefined) updateData.floor = updates.floor;
    if (updates.roomNumbers !== undefined)
      updateData.roomNumbers = updates.roomNumbers;
    if (updates.boundaries !== undefined)
      updateData.boundaries = updates.boundaries;
    if (updates.isIndoor !== undefined) updateData.isIndoor = updates.isIndoor;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.images !== undefined) updateData.images = updates.images;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    if (updates.parentZoneId !== undefined) {
      if (updates.parentZoneId === null || updates.parentZoneId === "") {
        updateData.parentZoneId = null;
      } else {
        if (!Types.ObjectId.isValid(updates.parentZoneId)) {
          res.status(400).json({
            success: false,
            message: "Invalid parent zone ID format",
          });
          return;
        }

        const parentZone = await Zone.findById(updates.parentZoneId);
        if (!parentZone) {
          res.status(404).json({
            success: false,
            message: "Parent zone not found",
          });
          return;
        }

        if (parentZone.collegeId.toString() !== zone.collegeId._id.toString()) {
          res.status(400).json({
            success: false,
            message: "Parent zone must belong to the same college",
          });
          return;
        }

        updateData.parentZoneId = new Types.ObjectId(updates.parentZoneId);
      }
    }

    if (updates.collegeId !== undefined && isSuperAdmin) {
      if (!Types.ObjectId.isValid(updates.collegeId)) {
        res.status(400).json({
          success: false,
          message: "Invalid college ID format",
        });
        return;
      }

      const College = mongoose.model("College");
      const newCollege = await College.findById(updates.collegeId);
      if (!newCollege) {
        res.status(404).json({
          success: false,
          message: "College not found",
        });
        return;
      }

      updateData.collegeId = new Types.ObjectId(updates.collegeId);
    } else if (updates.collegeId !== undefined && !isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: "Only super admin can change the college of a zone",
      });
      return;
    }

    if (!isSuperAdmin) {
      updateData.updatedBy = new mongoose.Types.ObjectId(user._id);
    }

    const updatedZone = await Zone.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .populate("parentZoneId", "name type")
      .populate("updatedBy", "name email")
      .populate("collegeId", "name shortName domain");

    res.status(200).json({
      success: true,
      message: "Zone updated successfully",
      data: updatedZone,
    });
  } catch (error: any) {
    console.error("Update zone error:", error);

    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "A zone with this name already exists in this college",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Error updating zone",
    });
  }
};

// DELETE ZONE

export const deleteZone = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";
    const isCollegeAdmin = userRole === "college_admin";

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    if (!isSuperAdmin && !isCollegeAdmin) {
      res.status(403).json({
        success: false,
        message: "Only admins can delete zones",
      });
      return;
    }

    if (!Types.ObjectId.isValid(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid zone ID format",
      });
      return;
    }

    const zone = await Zone.findById(id);

    if (!zone) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    if (isCollegeAdmin) {
      if (zone.collegeId.toString() !== userCollegeId?.toString()) {
        res.status(403).json({
          success: false,
          message: "You can only delete zones in your college",
        });
        return;
      }
    }

    const childZones = await Zone.countDocuments({ parentZoneId: id });
    if (childZones > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete zone. It has ${childZones} child zones. Delete child zones first.`,
      });
      return;
    }

    const LostItem = mongoose.model("LostItem");
    const itemsCount = await LostItem.countDocuments({ zoneId: id });
    if (itemsCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete zone. It has ${itemsCount} lost items associated.`,
      });
      return;
    }

    await zone.deleteOne();

    res.status(200).json({
      success: true,
      message: "Zone deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete zone error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting zone",
    });
  }
};

// ADD ROOM TO ZONE

export const addRoomToZone = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { roomNumber } = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";
    const isCollegeAdmin = userRole === "college_admin";

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    if (!isSuperAdmin && !isCollegeAdmin) {
      res.status(403).json({
        success: false,
        message: "Only admins can add rooms to zones",
      });
      return;
    }

    if (!roomNumber) {
      res.status(400).json({
        success: false,
        message: "Room number is required",
      });
      return;
    }

    if (!Types.ObjectId.isValid(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid zone ID format",
      });
      return;
    }

    const zone = await Zone.findById(id);

    if (!zone) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    if (isCollegeAdmin) {
      if (zone.collegeId.toString() !== userCollegeId?.toString()) {
        res.status(403).json({
          success: false,
          message: "You can only add rooms to zones in your college",
        });
        return;
      }
    }

    await zone.addRoom(roomNumber);

    res.status(200).json({
      success: true,
      message: "Room added successfully",
      data: zone,
    });
  } catch (error: any) {
    console.error("Add room error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error adding room",
    });
  }
};

// REMOVE ROOM FROM ZONE

export const removeRoomFromZone = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id, roomNumber } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;
    const isSuperAdmin = userRole === "super_admin";
    const isCollegeAdmin = userRole === "college_admin";

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    if (!isSuperAdmin && !isCollegeAdmin) {
      res.status(403).json({
        success: false,
        message: "Only admins can remove rooms from zones",
      });
      return;
    }

    if (!Types.ObjectId.isValid(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid zone ID format",
      });
      return;
    }

    const zone = await Zone.findById(id);

    if (!zone) {
      res.status(404).json({
        success: false,
        message: "Zone not found",
      });
      return;
    }

    if (isCollegeAdmin) {
      if (zone.collegeId.toString() !== userCollegeId?.toString()) {
        res.status(403).json({
          success: false,
          message: "You can only remove rooms from zones in your college",
        });
        return;
      }
    }

    await zone.removeRoom(roomNumber as any);

    res.status(200).json({
      success: true,
      message: "Room removed successfully",
      data: zone,
    });
  } catch (error: any) {
    console.error("Remove room error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error removing room",
    });
  }
};
