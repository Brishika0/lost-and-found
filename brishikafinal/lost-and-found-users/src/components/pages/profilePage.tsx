import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Building2,
  CalendarDays,
  Shield,
  Edit,
  LogOut,
  Bell,
  ChevronRight,
  Package,
  Scale,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePasswordDialog } from "../dialogs/changePasswordDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RewardPointsBadge } from "../RewardPointsBadge";

export function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="mb-4 text-6xl">👤</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Not Logged In
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              Please login to view your profile
            </p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRole = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "college_admin":
        return "College Admin";
      default:
        return "Student";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "college_admin":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <Card className="sticky top-0 mb-2 overflow-hidden rounded-t-none border-0 p-0 shadow-sm md:mb-6">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500" />
        <CardContent className="relative px-6 pb-6">
          <div className="-mt-12 flex flex-col items-center sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-2xl text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h1>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {formatRole(user.role)}
                  </Badge>
                  {!user.isEmailVerified && (
                    <Badge variant="destructive">Unverified</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/edit-profile")}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <ChangePasswordDialog />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to logout? You will need to sign in
                      again to access your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={logout}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="px-4">
        <Link to="/my-rewards">
          <RewardPointsBadge
            variant="default"
            showLevel={true}
            className="rounded-none"
          />
        </Link>
      </div>

      <div className="p-4 pb-8">
        {/* Info Grid - 3 columns on desktop, 1 on mobile */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Personal Information */}
          <Card className="gap-0 py-3 shadow-sm md:col-span-2">
            <CardHeader className="border-b [.border-b]:pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <User className="h-4 w-4 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Full Name"
                  value={user.name}
                  icon={<User className="h-4 w-4" />}
                />
                <InfoItem
                  label="Email"
                  value={user.email}
                  icon={<Mail className="h-4 w-4" />}
                  badge={
                    user.isEmailVerified ? (
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-xs text-green-600"
                      >
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-yellow-200 bg-yellow-50 text-xs text-yellow-600"
                      >
                        Unverified
                      </Badge>
                    )
                  }
                />
                <InfoItem
                  label="Role"
                  value={formatRole(user.role)}
                  icon={<Shield className="h-4 w-4" />}
                />
                <InfoItem
                  label="Member Since"
                  value={formatDate(user.createdAt)}
                  icon={<CalendarDays className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="gap-0 py-3 shadow-sm">
            <CardHeader className="border-b [.border-b]:pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Shield className="h-4 w-4 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-gray-100"
                onClick={() => navigate("/my-items")}
              >
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  My Items
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-gray-100"
                onClick={() => navigate("/my-disputes")}
              >
                <span className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  My Disputes
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
              <Separator />
              <Button
                variant="ghost"
                className="w-full justify-between hover:bg-gray-100"
                onClick={() => navigate("/settings")}
              >
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Settings
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* College Information - Full width if exists */}
        {user.college && (
          <Card className="mt-6 gap-0 py-3 shadow-sm">
            <CardHeader className="border-b pb-3 [.border-b]:pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Building2 className="h-4 w-4 text-blue-600" />
                College Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="College Name"
                  value={user.college.name}
                  icon={<Building2 className="h-4 w-4" />}
                />
                <InfoItem
                  label="Domain"
                  value={user.college.domain}
                  icon={<Mail className="h-4 w-4" />}
                />
                {user.college.logo && (
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-500">
                      College Logo
                    </div>
                    <img
                      src={user.college.logo}
                      alt={user.college.name}
                      className="h-12 w-12 rounded-lg border object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper component for info items
function InfoItem({ label, value, icon, badge }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-gray-900">{value || "N/A"}</p>
          {badge}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="mb-6 overflow-hidden">
          <div className="h-24 bg-gray-200" />
          <CardContent className="relative px-6 pb-6">
            <div className="-mt-12 flex flex-col items-center sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="text-center sm:text-left">
                  <Skeleton className="mb-2 h-7 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="mt-6 h-40" />
      </div>
    </div>
  );
}
