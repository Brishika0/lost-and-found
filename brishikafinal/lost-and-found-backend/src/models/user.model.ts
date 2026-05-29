import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// User Roles Type
export type UserRole = "super_admin" | "college_admin" | "student";

// User Document Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  collegeId?: mongoose.Types.ObjectId; // Reference to College (null for super_admin)
  avatar?: string; // Optional avatar URL
  isActive: boolean;
  lastActive?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isEmailVerified: boolean;
  chatPrivacy?: {
    allowMessagesFrom: "everyone" | "verified_only" | "nobody";
    showReadReceipts: boolean;
  };
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
    comments: boolean;
  };
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Model Interface
interface IUserModel extends Model<IUser> {
  hashPassword(password: string): Promise<string>;
}

// Schema
const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["super_admin", "college_admin", "student"],
      default: "student",
      required: true,
    },
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: function (this: IUser) {
        return this.role === "college_admin" || this.role === "student";
      },
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    chatPrivacy: {
      allowMessagesFrom: {
        type: String,
        enum: ["everyone", "verified_only", "nobody"],
        default: "everyone",
      },
      showReadReceipts: {
        type: Boolean,
        default: true,
      },
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      matches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
// userSchema.index({ email: 1 });
userSchema.index({ role: 1, collegeId: 1 });
userSchema.index({ lastActive: -1 });

// Instance Method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static Method
userSchema.statics.hashPassword = async function (
  password: string,
): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);
export default User;
