import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IZone extends Document {
  collegeId: mongoose.Types.ObjectId;
  name: string;
  type:
    | "library"
    | "cafeteria"
    | "lab"
    | "classroom"
    | "hostel"
    | "sports"
    | "parking"
    | "walkway"
    | "entrance"
    | "other";
  description?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  building?: string;
  floor?: number;
  roomNumbers?: string[];
  boundaries?: {
    type: "Polygon";
    coordinates: number[][][]; // GeoJSON Polygon coordinates
  };
  isIndoor: boolean;
  isActive: boolean;
  images?: string[];
  tags: string[];
  parentZoneId?: mongoose.Types.ObjectId; // For hierarchical zones (e.g., Building -> Floor -> Room)
  metadata?: Map<string, any>;
  // createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IZoneMethods {
  addRoom(roomNumber: string): Promise<IZone>;
  removeRoom(roomNumber: string): Promise<IZone>;
  getChildZones(): Promise<IZone[]>;
}

export interface IZoneModel extends Model<IZone, {}, IZoneMethods> {
  getZonesByCollege(collegeId: string): Promise<IZone[]>;
  getZonesByType(collegeId: string, type: string): Promise<IZone[]>;
  findNearbyZones(
    coordinates: [number, number],
    maxDistance?: number,
  ): Promise<IZone[]>;
  findZoneByLocation(coordinates: [number, number]): Promise<IZone | null>; // Find which zone contains these coordinates
}

const zoneSchema = new Schema<IZone, IZoneModel, IZoneMethods>(
  {
    collegeId: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: [
        "library",
        "cafeteria",
        "lab",
        "classroom",
        "hostel",
        "sports",
        "parking",
        "walkway",
        "entrance",
        "other",
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true, index: "2dsphere" },
      address: String,
    },
    building: {
      type: String,
      trim: true,
    },
    floor: {
      type: Number,
      min: -10,
      max: 200,
    },
    roomNumbers: [
      {
        type: String,
        trim: true,
        uppercase: true,
      },
    ],
    boundaries: {
      type: { type: String, enum: ["Polygon"] },
      coordinates: { type: [[[Number]]] },
    },
    isIndoor: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    images: [String],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    parentZoneId: {
      type: Schema.Types.ObjectId,
      ref: "Zone",
      index: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    // createdBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound unique index for collegeId + name
zoneSchema.index({ collegeId: 1, name: 1 }, { unique: true });

// Indexes for performance
zoneSchema.index({ collegeId: 1, type: 1 });
zoneSchema.index({ tags: 1 });
zoneSchema.index({ "boundaries.coordinates": "2dsphere" });

// Virtual for items in this zone
zoneSchema.virtual("lostItems", {
  ref: "LostItem",
  localField: "_id",
  foreignField: "zoneId",
  options: { sort: { createdAt: -1 } },
});

// Virtual for child zones
zoneSchema.virtual("childZones", {
  ref: "Zone",
  localField: "_id",
  foreignField: "parentZoneId",
});

// Methods
zoneSchema.methods.addRoom = async function (
  roomNumber: string,
): Promise<IZone> {
  if (!this.roomNumbers?.includes(roomNumber)) {
    this.roomNumbers?.push(roomNumber);
    await this.save();
  }
  return this;
};

zoneSchema.methods.removeRoom = async function (
  roomNumber: string,
): Promise<IZone> {
  this.roomNumbers = this.roomNumbers?.filter((r) => r !== roomNumber);
  await this.save();
  return this;
};

zoneSchema.methods.getChildZones = async function (): Promise<IZone[]> {
  return mongoose.model<IZone>("Zone").find({ parentZoneId: this._id });
};

// Statics
zoneSchema.statics.getZonesByCollege = async function (
  collegeId: string,
): Promise<IZone[]> {
  return this.find({
    collegeId: new mongoose.Types.ObjectId(collegeId),
    isActive: true,
  }).sort({ type: 1, name: 1 });
};

zoneSchema.statics.getZonesByType = async function (
  collegeId: string,
  type: string,
): Promise<IZone[]> {
  return this.find({
    collegeId: new mongoose.Types.ObjectId(collegeId),
    type,
    isActive: true,
  }).sort({ name: 1 });
};

zoneSchema.statics.findNearbyZones = async function (
  coordinates: [number, number],
  maxDistance: number = 1000,
): Promise<IZone[]> {
  return this.find({
    "location.coordinates": {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: maxDistance,
      },
    },
    isActive: true,
  }).limit(20);
};

zoneSchema.statics.findZoneByLocation = async function (
  coordinates: [number, number],
): Promise<IZone | null> {
  // First try exact point location
  let zone = await this.findOne({
    "location.coordinates": coordinates,
    isActive: true,
  });

  // If not found, try polygon boundaries
  if (!zone) {
    zone = await this.findOne({
      boundaries: {
        $geoIntersects: {
          $geometry: { type: "Point", coordinates },
        },
      },
      isActive: true,
    });
  }

  return zone;
};

// Pre-save middleware
zoneSchema.pre("save", function (this: IZone) {
  // Generate tags if empty
  if (!this.tags || this.tags.length === 0) {
    const tags = new Set<string>();

    this.name
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        if (word.length > 2) tags.add(word);
      });

    tags.add(this.type.toLowerCase());

    if (this.building) {
      this.building
        .toLowerCase()
        .split(/\s+/)
        .forEach((word) => {
          if (word.length > 2) tags.add(word);
        });
    }

    this.tags = Array.from(tags);
  }
});

const Zone = mongoose.model<IZone, IZoneModel>("Zone", zoneSchema);
export default Zone;
