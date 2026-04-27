import mongoose, { Document, Model, Schema } from "mongoose";

export type ConversationType = "dm" | "group";

export interface IParticipant {
  userId: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  joinedAt: Date;
}

export interface IConversation extends Document {
  talkjsConversationId: string; // the ID you pass to TalkJS — keep them in sync
  type: ConversationType;
  participants: IParticipant[];
  subject?: string; // group chat name
  photoUrl?: string; // group chat photo
  lastMessage?: {
    text: string;
    sentBy: mongoose.Types.ObjectId;
    sentAt: Date;
  };
  createdBy: mongoose.Types.ObjectId;
  collegeId?: mongoose.Types.ObjectId; // scopes chat to a college if needed
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }, // no separate _id for subdocs
);

const conversationSchema = new Schema<IConversation>(
  {
    talkjsConversationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["dm", "group"],
      required: true,
    },
    participants: {
      type: [participantSchema],
      validate: {
        validator: (arr: IParticipant[]) => arr.length >= 2,
        message: "A conversation must have at least 2 participants.",
      },
    },
    subject: {
      type: String,
      trim: true,
      default: null,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    lastMessage: {
      text: { type: String },
      sentBy: { type: Schema.Types.ObjectId, ref: "User" },
      sentAt: { type: Date },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Indexes
conversationSchema.index({ talkjsConversationId: 1 }); // fast lookup when TalkJS webhooks fire
conversationSchema.index({ "participants.userId": 1 }); // fetch all convos for a user
conversationSchema.index({ collegeId: 1 }); // scope by college
conversationSchema.index({ "lastMessage.sentAt": -1 }); // sort by recent activity

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
export default Conversation;
