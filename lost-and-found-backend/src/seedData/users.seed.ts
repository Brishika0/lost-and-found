import { Types } from "mongoose";
import bcrypt from "bcryptjs";

// Password will be "password123" for all users (hashed)
const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const users = [
  // Super Admin
  {
    _id: new Types.ObjectId("650000000000000000000010"),
    name: "System Admin",
    email: "admin@system.com",
    password: "hashedPassword",
    role: "super_admin",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  // College Admins - Herald
  {
    _id: new Types.ObjectId("650000000000000000000011"),
    name: "Ram Sharma",
    email: "ram@heraldcollege.edu.np",
    password: "hashedPassword",
    role: "college_admin",
    collegeId: new Types.ObjectId("650000000000000000000001"),
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  // College Admins - Islington
  {
    _id: new Types.ObjectId("650000000000000000000012"),
    name: "Sita Adhikari",
    email: "sita@islington.edu.np",
    password: "hashedPassword",
    role: "college_admin",
    collegeId: new Types.ObjectId("650000000000000000000002"),
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  // College Admins - Softwarica
  {
    _id: new Types.ObjectId("650000000000000000000013"),
    name: "Hari Poudel",
    email: "hari@softwarica.edu.np",
    password: "hashedPassword",
    role: "college_admin",
    collegeId: new Types.ObjectId("650000000000000000000003"),
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25"),
  },
  // Students - Herald College
  {
    _id: new Types.ObjectId("650000000000000000000021"),
    name: "Bishal Thapa",
    email: "bishal.thapa@heraldcollege.edu.np",
    password: "hashedPassword",
    role: "student",
    collegeId: new Types.ObjectId("650000000000000000000001"),
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000022"),
    name: "Shristi Karki",
    email: "shristi.karki@heraldcollege.edu.np",
    password: "hashedPassword",
    role: "student",
    collegeId: new Types.ObjectId("650000000000000000000001"),
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-02-12"),
    updatedAt: new Date("2024-02-12"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000023"),
    name: "Aayush Gurung",
    email: "aayush.gurung@heraldcollege.edu.np",
    password: "hashedPassword",
    role: "student",
    collegeId: new Types.ObjectId("650000000000000000000001"),
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  // Students - Islington College
  {
    _id: new Types.ObjectId("650000000000000000000024"),
    name: "Pragya Shrestha",
    email: "pragya@islington.edu.np",
    password: "hashedPassword",
    role: "student",
    collegeId: new Types.ObjectId("650000000000000000000002"),
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-02-18"),
    updatedAt: new Date("2024-02-18"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000025"),
    name: "Roshan KC",
    email: "roshan@islington.edu.np",
    password: "hashedPassword",
    role: "student",
    collegeId: new Types.ObjectId("650000000000000000000002"),
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },
  // Students - Softwarica College
  {
    _id: new Types.ObjectId("650000000000000000000026"),
    name: "Anjali Rai",
    email: "anjali@softwarica.edu.np",
    password: "hashedPassword",
    role: "student",
    collegeId: new Types.ObjectId("650000000000000000000003"),
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-02-22"),
    updatedAt: new Date("2024-02-22"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000027"),
    name: "Suman Bhattarai",
    email: "suman@softwarica.edu.np",
    password: "hashedPassword",
    role: "student",
    collegeId: new Types.ObjectId("650000000000000000000003"),
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    isActive: true,
    isEmailVerified: true,
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
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-02-25"),
  },
  // Inactive User
  {
    _id: new Types.ObjectId("650000000000000000000028"),
    name: "Inactive User",
    email: "inactive@heraldcollege.edu.np",
    password: "hashedPassword",
    role: "student",
    collegeId: new Types.ObjectId("650000000000000000000001"),
    avatar: null,
    isActive: false,
    isEmailVerified: false,
    lastActive: new Date("2024-01-05"),
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
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
];
