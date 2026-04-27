import { Request, Response } from "express";
import mongoose from "mongoose";
import User, { IUser } from "../models/user.model";
import College from "../models/college.model";
import { AuthRequest } from "../types/middlewareTypes";

// TYPES

interface GetUsersQuery {
  search?: string;
  isActive?: string;
  collegeId?: string;
  role?: "student" | "college_admin";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
  isEmailVerified?: string;
}

interface CollegeStat {
  _id: string;
  count: number;
}

interface UserStats {
  activeCount: number;
  inactiveCount: number;
  verifiedCount: number;
  unverifiedCount: number;
  collegeStats?: CollegeStat[];
}

// GET STUDENTS

export const getStudents = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;

    const {
      search,
      isActive,
      collegeId,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = "1",
      limit = "10",
      isEmailVerified,
    } = req.query as GetUsersQuery;

    // Build filter object - always filter for students only
    let filter: any = { role: "student" };

    // Role-based access control
    if (userRole === "super_admin") {
      // Super admin can see students from any college
      if (collegeId && collegeId !== "") {
        filter.collegeId = new mongoose.Types.ObjectId(collegeId);
      }
    } else if (userRole === "college_admin") {
      // College admin can only see students from their college
      filter.collegeId = new mongoose.Types.ObjectId(userCollegeId!);
    } else {
      res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
      return;
    }

    // Search by name or email
    if (search && search !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by active status
    if (isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }

    // Filter by email verification status
    if (isEmailVerified !== undefined && isEmailVerified !== "") {
      filter.isEmailVerified = isEmailVerified === "true";
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort configuration
    const sortConfig: Record<string, 1 | -1> = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const students = await User.find(filter)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires",
      )
      .populate("collegeId", "name shortName domain logo")
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalStudents = await User.countDocuments(filter);

    // Get statistics
    const stats: UserStats = {
      activeCount: await User.countDocuments({ ...filter, isActive: true }),
      inactiveCount: await User.countDocuments({ ...filter, isActive: false }),
      verifiedCount: await User.countDocuments({
        ...filter,
        isEmailVerified: true,
      }),
      unverifiedCount: await User.countDocuments({
        ...filter,
        isEmailVerified: false,
      }),
    };

    // Add college stats for super admin
    if (userRole === "super_admin") {
      stats.collegeStats = await User.aggregate<CollegeStat>([
        { $match: { role: "student" } },
        { $group: { _id: "$collegeId", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "colleges",
            localField: "_id",
            foreignField: "_id",
            as: "college",
          },
        },
        { $unwind: { path: "$college", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, count: 1, collegeName: "$college.name" } },
        { $sort: { count: -1 } },
      ]);
    }

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalStudents,
        pages: Math.ceil(totalStudents / limitNum),
      },
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// GET COLLEGE ADMINS
export const getCollegeAdmins = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userRole = req.user?.role;

    // Only super admin can access college admins
    if (userRole !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Only super admin can view college admins.",
      });
      return;
    }

    const {
      search,
      isActive,
      collegeId,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = "1",
      limit = "10",
    } = req.query as GetUsersQuery;

    // Build filter object - only college admins
    let filter: any = { role: "college_admin" };

    // Filter by college
    if (collegeId) {
      filter.collegeId = new mongoose.Types.ObjectId(collegeId);
    }

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by active status
    if (isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort configuration
    const sortConfig: Record<string, 1 | -1> = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const admins = await User.find(filter)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires",
      )
      .populate("collegeId", "name shortName domain logo")
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalAdmins = await User.countDocuments(filter);

    // Get statistics
    const stats: UserStats = {
      activeCount: await User.countDocuments({ ...filter, isActive: true }),
      inactiveCount: await User.countDocuments({ ...filter, isActive: false }),
      verifiedCount: await User.countDocuments({
        ...filter,
        isEmailVerified: true,
      }),
      unverifiedCount: await User.countDocuments({
        ...filter,
        isEmailVerified: false,
      }),
      collegeStats: await User.aggregate<CollegeStat>([
        { $match: { role: "college_admin" } },
        { $group: { _id: "$collegeId", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "colleges",
            localField: "_id",
            foreignField: "_id",
            as: "college",
          },
        },
        { $unwind: { path: "$college", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, count: 1, collegeName: "$college.name" } },
        { $sort: { count: -1 } },
      ]),
    };

    res.status(200).json({
      success: true,
      data: admins,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalAdmins,
        pages: Math.ceil(totalAdmins / limitNum),
      },
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching college admins:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching college admins",
      error: error.message,
    });
  }
};

// GET SINGLE USER

export const getUserById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const user = await User.findById(id)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires",
      )
      .populate("collegeId", "name shortName domain logo location contactInfo");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check permissions
    if (userRole === "college_admin") {
      // College admin can only view students from their college
      if (
        user.role !== "student" ||
        user.collegeId?.toString() !== userCollegeId?.toString()
      ) {
        res.status(403).json({
          success: false,
          message:
            "Access denied. You can only view students from your college.",
        });
        return;
      }
    }
    // Super admin can view anyone

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// CREATE USER

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role: "student" | "college_admin";
  collegeId?: string;
  isActive?: boolean;
  avatar?: string;
}

