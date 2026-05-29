export interface User {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "college_admin" | "student";
  collegeId?: {
    _id: string;
    name: string;
    shortName: string;
    domain: string;
    logo?: { url: string };
  };
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastActive?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: {
    activeCount: number;
    inactiveCount: number;
    verifiedCount: number;
    unverifiedCount: number;
    collegeStats?: Array<{
      _id: string;
      count: number;
      collegeName?: string;
    }>;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  collegeId?: string; // Required for students (super admin) or auto-set for college admin
  isActive?: boolean;
  avatar?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  avatar?: string;
  isActive?: boolean;
  collegeId?: string; // Super admin only
  chatPrivacy?: {
    allowMessagesFrom?: "everyone" | "verified_only" | "nobody";
    showReadReceipts?: boolean;
  };
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    matches?: boolean;
    messages?: boolean;
    comments?: boolean;
  };
}

export interface UserStatsResponse {
  success: boolean;
  data: {
    totalStudents: number;
    totalAdmins: number;
    activeStudents: number;
    pendingVerification: number;
    activePercentage: number;
    verifiedPercentage: number;
    collegeBreakdown?: Array<{
      collegeName?: string;
      count: number;
    }>;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
