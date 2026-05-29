import mongoose, { Schema, Document, Model } from "mongoose";

export type AnalyticsPeriod = "daily" | "weekly" | "monthly" | "yearly";
export type AnalyticsMetric =
  | "items_reported"
  | "items_returned"
  | "items_claimed"
  | "active_cases"
  | "users_registered"
  | "matches_found"
  | "chats_initiated"
  | "disputes_opened"
  | "disputes_resolved"
  | "comments_posted";

export interface IAnalytics extends Document {
  collegeId?: mongoose.Types.ObjectId; // null for system-wide
  period: AnalyticsPeriod;
  date: Date; // Start date of the period
  metrics: Map<
    string,
    {
      count: number;
      previousCount?: number;
      percentageChange?: number;
      details?: any;
    }
  >;
  topCategories?: Array<{
    category: string;
    count: number;
  }>;
  topLocations?: Array<{
    zoneId: mongoose.Types.ObjectId;
    zoneName: string;
    count: number;
  }>;
  userActivity?: {
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
    totalUsers: number;
  };
  resolutionTime?: {
    average: number; // in hours
    median: number;
    fastest: number;
    slowest: number;
  };
  peakHours?: number[]; // Hours with most activity (0-23)
  deviceStats?: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  metadata?: Map<string, any>;
  generatedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalyticsMethods {
  calculatePercentageChanges(): void;
  updateMetric(
    metricName: AnalyticsMetric,
    count: number,
    details?: any,
  ): Promise<IAnalytics>;
}

export interface IAnalyticsModel extends Model<
  IAnalytics,
  {},
  IAnalyticsMethods
> {
  getLatestForCollege(
    collegeId: string,
    period: AnalyticsPeriod,
  ): Promise<IAnalytics | null>;
  getSystemWide(period: AnalyticsPeriod): Promise<IAnalytics | null>;
  generateDailyReport(collegeId?: string): Promise<IAnalytics>;
  getDateRangeReport(
    collegeId: string | null,
    startDate: Date,
    endDate: Date,
    period: AnalyticsPeriod,
  ): Promise<IAnalytics[]>;
}

const analyticsSchema = new Schema<
  IAnalytics,
  IAnalyticsModel,
  IAnalyticsMethods
>(
  {
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      index: true,
      sparse: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    metrics: {
      type: Map,
      of: {
        count: { type: Number, default: 0 },
        previousCount: Number,
        percentageChange: Number,
        details: Schema.Types.Mixed,
      },
      default: {},
    },
    topCategories: [
      {
        category: String,
        count: Number,
      },
    ],
    topLocations: [
      {
        zoneId: { type: Schema.Types.ObjectId, ref: "Zone" },
        zoneName: String,
        count: Number,
      },
    ],
    userActivity: {
      activeUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      returningUsers: { type: Number, default: 0 },
      totalUsers: { type: Number, default: 0 },
    },
    resolutionTime: {
      average: Number,
      median: Number,
      fastest: Number,
      slowest: Number,
    },
    peakHours: [Number],
    deviceStats: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for unique combination
analyticsSchema.index({ collegeId: 1, period: 1, date: 1 }, { unique: true });

// Methods
analyticsSchema.methods.calculatePercentageChanges = function (
  this: IAnalytics,
): void {
  this.metrics.forEach((value, key) => {
    if (value.previousCount !== undefined && value.previousCount > 0) {
      value.percentageChange =
        ((value.count - value.previousCount) / value.previousCount) * 100;
    } else {
      value.percentageChange = value.count > 0 ? 100 : 0;
    }
  });
};

analyticsSchema.methods.updateMetric = async function (
  metricName: AnalyticsMetric,
  count: number,
  details?: any,
): Promise<IAnalytics> {
  const metric = this.metrics.get(metricName) || { count: 0 };
  const previousCount = metric.count;

  this.metrics.set(metricName, {
    count,
    previousCount,
    details,
  });

  this.calculatePercentageChanges();
  return this.save();
};

// Statics
analyticsSchema.statics.getLatestForCollege = async function (
  collegeId: string,
  period: AnalyticsPeriod,
): Promise<IAnalytics | null> {
  return this.findOne({
    collegeId: new mongoose.Types.ObjectId(collegeId),
    period,
  })
    .sort({ date: -1 })
    .limit(1);
};

analyticsSchema.statics.getSystemWide = async function (
  period: AnalyticsPeriod,
): Promise<IAnalytics | null> {
  return this.findOne({
    collegeId: null,
    period,
  })
    .sort({ date: -1 })
    .limit(1);
};

analyticsSchema.statics.getDateRangeReport = async function (
  collegeId: string | null,
  startDate: Date,
  endDate: Date,
  period: AnalyticsPeriod,
): Promise<IAnalytics[]> {
  const query: any = {
    period,
    date: { $gte: startDate, $lte: endDate },
  };

  if (collegeId) {
    query.collegeId = new mongoose.Types.ObjectId(collegeId);
  } else {
    query.collegeId = null;
  }

  return this.find(query).sort({ date: 1 });
};

analyticsSchema.statics.generateDailyReport = async function (
  collegeId?: string,
): Promise<IAnalytics> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const query: any = {};
  if (collegeId) {
    query.collegeId = new mongoose.Types.ObjectId(collegeId);
  }

  // Get counts from various collections
  const LostItem = mongoose.model("LostItem");
  const User = mongoose.model("User");
  const Chat = mongoose.model("Chat");
  const Comment = mongoose.model("Comment");
  const Dispute = mongoose.model("Dispute");
  const Zone = mongoose.model("Zone");

  // Fetch data in parallel
  const [
    itemsReportedToday,
    itemsReturnedToday,
    itemsClaimedToday,
    activeCases,
    usersRegisteredToday,
    chatsInitiated,
    commentsPosted,
    disputesOpened,
    disputesResolved,
    topCategories,
    topLocations,
    totalUsers,
    activeUsers,
  ] = await Promise.all([
    // Items reported today
    LostItem.countDocuments({
      ...query,
      dateReported: { $gte: today },
    }),

    // Items returned today
    LostItem.countDocuments({
      ...query,
      status: "returned",
      dateReturned: { $gte: today },
    }),

    // Items claimed today
    LostItem.countDocuments({
      ...query,
      status: "claimed",
      dateClaimed: { $gte: today },
    }),

    // Active cases
    LostItem.countDocuments({
      ...query,
      status: { $in: ["lost", "found"] },
      isActive: true,
    }),

    // Users registered today
    User.countDocuments({
      ...(collegeId
        ? { collegeId: new mongoose.Types.ObjectId(collegeId) }
        : {}),
      createdAt: { $gte: today },
    }),

    // Chats initiated today
    Chat.countDocuments({
      ...(collegeId
        ? { collegeId: new mongoose.Types.ObjectId(collegeId) }
        : {}),
      createdAt: { $gte: today },
    }),

    // Comments posted today
    Comment.countDocuments({
      createdAt: { $gte: today },
    }),

    // Disputes opened today
    Dispute.countDocuments({
      ...(collegeId
        ? { collegeId: new mongoose.Types.ObjectId(collegeId) }
        : {}),
      createdAt: { $gte: today },
    }),

    // Disputes resolved today
    Dispute.countDocuments({
      ...(collegeId
        ? { collegeId: new mongoose.Types.ObjectId(collegeId) }
        : {}),
      status: "resolved",
      "resolution.resolvedAt": { $gte: today },
    }),

    // Top categories
    LostItem.aggregate([
      { $match: { ...query, dateReported: { $gte: lastWeek } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { category: "$_id", count: 1, _id: 0 } },
    ]),

    // Top locations (by zone)
    LostItem.aggregate([
      {
        $match: {
          ...query,
          dateReported: { $gte: lastWeek },
          zoneId: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: "zones",
          localField: "zoneId",
          foreignField: "_id",
          as: "zone",
        },
      },
      { $unwind: "$zone" },
      {
        $group: {
          _id: "$zoneId",
          zoneName: { $first: "$zone.name" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          zoneId: "$_id",
          zoneName: 1,
          count: 1,
          _id: 0,
        },
      },
    ]),

    // Total users
    User.countDocuments({
      ...(collegeId
        ? { collegeId: new mongoose.Types.ObjectId(collegeId) }
        : {}),
    }),

    // Active users (last 7 days)
    User.countDocuments({
      ...(collegeId
        ? { collegeId: new mongoose.Types.ObjectId(collegeId) }
        : {}),
      lastActive: { $gte: lastWeek },
    }),
  ]);

  // Get previous day's analytics for comparison
  const previousReport = await this.findOne({
    collegeId: collegeId ? new mongoose.Types.ObjectId(collegeId) : null,
    period: "daily",
    date: yesterday,
  });

  // Create or update the report
  const report = await this.findOneAndUpdate(
    {
      collegeId: collegeId ? new mongoose.Types.ObjectId(collegeId) : null,
      period: "daily",
      date: today,
    },
    {
      $set: {
        generatedAt: new Date(),
        metrics: {
          items_reported: {
            count: itemsReportedToday,
            previousCount:
              previousReport?.metrics?.get("items_reported")?.count || 0,
          },
          items_returned: {
            count: itemsReturnedToday,
            previousCount:
              previousReport?.metrics?.get("items_returned")?.count || 0,
          },
          items_claimed: {
            count: itemsClaimedToday,
            previousCount:
              previousReport?.metrics?.get("items_claimed")?.count || 0,
          },
          active_cases: {
            count: activeCases,
            previousCount:
              previousReport?.metrics?.get("active_cases")?.count || 0,
          },
          users_registered: {
            count: usersRegisteredToday,
            previousCount:
              previousReport?.metrics?.get("users_registered")?.count || 0,
          },
          matches_found: {
            count: 0, // Will be implemented with matching algorithm
            previousCount:
              previousReport?.metrics?.get("matches_found")?.count || 0,
          },
          chats_initiated: {
            count: chatsInitiated,
            previousCount:
              previousReport?.metrics?.get("chats_initiated")?.count || 0,
          },
          disputes_opened: {
            count: disputesOpened,
            previousCount:
              previousReport?.metrics?.get("disputes_opened")?.count || 0,
          },
          disputes_resolved: {
            count: disputesResolved,
            previousCount:
              previousReport?.metrics?.get("disputes_resolved")?.count || 0,
          },
          comments_posted: {
            count: commentsPosted,
            previousCount:
              previousReport?.metrics?.get("comments_posted")?.count || 0,
          },
        },
        topCategories,
        topLocations,
        userActivity: {
          activeUsers,
          newUsers: usersRegisteredToday,
          returningUsers: activeUsers - usersRegisteredToday,
          totalUsers,
        },
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  // Calculate percentage changes
  report.calculatePercentageChanges();
  await report.save();

  return report;
};

const Analytics = mongoose.model<IAnalytics, IAnalyticsModel>(
  "Analytics",
  analyticsSchema,
);
export default Analytics;