export const createUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const creatorRole = req.user?.role;
    const creatorCollegeId = req.user?.collegeId;
    const {
      name,
      email,
      password,
      role = "student", // Default to student
      collegeId,
      isActive = true,
      avatar,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    // IMPORTANT: Prevent creation of college_admin accounts
    if (role === "college_admin") {
      res.status(403).json({
        success: false,
        message:
          "College admin accounts cannot be created directly. Please use the 'Add College Admin' feature from the college management section.",
      });
      return;
    }

    // Only allow student role
    if (role !== "student") {
      res.status(400).json({
        success: false,
        message: "Invalid role. Only 'student' accounts can be created.",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Determine collegeId based on creator's role
    let targetCollegeId: mongoose.Types.ObjectId | undefined;

    if (creatorRole === "college_admin") {
      // College admin can only create students for their college
      targetCollegeId = new mongoose.Types.ObjectId(creatorCollegeId!);

      // If collegeId is provided, verify it matches admin's college
      if (collegeId && collegeId !== creatorCollegeId?.toString()) {
        res.status(403).json({
          success: false,
          message: "You can only create students for your own college",
        });
        return;
      }
    } else if (creatorRole === "super_admin") {
      // Super admin must provide collegeId for students
      if (!collegeId) {
        res.status(400).json({
          success: false,
          message: "collegeId is required when creating student accounts",
        });
        return;
      }

      // Verify college exists
      const college = await College.findById(collegeId);
      if (!college) {
        res.status(400).json({
          success: false,
          message: "College not found",
        });
        return;
      }

      targetCollegeId = new mongoose.Types.ObjectId(collegeId);
    }

    // Extract domain from email to verify college match
    const emailDomain = email.split("@")[1];
    const college = await College.findById(targetCollegeId);

    if (college && college.domain !== emailDomain) {
      res.status(400).json({
        success: false,
        message: "Email domain does not match college domain",
      });
      return;
    }

    // Hash password
    const hashedPassword = await User.hashPassword(password);

    // Create user (always student role)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student", // Force student role
      collegeId: targetCollegeId,
      avatar: avatar || undefined,
      isActive,
      isEmailVerified: false,
      lastActive: new Date(),
      chatPrivacy: {
        allowMessagesFrom: "everyone",
        showReadReceipts: true,
      },
      notificationPreferences: {
        email: true,
        push: true,
        matches: true,
        messages: true,
        comments: true,
      },
    });

    if (!user) {
      res.status(500).json({
        success: false,
        message: "Failed to create user",
      });
      return;
    }

    // Fetch created user with populated college
    const createdUser = await User.findById(user._id)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires",
      )
      .populate("collegeId", "name shortName domain logo");

    res.status(201).json({
      success: true,
      message: "Student account created successfully",
      data: createdUser,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Email already in use",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// UPDATE USER

interface UpdateUserBody {
  name?: string;
  email?: string;
  role?: "student" | "college_admin";
  collegeId?: string;
  isActive?: boolean;
  avatar?: string;
  chatPrivacy?: {
    allowMessagesFrom: "everyone" | "verified_only" | "nobody";
    showReadReceipts: boolean;
  };
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    matches?: boolean;
    messages?: boolean;
    comments?: boolean;
  };
}

export const updateUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updaterRole = req.user?.role;
    const updaterCollegeId = req.user?.collegeId;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // IMPORTANT: Prevent role changes
    if (updates.role && updates.role !== user.role) {
      res.status(403).json({
        success: false,
        message:
          "User role cannot be changed. To change a user's role, please use the appropriate admin management features.",
      });
      return;
    }

    // Check permissions based on updater role
    if (updaterRole === "college_admin") {
      // College admin can only update students from their college
      if (user.role !== "student") {
        res.status(403).json({
          success: false,
          message: "College admins can only update student accounts",
        });
        return;
      }

      if (user.collegeId?.toString() !== updaterCollegeId?.toString()) {
        res.status(403).json({
          success: false,
          message: "You can only update students from your own college",
        });
        return;
      }

      // Prevent college admin from changing collegeId
      if (
        updates.collegeId &&
        updates.collegeId !== updaterCollegeId?.toString()
      ) {
        res.status(403).json({
          success: false,
          message: "College admins cannot change a student's college",
        });
        return;
      }
    }

    // If email is being updated, check if it's already taken
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({
        email: updates.email.toLowerCase().trim(),
      });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "Email already in use",
        });
        return;
      }
    }

    // If collegeId is being updated (super admin only), verify college exists
    if (updates.collegeId && updates.collegeId !== user.collegeId?.toString()) {
      // Only super admin can change collegeId
      if (updaterRole !== "super_admin") {
        res.status(403).json({
          success: false,
          message: "Only super admin can change a user's college",
        });
        return;
      }

      const college = await College.findById(updates.collegeId);
      if (!college) {
        res.status(400).json({
          success: false,
          message: "College not found",
        });
        return;
      }

      // Verify email domain matches new college
      const emailDomain = (updates.email || user.email).split("@")[1];
      if (college.domain !== emailDomain) {
        res.status(400).json({
          success: false,
          message: "Email domain does not match college domain",
        });
        return;
      }
    }

    // Prepare update object (exclude sensitive fields)
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name.trim();
    if (updates.email) updateData.email = updates.email.toLowerCase().trim();
    if (updates.collegeId && updaterRole === "super_admin") {
      updateData.collegeId = new mongoose.Types.ObjectId(updates.collegeId);
    }
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.avatar !== undefined)
      updateData.avatar = updates.avatar || undefined;
    if (updates.chatPrivacy) updateData.chatPrivacy = updates.chatPrivacy;
    if (updates.notificationPreferences) {
      updateData.notificationPreferences = {
        ...user.notificationPreferences,
        ...updates.notificationPreferences,
      };
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires",
      )
      .populate("collegeId", "name shortName domain logo");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "Email already in use",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// TOGGLE USER STATUS

