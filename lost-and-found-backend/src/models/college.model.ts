import mongoose, { Document, Schema, Model, Types } from "mongoose";

// Image interface for single logo
export interface ICollegeImage {
  url: string;
  publicId?: string;
  uploadedAt: Date;
}

export interface ICollege extends Document {
  name: string;
  domain: string;
  logo: ICollegeImage; // Direct access to logo.url
  shortName: string;
  adminIds: Types.ObjectId[];
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: [number, number];
  };
  contactInfo?: {
    email: string;
    phone?: string;
    website?: string;
  };
  isActive: boolean;
  metadata?: Map<string, any>;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Single image schema for logo
const collegeImageSchema = new Schema<ICollegeImage>(
  {
    url: {
      type: String,
      required: [true, "Logo URL is required"],
    },
    publicId: {
      type: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const collegeSchema: Schema<ICollege> = new Schema(
  {
    name: {
      type: String,
      required: [true, "College name is required"],
      unique: true,
      trim: true,
    },
    domain: {
      type: String,
      required: [true, "College domain is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: "Please enter a valid domain (e.g., ismt.edu.np)",
      },
    },
    logo: {
      type: collegeImageSchema,
      required: [true, "College logo is required"],
    },
    shortName: {
      type: String,
      required: [true, "College short name is required"],
      trim: true,
      maxlength: [20, "Short name cannot exceed 20 characters"],
    },
    adminIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      coordinates: {
        type: [Number],
        // index: "2dsphere",
      },
    },
    contactInfo: {
      email: {
        type: String,
        required: [true, "Contact email is required"],
        lowercase: true,
        trim: true,
      },
      phone: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
      // index: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Ensure domain is properly formatted before saving
collegeSchema.pre("save", async function (this: ICollege) {
  if (this.domain) {
    this.domain = this.domain.replace(/^www\./, "");
  }
});

// Indexes
// collegeSchema.index({ domain: 1 }, { unique: true });
collegeSchema.index({ "location.coordinates": "2dsphere" });
collegeSchema.index({ adminIds: 1 });
collegeSchema.index({ isActive: 1 });

const College = mongoose.model<ICollege>("College", collegeSchema);

export default College;
