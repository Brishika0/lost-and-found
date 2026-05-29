import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment {
  content: string;
  userId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId;
  replyCount: number;
  mentions: Array<{
    userId: mongoose.Types.ObjectId;
    username: string;
    indices: [number, number];
  }>;
  hashtags: string[];
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  media?: Array<{
    url: string;
    publicId?: string;
    type: "image" | "gif" | "sticker";
  }>;
  isEdited: boolean;
  editHistory: Array<{
    content: string;
    editedAt: Date;
  }>;
  isFlagged: boolean;
  flagCount: number;
  flags: Array<{
    userId: mongoose.Types.ObjectId;
    reason: string;
    createdAt: Date;
  }>;
  isPinned: boolean;
  isHidden: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentMethods {
  extractHashtags(): void;
  like(userId: mongoose.Types.ObjectId): Promise<void>;
  unlike(userId: mongoose.Types.ObjectId): Promise<void>;
  flag(userId: mongoose.Types.ObjectId, reason: string): Promise<void>;
}

export interface CommentDocument extends IComment, ICommentMethods, Document {}
export interface CommentModel extends Model<
  CommentDocument,
  {},
  ICommentMethods
> {}

const CommentSchema = new Schema<CommentDocument, CommentModel>(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [2200, "Comment cannot exceed 2200 characters"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "LostItem",
      required: true,
      index: true,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    mentions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
        indices: {
          type: [Number],
          required: true,
          validate: {
            validator: function (indices: number[]) {
              return indices.length === 2 && indices[0] < indices[1];
            },
            message: "Mentions must have valid start and end indices",
          },
        },
      },
    ],
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    media: [
      {
        url: { type: String, required: true },
        publicId: String,
        type: {
          type: String,
          enum: ["image", "gif", "sticker"],
          default: "image",
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        content: String,
        editedAt: { type: Date, default: Date.now },
      },
    ],
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagCount: {
      type: Number,
      default: 0,
    },
    flags: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reason: {
          type: String,
          enum: ["spam", "harassment", "hate_speech", "inappropriate", "other"],
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
CommentSchema.index({ itemId: 1, createdAt: -1 });
CommentSchema.index({ itemId: 1, isPinned: -1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1, createdAt: 1 });
CommentSchema.index({ userId: 1, createdAt: -1 });
CommentSchema.index({ hashtags: 1 });

// Virtual for replies
CommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentCommentId",
  options: {
    sort: { createdAt: 1 },
    limit: 10,
  },
});

// Validation to prevent nested replies
CommentSchema.pre<CommentDocument>("save", async function () {
  if (this.parentCommentId) {
    const parentComment = await mongoose
      .model<CommentDocument>("Comment")
      .findById(this.parentCommentId)
      .select("parentCommentId");

    if (parentComment && parentComment.parentCommentId) {
      throw new Error(
        "Cannot reply to a reply. Only one level of replies is allowed.",
      );
    }
  }

  if (this.isModified("content")) {
    this.extractHashtags();
  }
});

// Post-save middleware to update counts
CommentSchema.post("save", async function (doc: CommentDocument) {
  // Update parent reply count
  if (doc.parentCommentId) {
    await mongoose
      .model<CommentDocument>("Comment")
      .updateOne({ _id: doc.parentCommentId }, { $inc: { replyCount: 1 } });
  }

  // Update LostItem comments count
  await mongoose
    .model("LostItem")
    .updateOne({ _id: doc.itemId }, { $inc: { commentsCount: 1 } });
});

// Pre-delete middleware
CommentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (this: CommentDocument) {
    if (this.parentCommentId) {
      await mongoose
        .model<CommentDocument>("Comment")
        .updateOne({ _id: this.parentCommentId }, { $inc: { replyCount: -1 } });
    }

    await mongoose
      .model("LostItem")
      .updateOne({ _id: this.itemId }, { $inc: { commentsCount: -1 } });
  },
);

// Handle findOneAndDelete
CommentSchema.pre("findOneAndDelete", async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    if (doc.parentCommentId) {
      await mongoose
        .model<CommentDocument>("Comment")
        .updateOne({ _id: doc.parentCommentId }, { $inc: { replyCount: -1 } });
    }

    await mongoose
      .model("LostItem")
      .updateOne({ _id: doc.itemId }, { $inc: { commentsCount: -1 } });
  }
});

// Methods
CommentSchema.methods.extractHashtags = function (this: CommentDocument) {
  const hashtagRegex = /#(\w+)/g;
  const matches = this.content.match(hashtagRegex);
  this.hashtags = matches ? matches.map((tag) => tag.toLowerCase()) : [];
};

CommentSchema.methods.like = async function (
  this: CommentDocument,
  userId: mongoose.Types.ObjectId,
) {
  const userIdStr = userId.toString();
  const hasLiked = this.likes.some(
    (id: mongoose.Types.ObjectId) => id.toString() === userIdStr,
  );

  if (!hasLiked) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
    await this.save();
  }
};

CommentSchema.methods.unlike = async function (
  this: CommentDocument,
  userId: mongoose.Types.ObjectId,
) {
  const userIdStr = userId.toString();
  this.likes = this.likes.filter(
    (id: mongoose.Types.ObjectId) => id.toString() !== userIdStr,
  );
  this.likesCount = this.likes.length;
  await this.save();
};

CommentSchema.methods.flag = async function (
  this: CommentDocument,
  userId: mongoose.Types.ObjectId,
  reason: string,
) {
  const userIdStr = userId.toString();
  const alreadyFlagged = this.flags.some(
    (flag: any) => flag.userId.toString() === userIdStr,
  );

  if (!alreadyFlagged) {
    this.flags.push({
      userId,
      reason,
      createdAt: new Date(),
    });
    this.flagCount = this.flags.length;

    // Auto-hide after 5 flags
    if (this.flagCount >= 5) {
      this.isFlagged = true;
      this.isHidden = true;
    }

    await this.save();
  }
};

const Comment = mongoose.model<CommentDocument, CommentModel>(
  "Comment",
  CommentSchema,
);
export default Comment;
