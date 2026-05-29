import mongoose, { Schema, Document, Model, Types } from "mongoose";

// INTERFACES
export interface IImage {
  _id?: Types.ObjectId;
  url: string;
  publicId?: string;
  isPrimary?: boolean;
  uploadedAt: Date;
}

export interface ILike {
  user: Types.ObjectId;
  createdAt: Date;
}

export interface IShare {
  user: Types.ObjectId;
  sharedOn: "timeline" | "message" | "whatsapp" | "other";
  createdAt: Date;
}

export interface IUniqueView {
  user: Types.ObjectId;
  viewedAt: Date;
}

export interface IFlag {
  user: Types.ObjectId;
  reason: "inappropriate" | "spam" | "fake" | "duplicate" | "other";
  description?: string;
  createdAt: Date;
  resolved: boolean;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
}

export interface IContactInfo {
  phone?: string;
  email?: string;
  preferredContact?: "phone" | "email" | "both";
  showContact: boolean; // Privacy setting
}

// Document Interface
export interface ILostItem extends Document {
  // Basic Info
  itemName: string;
  description: string;
  category: string;
  subCategory?: string;

  // Status
  status: "lost" | "found" | "claimed" | "returned";
  isActive: boolean;

  // College & Zone References
  collegeId: Types.ObjectId;
  zoneId?: Types.ObjectId; // Reference to Zone for precise location
  zonePath?: string[]; // Hierarchical path for quick filtering [college, building, floor, room]

  // User References
  reportedBy: Types.ObjectId;
  foundBy?: Types.ObjectId | null;
  claimedBy?: Types.ObjectId | null;
  returnedTo?: Types.ObjectId | null;

  // Location (kept for backward compatibility, but zoneId is primary)
  locationDescription: string; // Human-readable description
  specificLocation?: {
    building?: string;
    floor?: number;
    room?: string;
    landmark?: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };

  // Dates
  dateReported: Date;
  dateFound?: Date | null;
  dateLost?: Date | null;
  dateClaimed?: Date | null;
  dateReturned?: Date | null;

  // Contact
  contactInfo?: IContactInfo;

  // Media
  images: IImage[];

  // Social Features
  likes: ILike[];
  likesCount: number;
  shares: IShare[];
  sharesCount: number;
  commentsCount: number; // Denormalized from Comment model

  // Views
  views: number;
  uniqueViews: IUniqueView[];

  // Flags
  flags: IFlag[];
  flagCount: number;
  isFlagged: boolean;

  // Verification
  isVerified: boolean;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;

  // Metadata
  tags: string[];
  keywords: string[];

  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Methods Interface
export interface ILostItemMethods {
  like(userId: Types.ObjectId | string): Promise<ILostItem>;
  unlike(userId: Types.ObjectId | string): Promise<ILostItem>;
  share(
    userId: Types.ObjectId | string,
    sharedOn?: IShare["sharedOn"],
  ): Promise<ILostItem>;
  addView(userId?: Types.ObjectId | string): Promise<ILostItem>;
  flag(
    userId: Types.ObjectId | string,
    reason: IFlag["reason"],
    description?: string,
  ): Promise<ILostItem>;
  verify(userId: Types.ObjectId | string): Promise<ILostItem>;
  updateZonePath(zoneId: Types.ObjectId): Promise<void>;
}

// Model Interface
export interface ILostItemModel extends Model<ILostItem, {}, ILostItemMethods> {
  getTrending(collegeId: string, limit?: number): Promise<ILostItem[]>;
  searchItems(
    query: string,
    collegeId: string,
    filters?: {
      category?: string;
      status?: string;
      zoneId?: string;
      fromDate?: Date;
      toDate?: Date;
    },
  ): Promise<ILostItem[]>;
  findByZone(zoneId: string): Promise<ILostItem[]>;
  getNearbyItems(
    coordinates: [number, number],
    maxDistance?: number,
    filters?: any,
  ): Promise<ILostItem[]>;
}

// Sub-schemas
const imageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    publicId: String,
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const likeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const shareSchema = new Schema<IShare>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sharedOn: {
      type: String,
      enum: ["timeline", "message", "whatsapp", "other"],
      default: "timeline",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const uniqueViewSchema = new Schema<IUniqueView>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const flagSchema = new Schema<IFlag>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: ["inappropriate", "spam", "fake", "duplicate", "other"],
      required: true,
    },
    description: String,
    createdAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: Date,
  },
  { _id: false },
);

