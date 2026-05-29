// ENUMS & CONSTANTS

export type CommentSortType = "latest" | "popular" | "pinned";
export type MediaType = "image" | "gif" | "sticker";

export type FlagReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "inappropriate"
  | "other"
  | "fake"
  | "duplicate";

export interface FlagCommentRequest {
  reason: FlagReason;
}

// REQUEST TYPES

export interface AddCommentRequest {
  content: string;
  parentCommentId?: string;
  mentions?: Array<{
    userId: string;
    indices: [number, number];
  }>;
  media?: Array<{
    url: string;
    publicId?: string;
    type: MediaType;
  }>;
}

export interface UpdateCommentRequest {
  content?: string;
  mentions?: Array<{
    userId: string;
    indices: [number, number];
  }>;
  media?: Array<{
    url: string;
    publicId?: string;
    type: MediaType;
  }>;
}

export interface GetCommentsQuery {
  page?: number;
  limit?: number;
  sort?: CommentSortType;
  includeReplies?: boolean;
}

export interface GetRepliesQuery {
  page?: number;
  limit?: number;
}

export interface FlagCommentRequest {
  reason: FlagReason;
}

export interface ResolveFlagsRequest {
  action: "keep" | "remove";
}

export interface PinCommentRequest {
  isPinned: boolean;
}

export interface HideCommentRequest {
  isHidden: boolean;
}

// RESPONSE TYPES

export interface Mention {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  username: string;
  indices: [number, number];
}

export interface CommentMedia {
  url: string;
  publicId?: string;
  type: MediaType;
}

export interface CommentFlag {
  userId: string;
  reason: FlagReason;
  createdAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface EditHistory {
  content: string;
  editedAt: string;
}

export interface UserReference {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  _id: string;
  content: string;
  userId: UserReference;
  itemId: string;
  parentCommentId: string | null;
  replyCount: number;
  mentions: Mention[];
  hashtags: string[];
  likes: string[];
  likesCount: number;
  media: CommentMedia[];
  isEdited: boolean;
  editHistory: EditHistory[];
  isFlagged: boolean;
  flagCount: number;
  flags: CommentFlag[];
  isPinned: boolean;
  isHidden: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  hasMoreReplies?: boolean;
}

export interface CommentListResponse {
  success: boolean;
  message?: string;
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    totalReplies?: number;
  };
}

export interface CommentResponse {
  success: boolean;
  message?: string;
  data: Comment;
}

export interface RepliesResponse {
  success: boolean;
  message?: string;
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserCommentsResponse {
  success: boolean;
  message?: string;
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LikeCommentResponse {
  success: boolean;
  message: string;
  data: {
    likesCount: number;
  };
}

export interface FlagCommentResponse {
  success: boolean;
  message: string;
  data: {
    flagCount: number;
    isFlagged: boolean;
  };
}

export interface PinCommentResponse {
  success: boolean;
  message: string;
  data: {
    isPinned: boolean;
  };
}

export interface HideCommentResponse {
  success: boolean;
  message: string;
  data: {
    isHidden: boolean;
  };
}

export interface DeleteCommentResponse {
  success: boolean;
  message: string;
}

export interface FlaggedCommentsResponse {
  success: boolean;
  data: Comment[];
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
