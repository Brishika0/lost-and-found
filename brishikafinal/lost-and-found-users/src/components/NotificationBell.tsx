import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Bell,
  MessageSquare,
  Heart,
  Scale,
  CheckCircle,
  Award,
  Package,
  Clock,
  ChevronRight,
  Settings,
  BellOff,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Notification Icon Mapping
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "item_match":
      return <Award className="h-5 w-5 text-green-500" />;
    case "chat_request":
    case "chat_accepted":
    case "chat_message":
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case "item_claimed":
    case "item_returned":
      return <Package className="h-5 w-5 text-purple-500" />;
    case "dispute_update":
      return <Scale className="h-5 w-5 text-orange-500" />;
    case "comment":
    case "like":
    case "share":
      return <Heart className="h-5 w-5 text-red-500" />;
    case "admin_approval":
    case "flag_resolved":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

// Get notification action text
const getActionText = (notification: any) => {
  switch (notification.type) {
    case "item_match":
      return `matched with your ${notification.data?.matchScore ? Math.round(notification.data.matchScore * 100) : ""}%`;
    case "chat_request":
      return `wants to chat about "${notification.data?.itemName}"`;
    case "chat_accepted":
      return `accepted your chat request`;
    case "chat_message":
      return `sent you a message`;
    case "item_claimed":
      return `claimed your item "${notification.data?.itemName}"`;
    case "item_returned":
      return `returned your item "${notification.data?.itemName}"`;
    case "dispute_update":
      return `updated your dispute`;
    case "comment":
      return `commented on your post`;
    case "like":
      return `liked your post`;
    case "share":
      return `shared your post`;
    default:
      return notification.message;
  }
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setIsOpen(false);

    // Navigate based on notification type
    if (notification.data?.itemId) {
      navigate(`/post/${notification.data.itemId}`);
    } else if (notification.data?.chatId) {
      navigate(`/chats/${notification.data.chatId}`);
    } else if (notification.data?.disputeId) {
      navigate(`/my-disputes/${notification.data.disputeId}`);
    } else if (notification.data?.commentId) {
      navigate(
        `/post/${notification.data.itemId}#comment-${notification.data.commentId}`,
      );
    }
  };

  // Handle view all
  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full transition-colors hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[420px] overflow-hidden rounded-xl border-gray-200 p-0 shadow-xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900"
              >
                <CheckCheck className="mr-1 h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/notifications/settings")}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "relative flex-1 py-2.5 text-sm font-medium transition-colors",
              activeTab === "all"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            All
            {activeTab === "all" && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={cn(
              "relative flex-1 py-2.5 text-sm font-medium transition-colors",
              activeTab === "unread"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 px-1.5 text-xs text-white">
                {unreadCount}
              </Badge>
            )}
            {activeTab === "unread" && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-blue-600" />
            )}
          </button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[320px] overflow-scroll">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <BellOff className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-medium text-gray-500">No notifications yet</p>
              <p className="mt-1 text-sm text-gray-400">
                When you get notifications, they'll appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "group relative cursor-pointer transition-all hover:bg-gray-50",
                    !notification.isRead && "bg-blue-50/30",
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3 px-4 py-3">
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0">
                      {notification.data?.fromUserAvatar ? (
                        <Avatar className="h-10 w-10 shadow-sm ring-2 ring-white">
                          <AvatarImage src={notification.data.fromUserAvatar} />
                          <AvatarFallback className="bg-gray-200 text-gray-600">
                            {notification.data?.fromUserName
                              ?.charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                            {getActionText(notification)}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true },
                              )}
                            </span>
                            {notification.data?.matchScore && (
                              <Badge
                                variant="outline"
                                className="border-green-200 bg-green-50 px-1.5 py-0 text-[10px] text-green-700"
                              >
                                {Math.round(notification.data.matchScore * 100)}
                                % match
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="flex-shrink-0">
                            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Delete or more actions
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 p-2">
          <Button
            variant="ghost"
            onClick={handleViewAll}
            className="w-full justify-between text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            <span>View all notifications</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
