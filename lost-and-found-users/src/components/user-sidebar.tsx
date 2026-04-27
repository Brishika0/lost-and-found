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
  Home,
  Scale,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Bell,
  MessageCircle,
  Heart,
  HelpCircle,
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
import { useNotifications } from "@/contexts/NotificationContext";

const mainNavigation = [
  {
    title: "Feed",
    path: "/",
    icon: Home,
  },
  {
    title: "My Items",
    path: "/my-items",
    icon: Heart,
  },
  {
    title: "Create Post",
    path: "/create-post",
    icon: PlusCircle,
  },
  {
    title: "My Disputes",
    path: "/my-disputes",
    icon: Scale,
  },
];

const communicationItems = [
  {
    title: "Messages",
    path: "/messages",
    icon: MessageCircle,
  },
  {
    title: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
];

const accountItems = [
  {
    title: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    path: "/support",
    icon: HelpCircle,
  },
];

export default function UserSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { unreadCount } = useNotifications();

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

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-white">
      <SidebarHeader className="border-b px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <span className="text-sm font-bold text-white">LF</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 group-data-[collapsible=icon]:hidden">
            Lost & Found
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-400 group-data-[collapsible=icon]:hidden">
            Main
          </SidebarGroupLabel>
          <SidebarMenu>
            {mainNavigation.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "w-full rounded-lg transition-all duration-200",
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Link to={item.path}>
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isActive(item.path) && "text-blue-600",
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

        {/* Communication */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-400 group-data-[collapsible=icon]:hidden">
            Communication
          </SidebarGroupLabel>
          <SidebarMenu>
            {communicationItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "w-full rounded-lg transition-all duration-200",
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Link
                    to={item.path}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <item.icon
                        className={cn(
                          "h-4 w-4",
                          isActive(item.path) && "text-blue-600",
                        )}
                      />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </div>
                    {unreadCount > 0 && item.title === "Notifications" && (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                        {unreadCount}
                      </div>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-400 group-data-[collapsible=icon]:hidden">
            Account
          </SidebarGroupLabel>
          <SidebarMenu>
            {accountItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "w-full rounded-lg transition-all duration-200",
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Link to={item.path}>
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isActive(item.path) && "text-blue-600",
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
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        {/* User Info */}
        {user && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-gray-50 p-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <span className="text-sm font-medium">
                {getInitials(user.name || user.email)}
              </span>
            </div>
            <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium text-gray-900">
                {user.name || "User"}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Logout"
              onClick={handleLogoutClick}
              className="w-full rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <button className="flex w-full items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">
                  Logout
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? You will need to sign in again
                to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmLogout}
                className="bg-red-600 hover:bg-red-700"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
}
