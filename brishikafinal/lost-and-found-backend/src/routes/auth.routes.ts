import express from "express";
import {
  Login,
  Register,
  Logout,
  GetMe,
  VerifyCollegeEmail,
  ForgotPassword,
  ResetPassword,
  ChangePassword,
  VerifyEmail,
  ResendVerificationEmail,
} from "../controller/auth/auth.controller";
import { auth } from "../middleware/auth.middleware";
import { validateResetToken } from "../middleware/resetToken.middleware";
import { validateVerificationToken } from "../middleware/emailVerification.middleware";
import { superAdminLogin } from "../controller/auth/superadmin.controller";

const router = express.Router();

router.post("/superadmin/login", superAdminLogin);

//  PUBLIC ROUTES
router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);
router.post("/verify-email", VerifyCollegeEmail);
router.post("/forgot-password", ForgotPassword);

router.post("/reset-password", validateResetToken, ResetPassword);
router.post("/verify-email/:token", validateVerificationToken, VerifyEmail);

//  PROTECTED ROUTES
router.get("/me", auth, GetMe);
router.post("/change-password", auth, ChangePassword);
router.post("/resend-verification", auth, ResendVerificationEmail);

export default router;
