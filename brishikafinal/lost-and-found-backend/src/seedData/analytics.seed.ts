import { Types } from "mongoose";

export const analytics = [
  // Herald College Analytics
  {
    _id: new Types.ObjectId("650000000000000000000601"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    period: "daily",
    date: new Date("2024-02-28"),
    metrics: new Map([
      ["items_reported", { count: 2, previousCount: 1, percentageChange: 100 }],
      ["items_returned", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["items_claimed", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["active_cases", { count: 4, previousCount: 3, percentageChange: 33.33 }],
      ["users_registered", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["matches_found", { count: 0, previousCount: 0, percentageChange: 0 }],
      [
        "chats_initiated",
        { count: 2, previousCount: 1, percentageChange: 100 },
      ],
      [
        "disputes_opened",
        { count: 1, previousCount: 0, percentageChange: 100 },
      ],
      [
        "disputes_resolved",
        { count: 0, previousCount: 0, percentageChange: 0 },
      ],
      [
        "comments_posted",
        { count: 4, previousCount: 2, percentageChange: 100 },
      ],
    ]),
    topCategories: [
      { category: "Laptops", count: 1 },
      { category: "ID Cards", count: 1 },
    ],
    topLocations: [
      {
        zoneId: new Types.ObjectId("650000000000000000000103"),
        zoneName: "Computer Science Lab",
        count: 1,
      },
      {
        zoneId: new Types.ObjectId("650000000000000000000102"),
        zoneName: "Student Cafeteria",
        count: 1,
      },
    ],
    userActivity: {
      activeUsers: 15,
      newUsers: 0,
      returningUsers: 15,
      totalUsers: 25,
    },
    resolutionTime: {
      average: 0,
      median: 0,
      fastest: 0,
      slowest: 0,
    },
    peakHours: [10, 11, 14, 15, 16],
    deviceStats: {
      mobile: 12,
      desktop: 3,
      tablet: 0,
    },
    generatedAt: new Date("2024-02-29T00:00:00Z"),
    expiresAt: new Date("2024-05-29T00:00:00Z"),
    createdAt: new Date("2024-02-29T00:00:00Z"),
    updatedAt: new Date("2024-02-29T00:00:00Z"),
  },
  // Islington College Analytics
  {
    _id: new Types.ObjectId("650000000000000000000602"),
    collegeId: new Types.ObjectId("650000000000000000000002"),
    period: "daily",
    date: new Date("2024-03-05"),
    metrics: new Map([
      ["items_reported", { count: 1, previousCount: 0, percentageChange: 100 }],
      ["items_returned", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["items_claimed", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["active_cases", { count: 2, previousCount: 1, percentageChange: 100 }],
      ["users_registered", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["matches_found", { count: 0, previousCount: 0, percentageChange: 0 }],
      [
        "chats_initiated",
        { count: 1, previousCount: 0, percentageChange: 100 },
      ],
      [
        "disputes_opened",
        { count: 1, previousCount: 0, percentageChange: 100 },
      ],
      [
        "disputes_resolved",
        { count: 0, previousCount: 0, percentageChange: 0 },
      ],
      ["comments_posted", { count: 0, previousCount: 0, percentageChange: 0 }],
    ]),
    topCategories: [{ category: "Bags", count: 1 }],
    topLocations: [
      {
        zoneId: new Types.ObjectId("650000000000000000000105"),
        zoneName: "Sports Complex",
        count: 1,
      },
    ],
    userActivity: {
      activeUsers: 8,
      newUsers: 0,
      returningUsers: 8,
      totalUsers: 10,
    },
    resolutionTime: {
      average: 0,
      median: 0,
      fastest: 0,
      slowest: 0,
    },
    peakHours: [10, 11, 15, 16],
    deviceStats: {
      mobile: 6,
      desktop: 2,
      tablet: 0,
    },
    generatedAt: new Date("2024-03-06T00:00:00Z"),
    expiresAt: new Date("2024-06-06T00:00:00Z"),
    createdAt: new Date("2024-03-06T00:00:00Z"),
    updatedAt: new Date("2024-03-06T00:00:00Z"),
  },
];
