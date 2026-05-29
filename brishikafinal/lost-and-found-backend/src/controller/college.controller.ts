import { Request, Response } from "express";
import mongoose from "mongoose";
import College from "../models/college.model";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";
import path from "path";
import multer from "multer";
import { AuthRequest } from "../types/middlewareTypes";
import User from "../models/user.model";
import LostItem from "../models/lostItem.modal";
import Chat from "../models/conversation.modal";

// GET ALL COLLEGES
export const GetColleges = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
      isActive?: string;
      sortBy?: string;
      sortOrder?: string;
    };

    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortName: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
      ];
    }

    // Active filter
    if (isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const colleges = await College.find(filter)
      .select("-__v -metadata")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await College.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: colleges,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("GetColleges error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// GET SINGLE COLLEGE
export const GetCollegeById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID format",
      });
    }

    const college = await College.findById(id)
      .select("-__v -metadata")
      .populate("adminIds", "name email avatar")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error: any) {
    console.error("GetCollegeById error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// CREATE COLLEGE
export const CreateCollege = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { name, domain, shortName, location, contactInfo, metadata } =
      req.body;
    const file = req.file;

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Only superadmin can create colleges
    if (user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can create colleges",
      });
    }

    // Validate required fields
    if (!name || !domain || !shortName || !file) {
      return res.status(400).json({
        success: false,
        message: "Name, domain, shortName, and logo are required",
      });
    }

    // Check if college already exists
    const existingCollege = await College.findOne({
      $or: [{ name }, { domain }],
    });

    if (existingCollege) {
      return res.status(400).json({
        success: false,
        message: "College with this name or domain already exists",
      });
    }

    // Upload logo to Cloudinary
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const uploadResult = await uploadToCloudinary(dataURI, "colleges");

    // Parse location if provided
    let parsedLocation: any = {};
    if (location) {
      try {
        parsedLocation =
          typeof location === "string" ? JSON.parse(location) : location;
      } catch (e) {
        console.error("Location parse error:", e);
      }
    }

    // Parse contactInfo if provided
    let parsedContactInfo: {
      email?: string;
      phone?: string;
      website?: string;
    } = {};

    if (contactInfo) {
      try {
        parsedContactInfo =
          typeof contactInfo === "string"
            ? JSON.parse(contactInfo)
            : contactInfo;
      } catch (e) {
        console.error("ContactInfo parse error:", e);
      }
    }

    // Parse metadata if provided
    let parsedMetadata: any = {};
    if (metadata) {
      try {
        parsedMetadata =
          typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      } catch (e) {
        console.error("Metadata parse error:", e);
      }
    }

    // Create college with new model structure
    const college = new College({
      name,
      domain: domain.toLowerCase().replace(/^www\./, ""),
      logo: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        uploadedAt: new Date(),
      },
      shortName,
      location: parsedLocation,
      contactInfo: {
        email: parsedContactInfo?.email || `admin@${domain}`,
        phone: parsedContactInfo?.phone || "",
        website: parsedContactInfo?.website || "",
      },
      metadata: parsedMetadata,
      createdBy: "000000000000000000000001",
      isActive: true,
    });

    await college.save();

    // Return college without sensitive fields
    const createdCollege = await College.findById(college._id)
      .select("-__v -metadata")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "College created successfully",
      data: createdCollege,
    });
  } catch (error: any) {
    console.error("CreateCollege error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// UPDATE COLLEGE
export const UpdateCollege = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const {
      name,
      domain,
      shortName,
      location,
      contactInfo,
      metadata,
      isActive,
    } = req.body;
    const file = req.file;

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Not Authorised!",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID format",
      });
    }

    // Find college
    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // Check if name or domain already exists on another college
    if (name || domain) {
      const queryConditions: any[] = [];

      if (name) {
        queryConditions.push({ name });
      }
      if (domain) {
        queryConditions.push({ domain });
      }

      const existingCollege = await College.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(id as any) },
        $or: queryConditions,
      });

      if (existingCollege) {
        return res.status(400).json({
          success: false,
          message: "Another college with this name or domain already exists",
        });
      }
    }

    // Handle logo upload if new file provided
    if (file) {
      // Delete old logo from Cloudinary
      if (college.logo?.publicId) {
        await deleteFromCloudinary(college.logo.publicId);
      }

      // Upload new logo
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const uploadResult = await uploadToCloudinary(dataURI, "colleges");

      college.logo = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        uploadedAt: new Date(),
      };
    }

    // Update fields if provided
    if (name) college.name = name;
    if (domain) college.domain = domain.toLowerCase().replace(/^www\./, "");
    if (shortName) college.shortName = shortName;
    if (isActive !== undefined) college.isActive = isActive;

    // Parse and update location if provided
    if (location) {
      try {
        college.location =
          typeof location === "string" ? JSON.parse(location) : location;
      } catch (e) {
        console.error("Location parse error:", e);
      }
    }

    // Parse and update contactInfo if provided
    if (contactInfo) {
      try {
        const parsedContact =
          typeof contactInfo === "string"
            ? JSON.parse(contactInfo)
            : contactInfo;

        if (!college.contactInfo) {
          college.contactInfo = {
            email: "",
            phone: "",
            website: "",
          };
        }

        college.contactInfo.email =
          parsedContact.email ||
          college.contactInfo.email ||
          `admin@${college.domain}`;
        college.contactInfo.phone =
          parsedContact.phone !== undefined
            ? parsedContact.phone
            : college.contactInfo.phone;
        college.contactInfo.website =
          parsedContact.website !== undefined
            ? parsedContact.website
            : college.contactInfo.website;
      } catch (e) {
        console.error("ContactInfo parse error:", e);
      }
    }

    // Parse and update metadata if provided
    if (metadata) {
      try {
        college.metadata =
          typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      } catch (e) {
        console.error("Metadata parse error:", e);
      }
    }

    college.updatedBy = new mongoose.Types.ObjectId("000000000000000000000001");

    await college.save();

    // Return updated college
    const updatedCollege = await College.findById(id)
      .select("-__v -metadata")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .populate("adminIds", "name email avatar");

    return res.status(200).json({
      success: true,
      message: "College updated successfully",
      data: updatedCollege,
    });
  } catch (error: any) {
    console.error("UpdateCollege error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// UPDATE COLLEGE STATUS
export const UpdateCollegeStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Not Authorised!",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID format",
      });
    }

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive field is required",
      });
    }

    const college = await College.findByIdAndUpdate(
      id,
      {
        $set: { isActive },
        updatedBy: new mongoose.Types.ObjectId("000000000000000000000001"),
      },
      { new: true },
    )
      .select("-__v -metadata")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `College ${isActive ? "activated" : "deactivated"} successfully`,
      data: college,
    });
  } catch (error: any) {
    console.error("UpdateCollegeStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// DELETE COLLEGE
export const DeleteCollege = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Not Authorised!",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID format",
      });
    }

    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // Delete logo from Cloudinary
    if (college.logo?.publicId) {
      await deleteFromCloudinary(college.logo.publicId);
    }

    // Delete college from database
    await College.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "College deleted successfully",
    });
  } catch (error: any) {
    console.error("DeleteCollege error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ADD COLLEGE ADMIN
export const AddCollegeAdmin = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const superAdmin = req.user;

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (superAdmin.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Not Authorised!",
      });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID format",
      });
    }

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Valid admin ID is required",
      });
    }

    // Find the college
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // Find the user to be made admin
    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user already belongs to this college
    if (!user.collegeId || user.collegeId.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "User does not belong to this college",
      });
    }

    // Check if user is already an admin of this college
    if (college.adminIds.includes(new mongoose.Types.ObjectId(adminId))) {
      return res.status(400).json({
        success: false,
        message: "User is already an admin of this college",
      });
    }

    // STEP 1: Add user to college's adminIds
    college.adminIds.push(new mongoose.Types.ObjectId(adminId));
    college.updatedBy = new mongoose.Types.ObjectId("000000000000000000000001");
    await college.save();

    // STEP 2: Update user's role to college_admin
    user.role = "college_admin";
    await user.save();

    // Return updated college with populated admins
    const updatedCollege = await College.findById(id)
      .select("-__v -metadata")
      .populate("adminIds", "name email avatar role");

    return res.status(200).json({
      success: true,
      message: "User successfully added as college admin",
      data: updatedCollege,
    });
  } catch (error: any) {
    console.error("AddCollegeAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// REMOVE COLLEGE ADMIN
export const RemoveCollegeAdmin = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { id, adminId } = req.params; // College ID and Admin ID

    const superAdmin = req.user;

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (superAdmin.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Not Authorised!",
      });
    }

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(id as any) ||
      !mongoose.Types.ObjectId.isValid(adminId as any)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Find the college
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // Find the user to be removed as admin
    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is actually an admin of this college
    if (
      !college.adminIds.includes(new mongoose.Types.ObjectId(adminId as any))
    ) {
      return res.status(400).json({
        success: false,
        message: "User is not an admin of this college",
      });
    }

    // STEP 1: Remove user from college's adminIds
    college.adminIds = college.adminIds.filter(
      (id) => id.toString() !== adminId,
    );
    college.updatedBy = new mongoose.Types.ObjectId("000000000000000000000001");
    await college.save();

    // STEP 2: Change user's role back to student
    user.role = "student";
    await user.save();

    // Return updated college
    const updatedCollege = await College.findById(id)
      .select("-__v -metadata")
      .populate("adminIds", "name email avatar role");

    return res.status(200).json({
      success: true,
      message: "Admin removed successfully",
      data: updatedCollege,
    });
  } catch (error: any) {
    console.error("RemoveCollegeAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// GET COLLEGES BY DOMAIN
export const GetCollegesByDomain = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "Domain is required",
      });
    }

    const college = await College.findOne({
      domain: domain.toLowerCase(),
      isActive: true,
    }).select("name shortName domain logo location contactInfo");

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "No college found with this domain",
      });
    }

    return res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error: any) {
    console.error("GetCollegesByDomain error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// GET COLLEGE STATS
export const GetCollegeStats = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID format",
      });
    }

    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // Get stats from other collections
    const [
      totalStudents,
      totalAdmins,
      totalLostItems,
      totalFoundItems,
      totalReturnedItems,
      totalChats,
      activeItems,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments({ collegeId: id, role: "student" }),
      User.countDocuments({ collegeId: id, role: "college_admin" }),
      LostItem.countDocuments({ collegeId: id, status: "lost" }),
      LostItem.countDocuments({ collegeId: id, status: "found" }),
      LostItem.countDocuments({ collegeId: id, status: "returned" }),
      Chat.countDocuments({ collegeId: id }),
      LostItem.countDocuments({ collegeId: id, isActive: true }),
      LostItem.find({ collegeId: id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("itemName status createdAt"),
    ]);

    // Calculate additional metrics
    const totalItems = totalLostItems + totalFoundItems + totalReturnedItems;
    const resolutionRate =
      totalItems > 0 ? Math.round((totalReturnedItems / totalItems) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        collegeId: college._id,
        collegeName: college.name,
        collegeShortName: college.shortName,
        stats: {
          users: {
            totalStudents,
            totalAdmins,
            totalUsers: totalStudents + totalAdmins,
          },
          items: {
            total: totalItems,
            lost: totalLostItems,
            found: totalFoundItems,
            returned: totalReturnedItems,
            active: activeItems,
            resolutionRate: `${resolutionRate}%`,
          },
          chats: {
            total: totalChats,
          },
          recentActivities: recentActivities.map((item) => ({
            id: item._id,
            name: item.itemName,
            status: item.status,
            date: item.createdAt,
          })),
        },
        lastUpdated: new Date(),
      },
    });
  } catch (error: any) {
    console.error("GetCollegeStats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