export const toggleUserStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updaterRole = req.user?.role;
    const updaterCollegeId = req.user?.collegeId;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check permissions
    if (updaterRole === "college_admin") {
      if (
        user.role !== "student" ||
        user.collegeId?.toString() !== updaterCollegeId?.toString()
      ) {
        res.status(403).json({
          success: false,
          message:
            "Access denied. You can only toggle status for students from your college.",
        });
        return;
      }
    }

    // Toggle status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling user status",
      error: error.message,
    });
  }
};

// DELETE USER

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    // Only super admin can delete users
    if (userRole !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only super admin can delete users",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Soft delete - set inactive
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// PERMANENT DELETE USER

export const permanentDeleteUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    // Only super admin can permanently delete users
    if (userRole !== "super_admin") {
      res.status(403).json({
        success: false,
        message: "Only super admin can permanently delete users",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if user has any related data (lost items, comments, etc.)
    // This is a placeholder - you might want to check for dependencies
    // and either cascade delete or prevent deletion

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User permanently deleted",
    });
  } catch (error: any) {
    console.error("Error permanently deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Error permanently deleting user",
      error: error.message,
    });
  }
};

// GET USER STATS

export const getUserStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userCollegeId = req.user?.collegeId;

    let filter: any = {};

    // College admin can only see their college stats
    if (userRole === "college_admin") {
      filter.collegeId = new mongoose.Types.ObjectId(userCollegeId!);
    }

    const [totalStudents, totalAdmins, activeStudents, pendingVerification] =
      await Promise.all([
        User.countDocuments({ ...filter, role: "student" }),
        User.countDocuments({ ...filter, role: "college_admin" }),
        User.countDocuments({ ...filter, role: "student", isActive: true }),
        User.countDocuments({
          ...filter,
          role: "student",
          isEmailVerified: false,
        }),
      ]);

    let collegeBreakdown = [];
    if (userRole === "super_admin") {
      collegeBreakdown = await User.aggregate([
        { $match: { role: "student" } },
        { $group: { _id: "$collegeId", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "colleges",
            localField: "_id",
            foreignField: "_id",
            as: "college",
          },
        },
        { $unwind: { path: "$college", preserveNullAndEmptyArrays: true } },
        { $project: { collegeName: "$college.name", count: 1 } },
        { $sort: { count: -1 } },
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalAdmins,
        activeStudents,
        pendingVerification,
        activePercentage:
          totalStudents > 0
            ? Math.round((activeStudents / totalStudents) * 100)
            : 0,
        verifiedPercentage:
          totalStudents > 0
            ? Math.round(
                ((totalStudents - pendingVerification) / totalStudents) * 100,
              )
            : 0,
        collegeBreakdown,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

// Type for populated college
interface PopulatedCollege {
  _id: mongoose.Types.ObjectId;
  name: string;
  domain: string;
}

// Type for user with populated college
type UserWithPopulatedCollege = IUser & {
  collegeId: PopulatedCollege | null;
};

// In your controller
export const verifyUserEmail = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const verifierRole = req.user?.role;
    const verifierCollegeId = req.user?.collegeId;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    // Use populate with type
    const user = await User.findById(id).populate<{
      collegeId: PopulatedCollege | null;
    }>("collegeId", "name domain");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check permissions
    if (verifierRole === "college_admin") {
      if (
        user.role !== "student" ||
        user.collegeId?._id.toString() !== verifierCollegeId?.toString()
      ) {
        res.status(403).json({
          success: false,
          message: "You can only verify students from your own college",
        });
        return;
      }
    }

    // Check if already verified
    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: "User email is already verified",
      });
      return;
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Email verified successfully for ${user.name}`,
      data: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        verifiedBy: {
          role: verifierRole,
          college: user.collegeId?.name,
        },
      },
    });
  } catch (error: any) {
    console.error("Error verifying user email:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying user email",
      error: error.message,
    });
  }
};
