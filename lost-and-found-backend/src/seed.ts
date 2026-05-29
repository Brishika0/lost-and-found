import mongoose from "mongoose";
import dotenv from "dotenv";

// Import all seed data
import { colleges } from "./seedData/colleges.seed";
import { lostItems } from "./seedData/lostItems.seed";
import { comments } from "./seedData/comments.seed";
import { notifications } from "./seedData/notifications.seed";
import { disputes } from "./seedData/disputes.seed";
import { analytics } from "./seedData/analytics.seed";
import { zones } from "./seedData/zones.seed";
import { users } from "./seedData/users.seed";

// Import all models
import College from "./models/college.model";
import User from "./models/user.model";
import Comment from "./models/comment.model";
import Zone from "./models/campusZone.modal";
import LostItem from "./models/lostItem.modal";
import Chat from "./models/conversation.modal";
import Dispute from "./models/dispute.modal";
import Analytics from "./models/analytics.modal";
import NotificationModel from "./models/notification.modal";

dotenv.config();

const seedDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("❌ MongoDB URI not found");
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      College.deleteMany({}),
      User.deleteMany({}),
      Zone.deleteMany({}),
      LostItem.deleteMany({}),
      Comment.deleteMany({}),
      Chat.deleteMany({}),
      NotificationModel.deleteMany({}),
      Dispute.deleteMany({}),
      Analytics.deleteMany({}),
    ]);
    console.log("✅ All collections cleared\n");

    // 1. Insert Colleges
    console.log("📚 Seeding colleges...");
    const createdColleges = await College.insertMany(colleges);
    console.log(`✅ Inserted ${createdColleges.length} colleges\n`);

    // 2. Insert Users (password will be auto-hashed by pre-save hook)
    console.log("👤 Seeding users...");
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Inserted ${createdUsers.length} users`);

    // Update college adminIds
    for (const user of createdUsers) {
      if (user.role === "college_admin" && user.collegeId) {
        await College.findByIdAndUpdate(user.collegeId, {
          $addToSet: { adminIds: user._id },
        });
      }
    }
    console.log("✅ Updated college admins\n");

    // 3. Insert Zones
    console.log("📍 Seeding campus zones...");
    const createdZones = await Zone.insertMany(zones);
    console.log(`✅ Inserted ${createdZones.length} zones\n`);

    // 4. Insert LostItems
    console.log("🔍 Seeding lost & found items...");
    const createdItems = await LostItem.insertMany(lostItems);
    console.log(`✅ Inserted ${createdItems.length} items\n`);

    // 5. Insert Comments
    console.log("💬 Seeding comments...");
    const createdComments = await Comment.insertMany(comments);
    console.log(`✅ Inserted ${createdComments.length} comments\n`);

    // 6. Insert Chats
    // console.log("💭 Seeding chats...");
    // const createdChats = await Chat.insertMany(chats);
    // console.log(`✅ Inserted ${createdChats.length} chats\n`);

    // 7. Insert Notifications
    console.log("🔔 Seeding notifications...");
    const createdNotifications =
      await NotificationModel.insertMany(notifications);
    console.log(`✅ Inserted ${createdNotifications.length} notifications\n`);

    // 8. Insert Disputes
    console.log("⚖️ Seeding disputes...");
    const createdDisputes = await Dispute.insertMany(disputes);
    console.log(`✅ Inserted ${createdDisputes.length} disputes\n`);

    // 9. Insert Analytics
    console.log("📊 Seeding analytics...");
    const createdAnalytics = await Analytics.insertMany(analytics);
    console.log(`✅ Inserted ${createdAnalytics.length} analytics records\n`);

    // Summary
    console.log("=".repeat(50));
    console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log(`📚 Colleges: ${createdColleges.length}`);
    console.log(`👤 Users: ${createdUsers.length}`);
    console.log(`📍 Zones: ${createdZones.length}`);
    console.log(`🔍 Lost Items: ${createdItems.length}`);
    console.log(`💬 Comments: ${createdComments.length}`);
    console.log(`🔔 Notifications: ${createdNotifications.length}`);
    console.log(`⚖️ Disputes: ${createdDisputes.length}`);
    console.log(`📊 Analytics: ${createdAnalytics.length}`);
    console.log("=".repeat(50));

    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed error:", error);

    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");

    process.exit(1);
  }
};

seedDatabase();
