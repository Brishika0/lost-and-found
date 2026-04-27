import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Edit, Trash2, Loader2 } from "lucide-react";

// Shadcn imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import your existing hooks
import { useGetCollegeById } from "@/hooks/useColleges"; // Adjust path as needed

// Import tab components
import { OverviewTab } from "./collegeTabs/OverviewTab";
import { AdminsTab } from "./collegeTabs/AdminsTab";
import { ZonesTab } from "./collegeTabs/ZonesTab";
import { StatisticsTab } from "./collegeTabs/StatisticsTab";
import { ActivityTab } from "./collegeTabs/ActivityTab";

const CollegeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  // Only fetch basic college data here - tabs will fetch their own data
  const {
    data: collegeData,
    isLoading: collegeLoading,
    isError: collegeError,
    error: collegeErrorData,
  } = useGetCollegeById(id!);

  const college = collegeData;

  if (collegeLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (collegeError || !college) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error Loading College</AlertTitle>
          <AlertDescription>
            {collegeErrorData?.message || "Failed to load college details"}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="border-primary/20 h-20 w-20 border-2">
              <AvatarImage src={college.logo.url} alt={college.name} />
              <AvatarFallback className="bg-primary/10 text-2xl">
                {college.shortName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {college.name}
                </h1>
                <Badge variant={college.isActive ? "default" : "secondary"}>
                  {college.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className="bg-blue-50">
                  {college.shortName}
                </Badge>
              </div>
              <p className="mt-1 text-gray-600">{college.domain}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        defaultValue="overview"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="admins">
            Admins ({college.adminIds?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <OverviewTab college={college} />
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins">
          <AdminsTab collegeId={id!} />
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones">
          <ZonesTab />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          <StatisticsTab collegeId={id!} collegeName={college.name} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollegeDetailsPage;
