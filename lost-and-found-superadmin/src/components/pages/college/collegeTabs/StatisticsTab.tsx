import React from "react";
import { Users, Shield, Activity, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import your stats hook
import { useGetCollegeStats } from "@/hooks/useColleges";

interface StatisticsTabProps {
  collegeId: string;
  collegeName: string;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({
  collegeId,
  collegeName,
}) => {
  const { data: statsData, isLoading: statsLoading } =
    useGetCollegeStats(collegeId);

  const stats = statsData?.stats;
  //   const items = itemsData?.data;

  if (statsLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Activity className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No statistics available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Items Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Items Overview</CardTitle>
                <CardDescription>Lost & found items statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Items</span>
                    <span className="text-lg font-semibold">
                      {stats.items.total}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-600">Lost</span>
                      <span className="font-medium">{stats.items.lost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Found</span>
                      <span className="font-medium">{stats.items.found}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Returned</span>
                      <span className="font-medium">
                        {stats.items.returned}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Resolution Rate
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {stats.items.resolutionRate ||
                          Math.round(
                            (stats.items.returned / stats.items.total) * 100,
                          ) + "%"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>User Overview</CardTitle>
                <CardDescription>
                  User statistics for {collegeName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-600" />
                      <span>Total Students</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      {stats.users.totalStudents}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-green-600" />
                      <span>College Admins</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      {stats.users.totalAdmins}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                    <div className="flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-purple-600" />
                      <span>Active Chats</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">
                      {stats.chats.total}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Items Statistics</CardTitle>
              <CardDescription>Detailed item statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add more detailed item stats here */}
              <p className="text-gray-500">
                Detailed item statistics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>Detailed user statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add more detailed user stats here */}
              <p className="text-gray-500">
                Detailed user statistics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Trends & Analytics</CardTitle>
              <CardDescription>Monthly trends and patterns</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[300px] items-center justify-center">
              <p className="text-gray-500">Chart component would go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
