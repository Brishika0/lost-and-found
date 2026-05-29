export type DisputeType =
  | "wrongful_claim"
  | "item_damage"
  | "fake_item"
  | "harassment"
  | "communication_issue"
  | "other";

export type DisputeStatus =
  | "open"
  | "under_review"
  | "escalated"
  | "resolved"
  | "closed";

export type ResolutionType =
  | "resolved_in_favor_of_reporter"
  | "resolved_in_favor_of_other"
  | "mutual_agreement"
  | "no_action"
  | "other";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface Item {
  _id: string;
  itemName: string;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  status?: string;
  description?: string;
}

export interface Evidence {
  url: string;
  type: "image" | "document" | "screenshot";
  uploadedAt: string;
}

export interface Message {
  userId: User;
  content: string;
  isAdmin: boolean;
  attachments?: string[];
  createdAt: string;
}

export interface Resolution {
  type: ResolutionType;
  description: string;
  resolvedBy: User;
  resolvedAt: string;
  actionTaken?: string;
}

export interface Dispute {
  _id: string;
  itemId: Item;
  collegeId: string;
  reportedBy: User;
  reportedAgainst: User;
  type: DisputeType;
  status: DisputeStatus;
  title: string;
  description: string;
  evidence: Evidence[];
  messages: Message[];
  assignedAdmin?: User;
  priority: Priority;
  resolution?: Resolution;
  isEscalated: boolean;
  escalatedTo?: User;
  escalatedAt?: string;
  escalationReason?: string;
  timeoutAt?: string;
  metadata?: Map<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {
  itemId: string;
  reportedAgainst: string;
  type: DisputeType;
  title: string;
  description: string;
  evidence?: Array<{
    url: string;
    type: "image" | "document" | "screenshot";
  }>;
  metadata?: Map<string, any>;
}

export interface UpdateStatusRequest {
  status: DisputeStatus;
  reason?: string;
}

export interface AddMessageRequest {
  content: string;
  attachments?: string[];
}

export interface ResolveDisputeRequest {
  resolutionType: ResolutionType;
  description: string;
  actionTaken?: string;
  updateItemStatus?: "claimed" | "returned";
}

export interface EscalateDisputeRequest {
  reason: string;
}

export interface AssignAdminRequest {
  adminId: string;
}

export interface AddEvidenceRequest {
  evidence: Array<{
    url: string;
    type: "image" | "document" | "screenshot";
  }>;
}

export interface DisputeStatistics {
  statusBreakdown: Array<{ _id: DisputeStatus; count: number }>;
  typeBreakdown: Array<{ _id: DisputeType; count: number }>;
  priorityBreakdown: Array<{ _id: Priority; count: number }>;
  totalCounts: {
    total: number;
    open: number;
    underReview: number;
    escalated: number;
    resolved: number;
    closed: number;
  };
  resolutionTime: {
    averageHours: number;
    fastestHours: number;
    slowestHours: number;
    totalResolved: number;
  } | null;
  recentTrends: Array<{ _id: string; count: number }>;
}

export interface DisputeQueryParams {
  status?: string;
  type?: string;
  priority?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  collegeId?: string;
}

export interface DisputesResponse {
  success: boolean;
  data: {
    disputes: Dispute[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
