import React from "react";
import {
  Building2,
  Mail,
  Globe,
  Phone,
  MapPin,
  Users,
  Shield,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Import your stats hook
import { useGetCollegeStats } from "@/hooks/useColleges";
import type { College } from "@/types/college";

interface OverviewTabProps {
  college: College;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ college }) => {
  const { data: statsData, isLoading: statsLoading } = useGetCollegeStats(
    college._id,
  );
  const stats = statsData?.stats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Basic Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="text-primary mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-base">{college.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Short Name</p>
                <p className="text-base">{college.shortName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Domain</p>
                <p className="font-mono text-base">{college.domain}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-base">
                  {new Date(college.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium text-gray-500">
                Contact Information
              </p>
              <div className="space-y-2">
                {college.contactInfo.email && (
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${college.contactInfo.email}`}
                      className="text-primary hover:underline"
                    >
                      {college.contactInfo.email}
                    </a>
                  </div>
                )}
                {college.contactInfo.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${college.contactInfo.phone}`}
                      className="hover:underline"
                    >
                      {college.contactInfo.phone}
                    </a>
                  </div>
                )}
                {college.contactInfo.website && (
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-gray-400" />
                    <a
                      href={college.contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {college.contactInfo.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="text-primary mr-2 h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {college.location ? (
              <div className="space-y-3">
                {college.location.address && (
                  <p className="text-sm">{college.location.address}</p>
                )}
                <div className="text-sm text-gray-600">
                  {college.location.city && (
                    <span>{college.location.city}, </span>
                  )}
                  {college.location.state && (
                    <span>{college.location.state}, </span>
                  )}
                  {college.location.country && (
                    <span>{college.location.country}</span>
                  )}
                </div>
                {college.location.coordinates && (
                  <div className="mt-2 font-mono text-xs text-gray-500">
                    📍 {college.location.coordinates[1].toFixed(4)},{" "}
                    {college.location.coordinates[0].toFixed(4)}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No location data available</p>
            )}

            <div className="mt-4 border-t pt-4">
              <p className="mb-2 text-sm font-medium text-gray-500">
                Created By
              </p>
              <div className="flex items-center">
                <Avatar className="mr-2 h-8 w-8">
                  <AvatarFallback>
                    {college.createdBy?.name?.substring(0, 2).toUpperCase() ||
                      "SY"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {college.createdBy?.name || "System"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {college.createdBy?.email || "system@campus.com"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Students
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.users.totalUsers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500 opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Admins</p>
                    <p className="text-2xl font-bold">
                      {stats.users.totalAdmins}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500 opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Lost Items
                    </p>
                    <p className="text-2xl font-bold">{stats.items.total}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                    <span className="text-xl text-orange-600">?</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Returned
                    </p>
                    <p className="text-2xl font-bold">{stats.items.returned}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <span className="text-xl text-green-600">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </div>
  );
};
