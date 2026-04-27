import { Types } from "mongoose";

export const analytics = [
  // Herald College - Daily report for Feb 15
  {
    _id: new Types.ObjectId("650000000000000000000701"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    period: "daily",
    date: new Date("2024-02-15"),
    metrics: new Map([
      ["items_reported", { count: 2, previousCount: 1, percentageChange: 100 }],
      ["items_returned", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["items_claimed", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["active_cases", { count: 3, previousCount: 2, percentageChange: 50 }],
      ["users_registered", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["matches_found", { count: 0, previousCount: 0, percentageChange: 0 }],
      [
        "chats_initiated",
        { count: 1, previousCount: 0, percentageChange: 100 },
      ],
      ["disputes_opened", { count: 0, previousCount: 0, percentageChange: 0 }],
      [
        "disputes_resolved",
        { count: 0, previousCount: 0, percentageChange: 0 },
      ],
      [
        "comments_posted",
        { count: 3, previousCount: 1, percentageChange: 200 },
      ],
    ]),
    topCategories: [
      { category: "Laptops", count: 1 },
      { category: "Electronics", count: 1 },
      { category: "ID Cards", count: 1 },
    ],
    topLocations: [
      {
        zoneId: new Types.ObjectId("650000000000000000000101"),
        zoneName: "Main Building",
        count: 1,
      },
      {
        zoneId: new Types.ObjectId("650000000000000000000102"),
        zoneName: "Central Library",
        count: 1,
      },
      {
        zoneId: new Types.ObjectId("650000000000000000000103"),
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
    generatedAt: new Date("2024-02-16T00:00:00Z"),
    expiresAt: new Date("2024-05-16T00:00:00Z"),
  },

  // Herald College - Daily report for Feb 16
  {
    _id: new Types.ObjectId("650000000000000000000702"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    period: "daily",
    date: new Date("2024-02-16"),
    metrics: new Map([
      ["items_reported", { count: 1, previousCount: 2, percentageChange: -50 }],
      ["items_returned", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["items_claimed", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["active_cases", { count: 4, previousCount: 3, percentageChange: 33.33 }],
      ["users_registered", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["matches_found", { count: 1, previousCount: 0, percentageChange: 100 }],
      ["chats_initiated", { count: 1, previousCount: 1, percentageChange: 0 }],
      ["disputes_opened", { count: 0, previousCount: 0, percentageChange: 0 }],
      [
        "disputes_resolved",
        { count: 0, previousCount: 0, percentageChange: 0 },
      ],
      [
        "comments_posted",
        { count: 1, previousCount: 3, percentageChange: -66.67 },
      ],
    ]),
    topCategories: [{ category: "Electronics", count: 1 }],
    topLocations: [
      {
        zoneId: new Types.ObjectId("650000000000000000000102"),
        zoneName: "Central Library",
        count: 1,
      },
    ],
    userActivity: {
      activeUsers: 18,
      newUsers: 0,
      returningUsers: 18,
      totalUsers: 25,
    },
    resolutionTime: {
      average: 0,
      median: 0,
      fastest: 0,
      slowest: 0,
    },
    peakHours: [9, 10, 14, 15],
    deviceStats: {
      mobile: 14,
      desktop: 4,
      tablet: 0,
    },
    generatedAt: new Date("2024-02-17T00:00:00Z"),
    expiresAt: new Date("2024-05-17T00:00:00Z"),
  },

  // Herald College - Daily report for Feb 17
  {
    _id: new Types.ObjectId("650000000000000000000703"),
    collegeId: new Types.ObjectId("650000000000000000000001"),
    period: "daily",
    date: new Date("2024-02-17"),
    metrics: new Map([
      [
        "items_reported",
        { count: 0, previousCount: 1, percentageChange: -100 },
      ],
      ["items_returned", { count: 1, previousCount: 0, percentageChange: 100 }],
      ["items_claimed", { count: 1, previousCount: 0, percentageChange: 100 }],
      ["active_cases", { count: 3, previousCount: 4, percentageChange: -25 }],
      ["users_registered", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["matches_found", { count: 0, previousCount: 1, percentageChange: -100 }],
      ["chats_initiated", { count: 1, previousCount: 1, percentageChange: 0 }],
      [
        "disputes_opened",
        { count: 1, previousCount: 0, percentageChange: 100 },
      ],
      [
        "disputes_resolved",
        { count: 1, previousCount: 0, percentageChange: 100 },
      ],
      [
        "comments_posted",
        { count: 4, previousCount: 1, percentageChange: 300 },
      ],
    ]),
    topCategories: [{ category: "ID Cards", count: 1 }],
    topLocations: [
      {
        zoneId: new Types.ObjectId("650000000000000000000103"),
        zoneName: "Student Cafeteria",
        count: 1,
      },
    ],
    userActivity: {
      activeUsers: 22,
      newUsers: 0,
      returningUsers: 22,
      totalUsers: 25,
    },
    resolutionTime: {
      average: 4.5,
      median: 4.5,
      fastest: 4,
      slowest: 5,
    },
    peakHours: [9, 10, 11, 12, 13, 14],
    deviceStats: {
      mobile: 18,
      desktop: 4,
      tablet: 0,
    },
    generatedAt: new Date("2024-02-18T00:00:00Z"),
    expiresAt: new Date("2024-05-18T00:00:00Z"),
  },

  // Islington College - Daily report for Feb 19
  {
    _id: new Types.ObjectId("650000000000000000000704"),
    collegeId: new Types.ObjectId("650000000000000000000002"),
    period: "daily",
    date: new Date("2024-02-19"),
    metrics: new Map([
      ["items_reported", { count: 1, previousCount: 1, percentageChange: 0 }],
      ["items_returned", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["items_claimed", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["active_cases", { count: 2, previousCount: 1, percentageChange: 100 }],
      ["users_registered", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["matches_found", { count: 0, previousCount: 0, percentageChange: 0 }],
      [
        "chats_initiated",
        { count: 1, previousCount: 0, percentageChange: 100 },
      ],
      ["disputes_opened", { count: 0, previousCount: 0, percentageChange: 0 }],
      [
        "disputes_resolved",
        { count: 0, previousCount: 0, percentageChange: 0 },
      ],
      [
        "comments_posted",
        { count: 2, previousCount: 0, percentageChange: 100 },
      ],
    ]),
    topCategories: [{ category: "Bags", count: 1 }],
    topLocations: [
      {
        zoneId: new Types.ObjectId("650000000000000000000105"),
        zoneName: "Computer Labs",
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
    generatedAt: new Date("2024-02-20T00:00:00Z"),
    expiresAt: new Date("2024-05-20T00:00:00Z"),
  },

  // IIC - Daily report for Feb 20-21
  {
    _id: new Types.ObjectId("650000000000000000000705"),
    collegeId: new Types.ObjectId("650000000000000000000003"),
    period: "daily",
    date: new Date("2024-02-20"),
    metrics: new Map([
      ["items_reported", { count: 1, previousCount: 0, percentageChange: 100 }],
      ["items_returned", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["items_claimed", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["active_cases", { count: 1, previousCount: 0, percentageChange: 100 }],
      ["users_registered", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["matches_found", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["chats_initiated", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["disputes_opened", { count: 0, previousCount: 0, percentageChange: 0 }],
      [
        "disputes_resolved",
        { count: 0, previousCount: 0, percentageChange: 0 },
      ],
      ["comments_posted", { count: 0, previousCount: 0, percentageChange: 0 }],
    ]),
    topCategories: [{ category: "Books", count: 1 }],
    topLocations: [
      {
        zoneId: new Types.ObjectId("650000000000000000000106"),
        zoneName: "Main Academic Building",
        count: 1,
      },
    ],
    userActivity: {
      activeUsers: 5,
      newUsers: 0,
      returningUsers: 5,
      totalUsers: 7,
    },
    resolutionTime: {
      average: 0,
      median: 0,
      fastest: 0,
      slowest: 0,
    },
    peakHours: [9, 10, 14],
    deviceStats: {
      mobile: 4,
      desktop: 1,
      tablet: 0,
    },
    generatedAt: new Date("2024-02-21T00:00:00Z"),
    expiresAt: new Date("2024-05-21T00:00:00Z"),
  },
  {
    _id: new Types.ObjectId("650000000000000000000706"),
    collegeId: new Types.ObjectId("650000000000000000000003"),
    period: "daily",
    date: new Date("2024-02-21"),
    metrics: new Map([
      ["items_reported", { count: 1, previousCount: 1, percentageChange: 0 }],
      ["items_returned", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["items_claimed", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["active_cases", { count: 2, previousCount: 1, percentageChange: 100 }],
      ["users_registered", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["matches_found", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["chats_initiated", { count: 0, previousCount: 0, percentageChange: 0 }],
      ["disputes_opened", { count: 0, previousCount: 0, percentageChange: 0 }],
      [
        "disputes_resolved",
        { count: 0, previousCount: 0, percentageChange: 0 },
      ],
      ["comments_posted", { count: 0, previousCount: 0, percentageChange: 0 }],
    ]),
    topCategories: [{ category: "Accessories", count: 1 }],
    topLocations: [
      {
        zoneId: new Types.ObjectId("650000000000000000000108"),
        zoneName: "Sports Complex",
        count: 1,
      },
    ],
    userActivity: {
      activeUsers: 6,
      newUsers: 0,
      returningUsers: 6,
      totalUsers: 7,
    },
    resolutionTime: {
      average: 0,
      median: 0,
      fastest: 0,
      slowest: 0,
    },
    peakHours: [15, 16, 17],
    deviceStats: {
      mobile: 5,
      desktop: 1,
      tablet: 0,
    },
    generatedAt: new Date("2024-02-22T00:00:00Z"),
    expiresAt: new Date("2024-05-22T00:00:00Z"),
  },
];
