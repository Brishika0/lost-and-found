import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt/jwt";
import User from "../models/user.model";
import { TokenRequest } from "../types/middlewareTypes";

export const validateVerificationToken = async (
  req: TokenRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
      return;
    }

    const decoded = verifyToken<{ userId: string; type: string }>(
      token as string,
      "email-verification",
    );

    if (!decoded) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
      return;
    }

    if (decoded.type !== "email-verification") {
      res.status(400).json({
        success: false,
        message: "Invalid token type",
      });
      return;
    }

    // Check if user exists
    const user = await User.findById(decoded.userId).select("isEmailVerified");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: "Email already verified",
      });
      return;
    }

    req.tokenData = decoded;
    next();
  } catch (error) {
    console.error("Verification token validation error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid verification token",
    });
  }
};
