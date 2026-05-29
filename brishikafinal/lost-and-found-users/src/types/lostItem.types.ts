//  ENUMS & CONSTANTS

export type ItemStatus = "lost" | "found" | "claimed" | "returned";
export type SharePlatform = "timeline" | "message" | "whatsapp" | "other";

export type FlagReason =
  | "inappropriate"
  | "spam"
  | "fake"
  | "duplicate"
  | "other";

export interface FlagItemRequest {
  reason: FlagReason;
  description?: string;
}

//  REQUEST TYPES

export interface CreateLostItemRequest {
  itemName: string;
  description: string;
  category: string;
  subCategory?: string;
  status?: ItemStatus;
  locationDescription: string;
  zoneId?: string;
  specificLocation?: {
    building?: string;
    floor?: number;
    room?: string;
    landmark?: string;
    coordinates?: [number, number];
  };
  dateLost?: string;
  dateFound?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    preferredContact?: "phone" | "email" | "both";
    showContact?: boolean;
  };
  tags?: string[];
  imgaes: File[] | Image[];
}

export interface UpdateLostItemRequest extends Partial<CreateLostItemRequest> {
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateStatusRequest {
  status: ItemStatus;
  foundBy?: string;
  claimedBy?: string;
  returnedTo?: string;
  rewardedTo?: string;
}

export interface GetLostItemsQuery {
  page?: number;
  limit?: number;
  status?: ItemStatus;
  category?: string;
  collegeId: string;
  zoneId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  nearby?: boolean;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;

  isActive?: boolean;
  isVerified?: boolean;
  includeStats?: boolean;
}

export interface SearchItemsQuery {
  q: string;
  collegeId: string;
  category?: string;
  status?: ItemStatus;
  fromDate?: string;
  toDate?: string;
}

export interface FlagItemRequest {
  reason: FlagReason;
  description?: string;
}

export interface ShareItemRequest {
  sharedOn?: SharePlatform;
}

export interface ResolveFlagsRequest {
  action: "keep" | "remove";
}

//  RESPONSE TYPES

export interface Image {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
  uploadedAt: string;
}

export interface Like {
  user: string;
  createdAt: string;
}

export interface Share {
  user: string;
  sharedOn: SharePlatform;
  createdAt: string;
}

export interface Flag {
  user: string;
  reason: FlagReason;
  description?: string;
  createdAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  preferredContact?: "phone" | "email" | "both";
  showContact: boolean;
}

export interface SpecificLocation {
  building?: string;
  floor?: number;
  room?: string;
  landmark?: string;
  coordinates?: [number, number];
}

export interface CollegeReference {
  _id: string;
  name: string;
  shortName: string;
  domain: string;
  logo?: string;
}

export interface ZoneReference {
  _id: string;
  name: string;
  type: string;
  location?: {
    address: string;
    coordinates: [number, number];
    type: string;
  };
}

export interface UserReference {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface LostItem {
  _id: string;
  itemName: string;
  description: string;
  category: string;
  subCategory?: string;
  status: ItemStatus;
  isActive: boolean;
  collegeId: CollegeReference;
  zoneId?: ZoneReference;
  zonePath?: string[];
  reportedBy: UserReference;
  foundBy?: UserReference | null;
  claimedBy?: UserReference | null;
  returnedTo?: UserReference | null;
  locationDescription: string;
  specificLocation?: SpecificLocation;
  dateReported: string;
  dateFound?: string | null;
  dateLost?: string | null;
  dateClaimed?: string | null;
  dateReturned?: string | null;
  contactInfo?: ContactInfo;
  images: Image[];
  likes: Like[];
  likesCount: number;
  shares: Share[];
  sharesCount: number;
  commentsCount: number;
  views: number;
  uniqueViews: { user: string; viewedAt: string }[];
  flags: Flag[];
  flagCount: number;
  isFlagged: boolean;
  isVerified: boolean;
  verifiedBy?: UserReference;
  verifiedAt?: string;
  tags: string[];
  keywords: string[];
  createdBy: UserReference;
  updatedBy?: UserReference;
  createdAt: string;
  updatedAt: string;
}

export interface LostItemListResponse {
  success: boolean;
  message?: string;
  data: LostItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LostItemResponse {
  success: boolean;
  message?: string;
  data: LostItem;
}

export interface TrendingItemsResponse {
  success: boolean;
  data: LostItem[];
}

export interface SearchItemsResponse {
  success: boolean;
  data: LostItem[];
}

export interface NearbyItemsResponse {
  success: boolean;
  data: LostItem[];
}

export interface ItemsByZoneResponse {
  success: boolean;
  data: LostItem[];
  zone: ZoneReference;
}

export interface MyItemsResponse {
  success: boolean;
  data: LostItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface InteractionsResponse {
  success: boolean;
  data: {
    found: LostItem[];
    claimed: LostItem[];
    returned: LostItem[];
  };
}

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    likesCount: number;
  };
}

export interface ShareResponse {
  success: boolean;
  message: string;
  data: {
    sharesCount: number;
  };
}

export interface FlagResponse {
  success: boolean;
  message: string;
  data: {
    flagCount: number;
    isFlagged: boolean;
  };
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: Image[];
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  data: {
    isVerified: boolean;
    verifiedBy: string;
    verifiedAt: string;
  };
}

export interface FlaggedItemsResponse {
  success: boolean;
  data: LostItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ResolveFlagsResponse {
  success: boolean;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
