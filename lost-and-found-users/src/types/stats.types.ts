//  ENUMS & TYPES

export type StatsPeriod = "day" | "week" | "month" | "year";

export interface StatsQueryParams {
  collegeId?: string;
  period?: StatsPeriod;
  category?: string;
  status?: string;
}

//  DASHBOARD STATS

export interface DashboardOverview {
  totalStudents: number;
  totalAdmins: number;
  totalUsers: number;
  totalItems: number;
  totalZones: number;
  totalChats: number;
  pendingDisputes: number;
  totalComments: number;
}

export interface DashboardItems {
  lost: number;
  found: number;
  returned: number;
  active: number;
  resolutionRate: string;
}

export interface RecentItem {
  _id: string;
  itemName: string;
  status: string;
  createdAt: string;
  images: { url: string }[];
}

export interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface CollegeInfo {
  _id: string;
  name: string;
  shortName: string;
  logo?: { url: string };
}

export interface DashboardStatsResponse {
  success: boolean;
  data: {
    overview: DashboardOverview;
    items: DashboardItems;
    recentItems: RecentItem[];
    recentUsers: RecentUser[];
    college?: CollegeInfo;
  };
}

//  ITEMS STATS

export interface ItemsByStatus {
  _id: string;
  count: number;
}

export interface ItemsByCategory {
  _id: string;
  count: number;
}

export interface ItemsByZone {
  _id: string;
  count: number;
}

export interface DailyTrend {
  _id: string;
  count: number;
}

export interface ItemsStatsResponse {
  success: boolean;
  data: {
    period: string;
    total: number;
    itemsByStatus: ItemsByStatus[];
    itemsByCategory: ItemsByCategory[];
    itemsByZone: ItemsByZone[];
    dailyTrend: DailyTrend[];
  };
}

//  USERS STATS

export interface UsersByRole {
  _id: string;
  count: number;
}

export interface UsersByCollege {
  _id: string;
  count: number;
}

export interface ActiveByDay {
  _id: string;
  count: number;
}

export interface UsersStatsResponse {
  success: boolean;
  data: {
    overview: {
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      verifiedUsers: number;
      unverifiedUsers: number;
      recentRegistrations: number;
    };
    usersByRole: UsersByRole[];
    usersByCollege: UsersByCollege[] | null;
    activeByDay: ActiveByDay[];
  };
}

//  ZONES STATS

export interface ZonesByType {
  _id: string;
  count: number;
}

export interface ZoneWithItems {
  zoneName: string;
  zoneType: string;
  itemCount: number;
}

export interface ZonesStatsResponse {
  success: boolean;
  data: {
    overview: {
      totalZones: number;
      activeZones: number;
      inactiveZones: number;
      indoorZones: number;
      outdoorZones: number;
    };
    zonesByType: ZonesByType[];
    zonesWithItems: ZoneWithItems[];
  };
}

//  DISPUTES STATS

export interface DisputesByStatus {
  _id: string;
  count: number;
}

export interface DisputesByType {
  _id: string;
  count: number;
}

export interface DisputesByPriority {
  _id: string;
  count: number;
}

export interface ResolutionTime {
  average: number;
  fastest: number;
  slowest: number;
}

export interface DisputesStatsResponse {
  success: boolean;
  data: {
    overview: {
      totalDisputes: number;
      openDisputes: number;
      underReview: number;
      escalated: number;
      resolved: number;
    };
    disputesByStatus: DisputesByStatus[];
    disputesByType: DisputesByType[];
    disputesByPriority: DisputesByPriority[];
    resolutionTime: ResolutionTime | null;
  };
}

//  CHATS STATS

export interface ChatsByItem {
  _id: string;
  count: number;
}

export interface MessagesTrend {
  _id: string;
  count: number;
}

export interface ChatsStatsResponse {
  success: boolean;
  data: {
    overview: {
      totalChats: number;
      activeChats: number;
      pendingRequests: number;
    };
    chatsByItem: ChatsByItem[];
    messagesTrend: MessagesTrend[];
  };
}

//  COLLEGES STATS (Super Admin)

export interface CollegeStatsItem {
  collegeId: string;
  collegeName: string;
  shortName: string;
  domain: string;
  stats: {
    users: {
      students: number;
      admins: number;
      total: number;
    };
    items: {
      lost: number;
      found: number;
      returned: number;
      total: number;
      resolutionRate: string;
    };
    zones: number;
    chats: number;
  };
}

export interface CollegesStatsSummary {
  totalColleges: number;
  totalStudents: number;
  totalAdmins: number;
  totalItems: number;
  totalZones: number;
  totalChats: number;
}

export interface CollegesStatsResponse {
  success: boolean;
  data: {
    colleges: CollegeStatsItem[];
    summary: CollegesStatsSummary;
  };
}

//  EXPORT ANALYTICS

export interface ExportAnalyticsData {
  items: ItemsByStatus[];
  users: UsersByRole[];
  zones: ZonesByType[];
  disputes: DisputesByStatus[];
}

export interface ExportAnalyticsResponse {
  success: boolean;
  data: {
    generatedAt: string;
    period: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    data: ExportAnalyticsData;
  };
}
