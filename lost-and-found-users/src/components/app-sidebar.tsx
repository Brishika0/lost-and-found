import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Shield,
  User,
  Building,
  BanIcon,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const managementItems = [
  {
    title: "College Zones",
    path: "/admin/zones",
    icon: Building,
  },
  {
    title: "Students",
    path: "/admin/students",
    icon: GraduationCap,
  },
  {
    title: "Posts",
    path: "/admin/lost-items",
    icon: FileText,
  },
  {
    title: "Disputes",
    path: "/admin/disputes",
    icon: BanIcon,
  },
  {
    title: "Coupons",
    path: "/admin/coupons",
    icon: Ticket,
  },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Add this inside your AppSidebar component
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Building2 className="text-primary h-6 w-6 flex-shrink-0" />
          {/* Logo text - hidden when collapsed */}
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Lost & Found
          </span>
        </div>

        {/* User info - hidden when collapsed */}
        {user && (
          <div className="text-muted-foreground mt-2 text-xs group-data-[collapsible=icon]:hidden">
            <span className="block truncate">{user.email}</span>
            <span className="bg-primary/10 text-primary mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
              <Shield className="h-3 w-3" />
              {user.role}
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="gap-0 space-y-0">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Main
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Dashboard"
                className={cn(
                  "hover:bg-primary/10 transition-all duration-200",
                  isActive("/admin/dashboard") &&
                    "bg-primary/20 text-primary border-r-2 border-blue-500",
                )}
              >
                <Link to="/admin/dashboard">
                  <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Dashboard
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarMenu>
            {managementItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "hover:bg-primary/10 transition-all duration-200",
                    isActive(item.path) &&
                      "bg-primary/20 text-primary border-r-2 border-blue-500",
                  )}
                >
                  <Link to={item.path}>
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive(item.path) && "text-primary",
                      )}
                    />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Reports Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Reports & Analytics
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Analytics"
                className={cn(
                  "hover:bg-primary/10 transition-all duration-200",
                  isActive("/analytics") &&
                    "bg-primary/20 text-primary border-primary border-r-2 border-blue-500",
                )}
              >
                <Link to="/admin/dashboard">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Analytics
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Settings
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Settings"
                className={cn(
                  "hover:bg-primary/10 transition-all duration-200",
                  isActive("/settings") &&
                    "bg-primary/20 text-primary border-primary border-r-2 border-blue-500",
                )}
              >
                <Link to="/admin/dashboard">
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Settings
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Logout"
                onClick={handleLogoutClick}
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <button className="flex w-full items-center gap-2">
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Logout
                  </span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Login"
                className={cn(
                  "hover:bg-primary/10 transition-all duration-200",
                  isActive("/") &&
                    "bg-primary/20 text-primary border-r-2 border-blue-500",
                )}
              >
                <Link to="/login">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Login
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Add this AlertDialog component */}
          <AlertDialog
            open={showLogoutDialog}
            onOpenChange={setShowLogoutDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to logout?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You will be redirected to the login page and will need to sign
                  in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmLogout}
                  variant="destructive"
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
