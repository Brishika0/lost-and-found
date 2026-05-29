// types/college.ts
export interface CollegeImage {
  url: string;
  publicId?: string;
  uploadedAt: string;
}

export interface College {
  _id: string;
  name: string;
  domain: string;
  logo: CollegeImage;
  shortName: string;
  adminIds: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: [number, number];
  };
  contactInfo: {
    email: string;
    phone?: string;
    website?: string;
  };
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CollegesResponse {
  success: boolean;
  data: College[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CollegeStatsResponse {
  success: boolean;
  data: {
    collegeId: string;
    collegeName: string;
    collegeShortName: string;
    stats: {
      users: {
        totalStudents: number;
        totalAdmins: number;
        totalUsers: number;
      };
      items: {
        total: number;
        lost: number;
        found: number;
        returned: number;
        active: number;
        resolutionRate: string;
      };
      chats: {
        total: number;
      };
      recentActivities: Array<{
        id: string;
        name: string;
        status: string;
        date: string;
      }>;
    };
    lastUpdated: string;
  };
}

export interface CollegeFormData {
  name: string;
  domain: string;
  shortName: string;
  logo?: File | CollegeImage;
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
  metadata?: Record<string, any>;
}
