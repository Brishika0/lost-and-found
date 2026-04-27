//  ENUMS & CONSTANTS

export type ZoneType =
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

export const ZONE_TYPE_OPTIONS: {
  value: ZoneType;
  label: string;
  icon: string;
}[] = [
  { value: "library", label: "Library", icon: "📚" },
  { value: "cafeteria", label: "Cafeteria", icon: "🍽️" },
  { value: "lab", label: "Laboratory", icon: "🔬" },
  { value: "classroom", label: "Classroom", icon: "🏫" },
  { value: "hostel", label: "Hostel", icon: "🏠" },
  { value: "sports", label: "Sports Complex", icon: "⚽" },
  { value: "parking", label: "Parking Area", icon: "🅿️" },
  { value: "walkway", label: "Walkway", icon: "🚶" },
  { value: "entrance", label: "Entrance", icon: "🚪" },
  { value: "other", label: "Other", icon: "📍" },
];

//  REQUEST TYPES

export interface GetZonesQuery {
  page?: number;
  limit?: number;
  type?: ZoneType;
  search?: string;
  isActive?: boolean;
  collegeId?: string; // Optional for super admin, required for college admin
}

export interface CreateZoneRequest {
  name: string;
  type: ZoneType;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  collegeId: string; // Required for both super admin and college admin
  description?: string;
  building?: string;
  floor?: number;
  roomNumbers?: string[];
  isIndoor?: boolean;
  tags?: string[];
  parentZoneId?: string;
  images?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateZoneRequest extends Partial<
  Omit<CreateZoneRequest, "collegeId">
> {
  isActive?: boolean;
  collegeId?: string; // Required for college admin, optional for super admin
}

export interface AddRoomRequest {
  roomNumber: string;
  collegeId: string; // Required for college admin
}

export interface RemoveRoomRequest {
  collegeId: string; // Required for college admin
}

//  RESPONSE TYPES

export interface ZoneLocation {
  type: "Point";
  coordinates: [number, number];
  address?: string;
}

export interface ZoneReference {
  _id: string;
  name: string;
  type: ZoneType;
}

export interface UserReference {
  _id: string;
  name: string;
  email: string;
}

export interface CollegeReference {
  _id: string;
  name: string;
  shortName: string;
  domain: string;
}

export interface Zone {
  _id: string;
  collegeId: CollegeReference;
  name: string;
  type: ZoneType;
  description?: string;
  location: ZoneLocation;
  building?: string;
  floor?: number;
  roomNumbers?: string[];
  boundaries?: any;
  isIndoor: boolean;
  isActive: boolean;
  images?: string[];
  tags: string[];
  parentZoneId?: ZoneReference | null;
  createdBy?: UserReference;
  updatedBy?: UserReference;
  createdAt: string;
  updatedAt: string;
}

export interface CollegeStat {
  collegeId: string;
  collegeName: string;
  collegeShortName: string;
  count: number;
}

export interface ZonesListResponse {
  success: boolean;
  data: Zone[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  collegeStats?: CollegeStat[];
}

export interface ZoneResponse {
  success: boolean;
  data: Zone;
}

export interface NearbyZonesResponse {
  success: boolean;
  data: Zone[];
}

export interface AddRoomResponse {
  success: boolean;
  message: string;
  data: Zone;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
