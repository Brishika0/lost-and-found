import mongoose, { Schema, Document, Model } from "mongoose";

export type DisputeType =
  | "wrongful_claim"
  | "item_damage"
  | "fake_item"
  | "harassment"
  | "communication_issue"
  | "other";

export type DisputeStatus =
  | "open"
  | "under_review"
  | "escalated"
  | "resolved"
  | "closed";

export type ResolutionType =
  | "resolved_in_favor_of_reporter"
  | "resolved_in_favor_of_other"
  | "mutual_agreement"
  | "no_action"
  | "other";

export interface IDispute extends Document {
  itemId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId; // Added for college-specific filtering
  reportedBy: mongoose.Types.ObjectId;
  reportedAgainst: mongoose.Types.ObjectId;
  type: DisputeType;
  status: DisputeStatus;
  title: string;
  description: string;
  evidence?: Array<{
    url: string;
    type: "image" | "document" | "screenshot";
    uploadedAt: Date;
  }>;
  // evidence?: IImage;
  messages: Array<{
    userId: mongoose.Types.ObjectId;
    content: string;
    isAdmin: boolean;
    attachments?: string[];
    createdAt: Date;
  }>;
  assignedAdmin?: mongoose.Types.ObjectId;
  priority: "low" | "medium" | "high" | "urgent";
  resolution?: {
    type: ResolutionType;
    description: string;
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
    actionTaken?: string;
  };
  isEscalated: boolean;
  escalatedTo?: mongoose.Types.ObjectId;
  escalatedAt?: Date;
  escalationReason?: string;
  timeoutAt?: Date;
  metadata?: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDisputeMethods {
  addMessage(
    userId: string,
    content: string,
    isAdmin?: boolean,
    attachments?: string[],
  ): Promise<IDispute>;
  escalate(reason: string, superAdminId: string): Promise<IDispute>;
  resolve(resolutionData: any): Promise<IDispute>;
  assignAdmin(adminId: string): Promise<IDispute>;
}

export interface IDisputeModel extends Model<IDispute, {}, IDisputeMethods> {
  getActiveDisputes(collegeId?: string): Promise<IDispute[]>;
  getDisputesForItem(itemId: string): Promise<IDispute[]>;
  getDisputesForUser(userId: string): Promise<IDispute[]>;
  getDisputesByCollege(collegeId: string): Promise<IDispute[]>;
}

const disputeSchema = new Schema<IDispute, IDisputeModel, IDisputeMethods>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "LostItem",
      required: true,
      index: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportedAgainst: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "wrongful_claim",
        "item_damage",
        "fake_item",
        "harassment",
        "communication_issue",
        "other",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "under_review", "escalated", "resolved", "closed"],
      default: "open",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    evidence: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "document", "screenshot"],
          required: true,
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    messages: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true },
        isAdmin: { type: Boolean, default: false },
        attachments: [String],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    assignedAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    resolution: {
      type: {
        type: String,
        enum: [
          "resolved_in_favor_of_reporter",
          "resolved_in_favor_of_other",
          "mutual_agreement",
          "no_action",
          "other",
        ],
      },
      description: String,
      resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
      resolvedAt: Date,
      actionTaken: String,
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalatedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    escalatedAt: Date,
    escalationReason: String,
    timeoutAt: Date,
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
disputeSchema.index({ collegeId: 1, status: 1, priority: -1, createdAt: 1 });
disputeSchema.index({ reportedBy: 1, status: 1 });
disputeSchema.index({ reportedAgainst: 1, status: 1 });
disputeSchema.index({ assignedAdmin: 1, status: 1 });

// Virtuals
disputeSchema.virtual("isOverdue").get(function (this: IDispute) {
  if (this.status === "resolved" || this.status === "closed") return false;
  if (!this.timeoutAt) return false;
  return new Date() > this.timeoutAt;
});

disputeSchema.virtual("item", {
  ref: "LostItem",
  localField: "itemId",
  foreignField: "_id",
  justOne: true,
});

// Methods
disputeSchema.methods.addMessage = async function (
  userId: string,
  content: string,
  isAdmin: boolean = false,
  attachments?: string[],
): Promise<IDispute> {
  this.messages.push({
    userId: new mongoose.Types.ObjectId(userId),
    content,
    isAdmin,
    attachments,
    createdAt: new Date(),
  });

  return this.save();
};

disputeSchema.methods.escalate = async function (
  reason: string,
  superAdminId: string,
): Promise<IDispute> {
  this.isEscalated = true;
  this.status = "escalated";
  this.escalatedTo = new mongoose.Types.ObjectId(superAdminId);
  this.escalatedAt = new Date();
  this.escalationReason = reason;

  return this.save();
};

disputeSchema.methods.resolve = async function (
  resolutionData: any,
): Promise<IDispute> {
  this.status = "resolved";
  this.resolution = {
    type: resolutionData.type,
    description: resolutionData.description,
    resolvedBy: new mongoose.Types.ObjectId(resolutionData.resolvedBy),
    resolvedAt: new Date(),
    actionTaken: resolutionData.actionTaken,
  };

  return this.save();
};

disputeSchema.methods.assignAdmin = async function (
  adminId: string,
): Promise<IDispute> {
  this.assignedAdmin = new mongoose.Types.ObjectId(adminId);
  this.status = "under_review";
  return this.save();
};

// Statics
disputeSchema.statics.getActiveDisputes = async function (
  collegeId?: string,
): Promise<IDispute[]> {
  const query: any = {
    status: { $in: ["open", "under_review", "escalated"] },
  };

  if (collegeId) {
    query.collegeId = new mongoose.Types.ObjectId(collegeId);
  }

  return this.find(query)
    .populate("reportedBy", "name email avatar")
    .populate("reportedAgainst", "name email avatar")
    .populate("assignedAdmin", "name email avatar")
    .populate("itemId", "itemName images")
    .sort({ priority: -1, createdAt: 1 });
};

disputeSchema.statics.getDisputesForItem = async function (
  itemId: string,
): Promise<IDispute[]> {
  return this.find({ itemId: new mongoose.Types.ObjectId(itemId) })
    .populate("reportedBy", "name email avatar")
    .populate("reportedAgainst", "name email avatar")
    .sort({ createdAt: -1 });
};

disputeSchema.statics.getDisputesForUser = async function (
  userId: string,
): Promise<IDispute[]> {
  return this.find({
    $or: [
      { reportedBy: new mongoose.Types.ObjectId(userId) },
      { reportedAgainst: new mongoose.Types.ObjectId(userId) },
    ],
  })
    .populate("itemId", "itemName")
    .populate("reportedBy", "name avatar")
    .populate("reportedAgainst", "name avatar")
    .sort({ createdAt: -1 });
};

disputeSchema.statics.getDisputesByCollege = async function (
  collegeId: string,
): Promise<IDispute[]> {
  return this.find({ collegeId: new mongoose.Types.ObjectId(collegeId) })
    .populate("reportedBy", "name email avatar")
    .populate("reportedAgainst", "name email avatar")
    .populate("assignedAdmin", "name email avatar")
    .populate("itemId", "itemName")
    .sort({ createdAt: -1 });
};

// Pre-save middleware
disputeSchema.pre("save", function (this: IDispute) {
  // Set timeout based on priority
  if (this.priority === "urgent" && !this.timeoutAt) {
    this.timeoutAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  } else if (this.priority === "high" && !this.timeoutAt) {
    this.timeoutAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
  } else if (!this.timeoutAt) {
    this.timeoutAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  }
});

const Dispute = mongoose.model<IDispute, IDisputeModel>(
  "Dispute",
  disputeSchema,
);
export default Dispute;
