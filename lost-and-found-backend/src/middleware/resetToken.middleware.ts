import { Response, NextFunction } from "express";
import User from "../models/user.model";
import { verifyToken } from "../utils/jwt/jwt";
import { TokenRequest } from "../types/middlewareTypes";

export const validateResetToken = async (
  req: TokenRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
      return;
    }

    const decoded = verifyToken<{ userId: string; type: string }>(
      token,
      "password-reset",
    );

    if (!decoded) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
      return;
    }

    if (decoded.type !== "password-reset") {
      res.status(400).json({
        success: false,
        message: "Invalid token type",
      });
      return;
    }

    // Check if user exists
    const user = await User.findById(decoded.userId).select("isActive");

    if (!user) {
      res.status(404).json({
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

    req.tokenData = decoded;
    next();
  } catch (error) {
    console.error("Reset token validation error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid reset token",
    });
  }
};
