import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType =
  | "item_match"
  | "chat_request"
  | "chat_accepted"
  | "chat_message"
  | "item_claimed"
  | "item_returned"
  | "dispute_update"
  | "comment"
  | "reply"
  | "like"
  | "share"
  | "admin_approval"
  | "flag_resolved"
  | "reward_earned";

export type NotificationPriority = "low" | "medium" | "high";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    itemId?: mongoose.Types.ObjectId;
    chatId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    commentId?: mongoose.Types.ObjectId;
    disputeId?: mongoose.Types.ObjectId;
    matchScore?: number;
    [key: string]: any;
  };
  priority: NotificationPriority;
  isRead: boolean;
  isDelivered: boolean;
  isClicked: boolean;
  readAt?: Date;
  deliveredAt?: Date;
  clickedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationMethods {
  markAsRead(): Promise<INotification>;
  markAsDelivered(): Promise<INotification>;
  markAsClicked(): Promise<INotification>;
}

export interface INotificationModel extends Model<
  INotification,
  {},
  INotificationMethods
> {
  getUnreadCount(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<void>;
  createMatchNotification(
    userId: string,
    lostItemId: string,
    foundItemId: string,
    matchScore: number,
  ): Promise<INotification>;
  createChatRequestNotification(
    userId: string,
    chatId: string,
    fromUserName: string,
    itemName: string,
  ): Promise<INotification>;
  createChatAcceptedNotification(
    userId: string,
    chatId: string,
    fromUserName: string,
  ): Promise<INotification>;
}

const notificationSchema = new Schema<
  INotification,
  INotificationModel,
  INotificationMethods
>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "item_match",
        "chat_request",
        "chat_accepted",
        "chat_message",
        "item_claimed",
        "item_returned",
        "dispute_update",
        "comment",
        "reply",
        "like",
        "share",
        "admin_approval",
        "flag_resolved",
        "reward_earned",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isClicked: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    deliveredAt: Date,
    clickedAt: Date,
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Methods
notificationSchema.methods.markAsRead =
  async function (): Promise<INotification> {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  };

notificationSchema.methods.markAsDelivered =
  async function (): Promise<INotification> {
    this.isDelivered = true;
    this.deliveredAt = new Date();
    return this.save();
  };

notificationSchema.methods.markAsClicked =
  async function (): Promise<INotification> {
    this.isClicked = true;
    this.clickedAt = new Date();
    return this.save();
  };

// Statics
notificationSchema.statics.getUnreadCount = async function (
  userId: string,
): Promise<number> {
  return this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    isRead: false,
  });
};

notificationSchema.statics.markAllAsRead = async function (
  userId: string,
): Promise<void> {
  await this.updateMany(
    { userId: new mongoose.Types.ObjectId(userId), isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );
};

notificationSchema.statics.createMatchNotification = async function (
  userId: string,
  lostItemId: string,
  foundItemId: string,
  matchScore: number,
): Promise<INotification> {
  const LostItem = mongoose.model("LostItem");

  const [lostItem, foundItem] = await Promise.all([
    LostItem.findById(lostItemId).select("itemName"),
    LostItem.findById(foundItemId).select("itemName"),
  ]);

  const title = "Potential Match Found!";
  const message = `Your lost item "${lostItem?.itemName}" matches with found item "${foundItem?.itemName}" (${Math.round(matchScore * 100)}% match)`;

  return this.create({
    userId: new mongoose.Types.ObjectId(userId),
    type: "item_match",
    title,
    message,
    priority: matchScore > 0.8 ? "high" : "medium",
    data: {
      lostItemId: new mongoose.Types.ObjectId(lostItemId),
      foundItemId: new mongoose.Types.ObjectId(foundItemId),
      matchScore,
    },
  });
};

notificationSchema.statics.createChatRequestNotification = async function (
  userId: string,
  chatId: string,
  fromUserName: string,
  itemName: string,
): Promise<INotification> {
  return this.create({
    userId: new mongoose.Types.ObjectId(userId),
    type: "chat_request",
    title: "New Chat Request",
    message: `${fromUserName} wants to chat about "${itemName}"`,
    priority: "medium",
    data: {
      chatId: new mongoose.Types.ObjectId(chatId),
      fromUserName,
      itemName,
    },
  });
};

notificationSchema.statics.createChatAcceptedNotification = async function (
  userId: string,
  chatId: string,
  fromUserName: string,
): Promise<INotification> {
  return this.create({
    userId: new mongoose.Types.ObjectId(userId),
    type: "chat_accepted",
    title: "Chat Request Accepted",
    message: `${fromUserName} accepted your chat request`,
    priority: "low",
    data: {
      chatId: new mongoose.Types.ObjectId(chatId),
      fromUserName,
    },
  });
};

const Notification = mongoose.model<INotification, INotificationModel>(
  "Notification",
  notificationSchema,
);
export default Notification;
