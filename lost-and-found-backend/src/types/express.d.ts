import { Request } from "express";
import { UserDocument } from "../models/User";

export interface SuperAdminUser {
  email: string;
  role: "superadmin";
}

export interface SuperAdminRequest extends Request {
  user?: SuperAdminUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export {};
