import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageSquare,
  Heart,
  Scale,
  Award,
  Package,
  Clock,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

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
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>("all");
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotifications();

  // Filter notifications by type
  const filteredNotifications =
    filterType === "all"
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    if (notification.data?.postId) {
      navigate(`/post/${notification.data.postId}`);
    } else if (notification.data?.chatId) {
      navigate(`/chats/${notification.data.chatId}`);
    } else if (notification.data?.disputeId) {
      navigate(`/my-disputes/${notification.data.disputeId}`);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const notificationTypes = [
    { value: "all", label: "All", count: notifications.length },
    {
      value: "item_match",
      label: "Matches",
      count: notifications.filter((n) => n.type === "item_match").length,
    },
    {
      value: "chat_message",
      label: "Messages",
      count: notifications.filter((n) => n.type === "chat_message").length,
    },
    {
      value: "dispute_update",
      label: "Disputes",
      count: notifications.filter((n) => n.type === "dispute_update").length,
    },
    {
      value: "comment",
      label: "Interactions",
      count: notifications.filter((n) =>
        ["comment", "like", "share"].includes(n.type),
      ).length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Tabs */}
      <div className="sticky top-0 mb-2 flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-wrap gap-2 pb-2">
          {notificationTypes.map((type) => (
            <Button
              key={type.value}
              variant={filterType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type.value)}
              className="gap-2"
            >
              {type.label}
              {type.count > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {type.count}
                </Badge>
              )}
            </Button>
          ))}

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteAllRead()}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Clear read
          </Button>
        </div>
      </div>
      <div className="p-4">
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="p-0">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold">{notifications.length}</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Unread</p>
              <p className="text-xl font-bold text-blue-600">{unreadCount}</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Read</p>
              <p className="text-xl font-bold text-green-600">
                {notifications.length - unreadCount}
              </p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Last 7 days</p>
              <p className="text-xl font-bold text-purple-600">
                {
                  notifications.filter((n) => {
                    const daysDiff =
                      (Date.now() - new Date(n.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24);
                    return daysDiff <= 7;
                  }).length
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <p className="font-medium text-gray-500">No notifications</p>
              <p className="mt-1 text-sm text-gray-400">
                {filterType === "all"
                  ? "You don't have any notifications yet"
                  : `No ${filterType} notifications to show`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification._id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  !notification.isRead && "border-l-4 border-l-blue-500",
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {notification.data?.fromUserAvatar ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.data.fromUserAvatar} />
                          <AvatarFallback>
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
                        <div>
                          <p className="font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
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
                                className="border-green-200 bg-green-50 text-xs text-green-700"
                              >
                                {Math.round(notification.data.matchScore * 100)}
                                % match
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => handleDelete(notification._id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
