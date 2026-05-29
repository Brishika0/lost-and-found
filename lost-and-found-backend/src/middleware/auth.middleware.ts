import { Response, NextFunction } from "express";
import User, { UserRole } from "../models/user.model";
import { verifyToken } from "../utils/jwt/jwt";
import { AuthRequest } from "../types/middlewareTypes";

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    // Authorization header
    const authHeader = req.header("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    // Cookies
    else if (req.cookies) {
      token = req.cookies.superAdminToken || req.cookies.authToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
      return;
    }

    // Verify token using your verifyToken function
    const decoded = verifyToken<{ id: string; type: string }>(token, "auth");

    if (!decoded) {
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.clearCookie("superAdminToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });

      return;
    }

    const userId = decoded.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Invalid token structure",
      });
      return;
    }

    // Superadmin (not stored in DB)
    if (userId === process.env.SUPERADMIN_EMAIL) {
      req.user = {
        _id: "superadmin",
        email: process.env.SUPERADMIN_EMAIL as string,
        role: "super_admin",
        isActive: true,
      };
      next();
      return;
    }

    // Regular User (Student/Admin)
    const user = await User.findById(userId).select("-password").lean();

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
      return;
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      collegeId: user.collegeId?.toString(),
      name: user.name,
    };

    next();
  } catch (error: any) {
    console.error("Auth error:", error);
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Role Middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
      return;
    }

    next();
  };
};