const contactInfoSchema = new Schema<IContactInfo>(
  {
    phone: {
      type: String,
      match: [/^[0-9+\-\s()]{10,15}$/, "Please enter a valid phone number"],
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    preferredContact: {
      type: String,
      enum: ["phone", "email", "both"],
      default: "both",
    },
    showContact: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

// Main Schema
const lostItemSchema = new Schema<ILostItem, ILostItemModel, ILostItemMethods>(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Electronics",
        "Clothing",
        "Books",
        "Accessories",
        "Documents",
        "Keys",
        "Wallets",
        "Bags",
        "Mobile Phones",
        "Laptops",
        "ID Cards",
        "Other",
      ],
      index: true,
    },
    subCategory: { type: String, trim: true },
    status: {
      type: String,
      enum: ["lost", "found", "claimed", "returned"],
      default: "lost",
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },

    // College and Zone references
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: [true, "College is required"],
      index: true,
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: "Zone",
      index: true,
    },
    zonePath: [String], // For hierarchical filtering

    // User References
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    foundBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    claimedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    returnedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // Location
    locationDescription: {
      type: String,
      required: [true, "Location description is required"],
      trim: true,
    },

    specificLocation: {
      building: String,
      floor: Number,
      room: String,
      landmark: String,
      coordinates: {
        type: [Number],
        // index: "2dsphere",
      },
    },

    // Dates
    dateReported: { type: Date, default: Date.now, index: true },
    dateFound: { type: Date, default: null },
    dateLost: { type: Date, default: null },
    dateClaimed: { type: Date, default: null },
    dateReturned: { type: Date, default: null },

    // Contact
    contactInfo: contactInfoSchema,

    // Media
    images: [imageSchema],

    // Social Features
    likes: [likeSchema],
    likesCount: { type: Number, default: 0 },
    shares: [shareSchema],
    sharesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    // Views
    views: { type: Number, default: 0 },
    uniqueViews: [uniqueViewSchema],

    // Flags
    flags: [flagSchema],
    flagCount: { type: Number, default: 0 },
    isFlagged: { type: Boolean, default: false },

    // Verification
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,

    // Metadata
    tags: [String],
    keywords: [String],

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
lostItemSchema.index({ itemName: "text", description: "text", tags: "text" });
lostItemSchema.index({ collegeId: 1, status: 1, createdAt: -1 });
lostItemSchema.index({ reportedBy: 1, createdAt: -1 });
lostItemSchema.index({ category: 1, collegeId: 1 });
lostItemSchema.index({ zoneId: 1, status: 1 });
lostItemSchema.index({ zonePath: 1 });
lostItemSchema.index({ "specificLocation.coordinates": "2dsphere" });

// Virtuals
lostItemSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "itemId",
  options: { sort: { createdAt: -1 } },
});

lostItemSchema.virtual("zone", {
  ref: "Zone",
  localField: "zoneId",
  foreignField: "_id",
  justOne: true,
});

lostItemSchema.virtual("college", {
  ref: "College",
  localField: "collegeId",
  foreignField: "_id",
  justOne: true,
});

// Pre-save middleware
lostItemSchema.pre("save", async function (this: ILostItem & ILostItemMethods) {
  // Update counts
  this.likesCount = this.likes.length;
  this.sharesCount = this.shares.length;
  this.flagCount = this.flags.length;
  this.isFlagged = this.flagCount > 0;

  // Generate keywords for search
  if (
    this.isModified("itemName") ||
    this.isModified("description") ||
    this.isModified("category")
  ) {
    const keywords = new Set<string>();

    this.itemName
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        if (word.length > 2) keywords.add(word);
      });

    this.description
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        if (word.length > 2) keywords.add(word);
      });

    if (this.category) keywords.add(this.category.toLowerCase());

    this.keywords = Array.from(keywords);
  }

  // Update zonePath if zoneId is set
  if (this.isModified("zoneId") && this.zoneId) {
    await this.updateZonePath(this.zoneId);
  }
});

// Methods
lostItemSchema.methods.updateZonePath = async function (
  zoneId: Types.ObjectId,
): Promise<void> {
  const Zone = mongoose.model("Zone");
  const zone = await Zone.findById(zoneId);

  if (zone) {
    const path = [zone.name];
    let currentZone = zone;

    // Traverse up to build path
    while (currentZone.parentZoneId) {
      const parent = await Zone.findById(currentZone.parentZoneId);
      if (parent) {
        path.unshift(parent.name);
        currentZone = parent;
      } else {
        break;
      }
    }

    this.zonePath = path;
  }
};

