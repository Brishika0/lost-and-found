import { Request } from "express";
import { UserRole } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    collegeId?: string;
    name?: string;
  };
}

export interface TokenRequest extends Request {
  tokenData?: {
    userId: string;
    type: string;
  };
}
