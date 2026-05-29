import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_VERIFY_SECRET = process.env.JWT_VERIFY_SECRET;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET;

export type TokenType = "auth" | "email-verification" | "password-reset";

interface AuthPayload {
  id: string;
  type: TokenType;
}

interface VerificationPayload {
  userId: string;
  type: TokenType;
}

type TokenPayload = AuthPayload | VerificationPayload;

// Single generate function
export const generateToken = (
  userId: string,
  type: TokenType = "auth",
  expiresIn: jwt.SignOptions["expiresIn"] = "1d",
): string => {
  let secret: string;
  let payload: TokenPayload;

  switch (type) {
    case "auth":
      secret = JWT_SECRET!;
      payload = { id: userId, type };
      break;
    case "email-verification":
      secret = JWT_VERIFY_SECRET!;
      payload = { userId, type };
      expiresIn = "24h";
      break;
    case "password-reset":
      secret = JWT_RESET_SECRET!;
      payload = { userId, type };
      expiresIn = "1h";
      break;
  }

  return jwt.sign(payload, secret, { expiresIn });
};

// Single verify function
export const verifyToken = <T = TokenPayload>(
  token: string,
  type: TokenType = "auth",
): T | null => {
  try {
    let secret: string;

    switch (type) {
      case "auth":
        secret = JWT_SECRET!;
        break;
      case "email-verification":
        secret = JWT_VERIFY_SECRET!;
        break;
      case "password-reset":
        secret = JWT_RESET_SECRET!;
        break;
    }

    const decoded = jwt.verify(token, secret) as T;
    return decoded;
  } catch (error) {
    return null;
  }
};
