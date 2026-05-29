import { Request, Response } from "express";
import { generateToken } from "../../utils/jwt/jwt";
import { sendEmail, emailTemplates } from "../../services/email.service";
import User from "../../models/user.model";
import College from "../../models/college.model";
import { AuthRequest, TokenRequest } from "../../types/middlewareTypes";

// LOGIN
export const Login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Extract domain from email
    const domain = normalizedEmail.split("@")[1];

    // Find college by domain
    const college = await College.findOne({
      domain: domain,
      isActive: true,
    });

    if (!college) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail }).populate(
      "collegeId",
      "name domain logo shortName",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify user belongs to the college
    if (
      !user.collegeId ||
      user.collegeId._id.toString() !== college._id.toString()
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact your college admin.",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate new verification token
      const verifyToken = generateToken(
        user._id.toString(),
        "email-verification",
      );

      // Send verification email
      await sendEmail({
        to: user.email,
        ...emailTemplates.verifyEmail(user.name, verifyToken),
      });

      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in. A new verification link has been sent to your email.",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Prepare response data
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      college: {
        id: college._id,
        name: college.name,
        shortName: college.shortName,
        domain: college.domain,
        logo: college.logo?.url,
      },
    };

    // Set cookie and send response
    return res
      .cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: userData,
      });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// REGISTER
export const Register = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { name, email, password } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Extract domain from email
    const domain = normalizedEmail.split("@")[1];

    // Find college by domain
    const college = await College.findOne({
      domain: domain,
      // isActive: true,
    });

    if (college && !college.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "The college associated with this email is currently inactive. Please contact support for assistance.",
      });
    }

    if (!college) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid college email. Please use your college email address.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Hash password
    const hashedPassword = await User.hashPassword(password);

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      collegeId: college._id,
      isActive: true,
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

    await newUser.save();

    // Generate email verification token
    const verifyToken = generateToken(
      newUser._id.toString(),
      "email-verification",
    );

    // Send verification email
    await sendEmail({
      to: newUser.email,
      ...emailTemplates.verifyEmail(newUser.name, verifyToken),
    });

    // Send welcome email
    await sendEmail({
      to: newUser.email,
      ...emailTemplates.welcome(newUser.name, college.name),
    });

    // Prepare response data
    const userData = {
      email: newUser.email,
      name: newUser.name,
      college: {
        name: college.name,
        shortName: college.shortName,
      },
    };

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: userData,
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// LOGOUT
export const Logout = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
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

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// GET CURRENT USER
export const GetMe = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (user.role === "super_admin") {
      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: {
          email: user.email,
          role: user.role,
          isSuperAdmin: true,
        },
      });
    }

    const fullUser = await User.findById(user._id)
      .populate("collegeId", "name shortName domain logo location")
      .select("-password");

    if (!fullUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const college = fullUser.collegeId as any;

    const userData = {
      id: fullUser._id,
      email: fullUser.email,
      name: fullUser.name,
      role: fullUser.role,
      avatar: fullUser.avatar,
      isEmailVerified: fullUser.isEmailVerified,
      college: college
        ? {
            id: college._id,
            name: college.name,
            shortName: college.shortName,
            domain: college.domain,
            logo: college.logo?.url,
          }
        : null,
      chatPrivacy: fullUser.chatPrivacy,
      notificationPreferences: fullUser.notificationPreferences,
      lastActive: fullUser.lastActive,
      createdAt: fullUser.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: userData,
    });
  } catch (error: any) {
    console.error("GetMe error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// VERIFY EMAIL DOMAIN
export const VerifyCollegeEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const domain = email.split("@")[1];

    const college = await College.findOne({
      domain: domain,
      isActive: true,
    }).select("name shortName domain logo");

    if (!college) {
      return res.status(400).json({
        success: false,
        message: "Invalid college email domain",
      });
    }

    return res.status(200).json({
      success: true,
      message: "College email verified successfully",
      data: {
        valid: true,
        college: {
          name: college.name,
          shortName: college.shortName,
          domain: college.domain,
          logo: college.logo?.url,
        },
      },
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// FORGOT PASSWORD
export const ForgotPassword = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // User doesn't exist - return clear message
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    // User exists but is inactive
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact support.",
      });
    }

    // Generate reset token
    const resetToken = generateToken(user._id.toString(), "password-reset");

    // Send reset email
    await sendEmail({
      to: user.email,
      ...emailTemplates.resetPassword(user.name, resetToken),
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// RESET PASSWORD - Uses TokenRequest middleware
export const ResetPassword = async (
  req: TokenRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { newPassword } = req.body;
    const tokenData = req.tokenData;

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(tokenData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact your college admin.",
      });
    }

    // Hash new password
    const hashedPassword = await User.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      ...emailTemplates.passwordChanged(user.name),
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// CHANGE PASSWORD
export const ChangePassword = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await User.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      ...emailTemplates.passwordChanged(user.name),
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// VERIFY EMAIL - Uses TokenRequest middleware
export const VerifyEmail = async (
  req: TokenRequest,
  res: Response,
): Promise<Response> => {
  try {
    const tokenData = req.tokenData;

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    const user = await User.findById(tokenData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    // Send verification confirmation email
    await sendEmail({
      to: user.email,
      ...emailTemplates.emailVerified(user.name),
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// RESEND VERIFICATION EMAIL
export const ResendVerificationEmail = async (
  req: AuthRequest,
  res: Response,
): Promise<Response> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Generate new verification token
    const verifyToken = generateToken(
      user._id.toString(),
      "email-verification",
    );

    // Send verification email
    await sendEmail({
      to: user.email,
      ...emailTemplates.verifyEmail(user.name, verifyToken),
    });

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
