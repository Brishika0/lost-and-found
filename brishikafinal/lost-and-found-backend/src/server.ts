import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./db";

import "./models/comment.model"; // Register Comment first
import "./models/user.model";
import "./models/college.model";
import "./models/lostItem.modal"; // LostItem depends on Comment
import "./models/conversation.modal";

// Routes
import authRoutes from "./routes/auth.routes";
import collegeRoutes from "./routes/colleges.routes";
import usersRoute from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";
import lostItemRoutes from "./routes/lostItem.routes";
import zoneRoutes from "./routes/zone.routes";
import conversationRoutes from "./routes/conversation.routes";
import webhookRoutes from "./routes/webhook.routes";

import notificationsRoutes from "./routes/notification.routes";
import disputesRoutes from "./routes/dispute.routes";
import statsRoutes from "./routes/stats.routes";
import rewardRoutes from "./routes/reward.routes";
import couponRoutes from "./routes/coupon.routes";

const app = express();

connectDB();

app.use(express.json());

// Middleware
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      `${process.env.CORS_ORIGIN_ONE}`,
      `${process.env.CORS_ORIGIN_TWO}`,
      `${process.env.CORS_ORIGIN_THREE}`,
      `${process.env.CORS_ORIGIN_FOUR}`,
    ],
    credentials: true,
  }),
);

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`,
  );
  next();
});

// Test API Route
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Backend + MongoDB connected!" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/users", usersRoute);
app.use("/api/lost-items", lostItemRoutes);
app.use("/api", commentRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/webhooks", webhookRoutes);

app.use("/api/notifications", notificationsRoutes);
app.use("/api/disputes", disputesRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/coupons", couponRoutes);

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running! Welcome to the Lost and Found backend.");
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
