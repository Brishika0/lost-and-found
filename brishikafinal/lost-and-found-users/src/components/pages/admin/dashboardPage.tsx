import { useState } from "react";
import {
  useDashboardStats,
  useItemsStats,
  useUsersStats,
  useZonesStats,
  useDisputesStats,
  useChatsStats,
} from "@/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Package,
  MapPin,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  CheckCircle,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

//  TYPES

type PeriodType = "day" | "week" | "month" | "year";

//  STAT CARDS

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-8 w-20" />
        </CardContent>
      </Card>
    );
  }

  const trendColor =
    trend && trend > 0
      ? "text-green-600"
      : trend && trend < 0
        ? "text-red-600"
        : "text-gray-500";
  const TrendIcon =
    trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;

  return (
    <Card className="gap-1 overflow-hidden py-2">
      <CardContent className="gap-0 space-y-0 p-2 py-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <div className={cn("rounded-full p-2", `bg-${color}-100`)}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value.toLocaleString()}</span>
          {trend !== undefined && (
            <span
              className={cn(
                "flex items-center text-xs font-medium",
                trendColor,
              )}
            >
              <TrendIcon className="mr-0.5 h-3 w-3" />
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </CardContent>
      <div className={cn("h-1 w-full", `bg-${color}-500`)} />
    </Card>
  );
}

//  CHART COMPONENTS

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function ChartCard({ title, children, action }: ChartCardProps) {
  return (
    <Card className="px-2 py-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

//  MAIN COMPONENT

export default function StatsDashboard() {
  const [period, setPeriod] = useState<PeriodType>("month");

  // Queries
  const { data: dashboardData, isLoading: dashboardLoading } =
    useDashboardStats();
  const { data: itemsStats, isLoading: itemsLoading } = useItemsStats({
    period,
  });
  const { data: usersStats, isLoading: usersLoading } = useUsersStats();
  const { data: zonesStats, isLoading: zonesLoading } = useZonesStats();
  const { data: disputesStats, isLoading: disputesLoading } =
    useDisputesStats();
  const { data: chatsStats, isLoading: chatsLoading } = useChatsStats();

  const isLoading =
    dashboardLoading ||
    itemsLoading ||
    usersLoading ||
    zonesLoading ||
    disputesLoading ||
    chatsLoading;

  // Prepare chart data
  const itemsByCategoryData =
    itemsStats?.data.itemsByCategory.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  const itemsByStatusData =
    itemsStats?.data.itemsByStatus.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
    })) || [];

  const dailyTrendData =
    itemsStats?.data.dailyTrend.map((day) => ({
      date: day._id,
      count: day.count,
    })) || [];

  const usersByRoleData =
    usersStats?.data.usersByRole.map((role) => ({
      name:
        role._id === "college_admin"
          ? "College Admins"
          : role._id === "student"
            ? "Students"
            : role._id,
      value: role.count,
    })) || [];

  const zonesByTypeData =
    zonesStats?.data.zonesByType.map((zone) => ({
      name: zone._id.charAt(0).toUpperCase() + zone._id.slice(1),
      value: zone.count,
    })) || [];

  const disputesByTypeData =
    disputesStats?.data.disputesByType.map((dispute) => ({
      name: dispute._id.replace("_", " "),
      value: dispute.count,
    })) || [];

  const chatsByItemData =
    chatsStats?.data.chatsByItem.slice(0, 5).map((chat) => ({
      name: chat._id.length > 20 ? chat._id.slice(0, 20) + "..." : chat._id,
      value: chat.count,
    })) || [];

  const messagesTrendData =
    chatsStats?.data.messagesTrend.map((day) => ({
      date: day._id,
      messages: day.count,
    })) || [];

  const overview = dashboardData?.data.overview;
  const itemsOverview = dashboardData?.data.items;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Your college's performance metrics
            </p>
          </div>
          <div className="flex gap-3">
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as PeriodType)}
            >
              <SelectTrigger className="w-[130px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button> */}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={overview?.totalUsers || 0}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            color="blue"
            loading={isLoading}
          />
          <StatCard
            title="Total Items"
            value={overview?.totalItems || 0}
            icon={<Package className="h-5 w-5 text-green-600" />}
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="Active Items"
            value={itemsOverview?.active || 0}
            icon={<Eye className="h-5 w-5 text-yellow-600" />}
            color="yellow"
            loading={isLoading}
          />
          <StatCard
            title="Resolution Rate"
            value={itemsOverview?.resolutionRate || "0%"}
            icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
            color="emerald"
            loading={isLoading}
          />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Zones"
            value={zonesStats?.data.overview.totalZones || 0}
            icon={<MapPin className="h-5 w-5 text-orange-600" />}
            color="orange"
            loading={zonesLoading}
          />
          <StatCard
            title="Active Zones"
            value={zonesStats?.data.overview.activeZones || 0}
            icon={<MapPin className="h-5 w-5 text-green-600" />}
            color="green"
            loading={zonesLoading}
          />
          <StatCard
            title="Total Chats"
            value={chatsStats?.data.overview.totalChats || 0}
            icon={<MessageCircle className="h-5 w-5 text-purple-600" />}
            color="purple"
            loading={chatsLoading}
          />
          <StatCard
            title="Pending Disputes"
            value={disputesStats?.data.overview.openDisputes || 0}
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            color="red"
            loading={disputesLoading}
          />
        </div>

        {/* Tabs for Detailed Charts */}
        <Tabs defaultValue="items" className="mt-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="zones">Zones</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Daily Activity Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Items by Category">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={itemsByCategoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Items by Status">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={itemsByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent! * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {itemsByStatusData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top Zones by Items">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={itemsStats?.data.itemsByZone || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Users by Role">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usersByRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent! * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {usersByRoleData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="User Activity (Last 7 Days)">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={usersStats?.data.activeByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#8b5cf6"
                      fill="#c4b5fd"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="User Statistics">
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-semibold text-green-600">
                      {usersStats?.data.overview.activeUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Inactive Users</span>
                    <span className="font-semibold text-red-600">
                      {usersStats?.data.overview.inactiveUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Verified Email</span>
                    <span className="font-semibold text-blue-600">
                      {usersStats?.data.overview.verifiedUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Unverified Email</span>
                    <span className="font-semibold text-yellow-600">
                      {usersStats?.data.overview.unverifiedUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New (Last 30 days)</span>
                    <span className="font-semibold text-purple-600">
                      {usersStats?.data.overview.recentRegistrations || 0}
                    </span>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Zones Tab */}
          <TabsContent value="zones" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Zones by Type">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={zonesByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent! * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {zonesByTypeData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top Zones with Most Items">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={zonesStats?.data.zonesWithItems || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="zoneName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="itemCount" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Zone Statistics">
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Zones</span>
                    <span className="font-semibold">
                      {zonesStats?.data.overview.totalZones || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Active Zones</span>
                    <span className="font-semibold text-green-600">
                      {zonesStats?.data.overview.activeZones || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Inactive Zones</span>
                    <span className="font-semibold text-red-600">
                      {zonesStats?.data.overview.inactiveZones || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Indoor / Outdoor</span>
                    <span className="font-semibold">
                      {zonesStats?.data.overview.indoorZones || 0} /{" "}
                      {zonesStats?.data.overview.outdoorZones || 0}
                    </span>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Disputes by Type">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={disputesByTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Disputes by Status">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={disputesStats?.data.disputesByStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent! * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(disputesStats?.data.disputesByStatus || []).map(
                        (_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Disputes by Priority">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={disputesStats?.data.disputesByPriority || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Resolution Time">
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Average Resolution</span>
                    <span className="font-semibold">
                      {disputesStats?.data.resolutionTime
                        ? `${disputesStats.data.resolutionTime.average.toFixed(1)} hours`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Fastest Resolution</span>
                    <span className="font-semibold text-green-600">
                      {disputesStats?.data.resolutionTime
                        ? `${disputesStats.data.resolutionTime.fastest.toFixed(1)} hours`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slowest Resolution</span>
                    <span className="font-semibold text-red-600">
                      {disputesStats?.data.resolutionTime
                        ? `${disputesStats.data.resolutionTime.slowest.toFixed(1)} hours`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Chats Tab */}
          <TabsContent value="chats" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Message Activity Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={messagesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      stroke="#06b6d4"
                      fill="#67e8f9"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top Items by Chat Activity">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chatsByItemData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Chat Statistics">
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Conversations</span>
                    <span className="font-semibold">
                      {chatsStats?.data.overview.totalChats || 0}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Active Chats</span>
                    <span className="font-semibold text-green-600">
                      {chatsStats?.data.overview.activeChats || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Requests</span>
                    <span className="font-semibold text-yellow-600">
                      {chatsStats?.data.overview.pendingRequests || 0}
                    </span>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity Section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                📦 Recent Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.data.recentItems?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 border-b pb-3 last:border-0"
                  >
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.images?.[0] && (
                        <img
                          src={item.images[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        item.status === "lost" && "bg-red-100 text-red-600",
                        item.status === "found" &&
                          "bg-green-100 text-green-600",
                        item.status === "returned" &&
                          "bg-blue-100 text-blue-600",
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
                {(!dashboardData?.data.recentItems ||
                  dashboardData.data.recentItems.length === 0) && (
                  <p className="text-center text-gray-500">No recent items</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                👥 Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.data.recentUsers?.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 border-b pb-3 last:border-0"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Badge variant="outline">
                      {user.role === "college_admin" ? "Admin" : "Student"}
                    </Badge>
                  </div>
                ))}
                {(!dashboardData?.data.recentUsers ||
                  dashboardData.data.recentUsers.length === 0) && (
                  <p className="text-center text-gray-500">No recent users</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