lostItemSchema.methods.like = async function (
  userId: Types.ObjectId | string,
): Promise<ILostItem> {
  const userIdStr = userId.toString();
  const existingLike = this.likes.find(
    (like: ILike) => like.user.toString() === userIdStr,
  );

  if (!existingLike) {
    this.likes.push({
      user: new Types.ObjectId(userIdStr),
      createdAt: new Date(),
    });
    this.likesCount = this.likes.length;
  }

  return this.save();
};

lostItemSchema.methods.unlike = async function (
  userId: Types.ObjectId | string,
): Promise<ILostItem> {
  const userIdStr = userId.toString();
  this.likes = this.likes.filter(
    (like: ILike) => like.user.toString() !== userIdStr,
  );
  this.likesCount = this.likes.length;
  return this.save();
};

lostItemSchema.methods.share = async function (
  userId: Types.ObjectId | string,
  sharedOn: IShare["sharedOn"] = "timeline",
): Promise<ILostItem> {
  this.shares.push({
    user: new Types.ObjectId(userId.toString()),
    sharedOn,
    createdAt: new Date(),
  });
  this.sharesCount = this.shares.length;
  return this.save();
};

lostItemSchema.methods.addView = async function (
  userId?: Types.ObjectId | string,
): Promise<ILostItem> {
  this.views += 1;

  if (userId) {
    const userIdStr = userId.toString();
    const hasViewed = this.uniqueViews.some(
      (v: IUniqueView) => v.user?.toString() === userIdStr,
    );

    if (!hasViewed) {
      this.uniqueViews.push({
        user: new Types.ObjectId(userIdStr),
        viewedAt: new Date(),
      });
    }
  }
  return this.save();
};

lostItemSchema.methods.flag = async function (
  userId: Types.ObjectId | string,
  reason: IFlag["reason"],
  description: string = "",
): Promise<ILostItem> {
  this.flags.push({
    user: new Types.ObjectId(userId.toString()),
    reason,
    description,
    createdAt: new Date(),
    resolved: false,
  });
  this.flagCount = this.flags.length;
  this.isFlagged = true;
  return this.save();
};

lostItemSchema.methods.verify = async function (
  userId: Types.ObjectId | string,
): Promise<ILostItem> {
  this.isVerified = true;
  this.verifiedBy = new Types.ObjectId(userId.toString());
  this.verifiedAt = new Date();
  return this.save();
};

// Static Methods
lostItemSchema.statics.getTrending = function (collegeId: string, limit = 10) {
  return this.find({
    collegeId: new Types.ObjectId(collegeId),
    isActive: true,
    isFlagged: false,
  })
    .sort({ likesCount: -1, sharesCount: -1, views: -1, createdAt: -1 })
    .limit(limit)
    .populate("reportedBy", "name avatar")
    .populate("foundBy", "name avatar")
    .populate("claimedBy", "name avatar")
    .populate("zone", "name type")
    .exec();
};

lostItemSchema.statics.searchItems = function (
  query: string,
  collegeId: string,
  filters = {},
) {
  const searchQuery: any = {
    collegeId: new Types.ObjectId(collegeId),
    isActive: true,
    isFlagged: false,
    $text: { $search: query },
  };

  if (filters.category) searchQuery.category = filters.category;
  if (filters.status) searchQuery.status = filters.status;
  if (filters.zoneId) searchQuery.zoneId = new Types.ObjectId(filters.zoneId);

  if (filters.fromDate || filters.toDate) {
    searchQuery.createdAt = {};
    if (filters.fromDate) searchQuery.createdAt.$gte = filters.fromDate;
    if (filters.toDate) searchQuery.createdAt.$lte = filters.toDate;
  }

  return this.find(searchQuery)
    .sort({ score: { $meta: "textScore" }, createdAt: -1 })
    .populate("reportedBy", "name avatar")
    .populate("zone", "name type")
    .exec();
};

lostItemSchema.statics.findByZone = function (zoneId: string) {
  return this.find({
    zoneId: new Types.ObjectId(zoneId),
    isActive: true,
    isFlagged: false,
  })
    .sort({ createdAt: -1 })
    .populate("reportedBy", "name avatar")
    .exec();
};

lostItemSchema.statics.getNearbyItems = function (
  coordinates: [number, number],
  maxDistance: number = 1000,
  filters = {},
) {
  const query: any = {
    "specificLocation.coordinates": {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: maxDistance,
      },
    },
    isActive: true,
    isFlagged: false,
    ...filters,
  };

  return this.find(query)
    .populate("reportedBy", "name avatar")
    .populate("zone", "name type")
    .limit(50)
    .exec();
};

const LostItem = mongoose.model<ILostItem, ILostItemModel>(
  "LostItem",
  lostItemSchema,
);
export default LostItem;
