import { Request, Response } from "express";
import speakeasy from "speakeasy";
import { generateToken } from "../../utils/jwt/jwt";

interface SuperAdminLoginBody {
  email: string;
  password: string;
  totp: string;
}

export const superAdminLogin = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { email, password, totp } = req.body as SuperAdminLoginBody;

  try {
    // Email check
    if (email !== process.env.SUPERADMIN_EMAIL) {
      return res.status(401).json({
        error: "Invalid email",
      });
    }

    // Password check
    if (password !== process.env.SUPERADMIN_PASSWORD) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }

    // Verify TOTP
    const isTotpValid = speakeasy.totp.verify({
      secret: process.env.SUPERADMIN_TOTP_SECRET as string,
      encoding: "base32",
      token: totp,
      window: 1,
    });

    if (!isTotpValid) {
      return res.status(401).json({
        error: "Invalid TOTP code",
      });
    }

    // Generate JWT
    const token = generateToken(process.env.SUPERADMIN_EMAIL as string);

    return res
      .cookie("superAdminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Superadmin login successful",
        superAdmin: {
          email,
          role: "super_admin",
        },
      });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};
