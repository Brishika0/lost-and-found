import { useParams, useNavigate } from "react-router-dom";
import { useDispute, useAddDisputeMessage } from "@/hooks/useDisputes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowUpCircle,
  Eye,
  Download,
  Info,
  ArrowLeft,
  Paperclip,
  X,
  Loader2,
  Send,
  Tag,
  User,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  Dispute,
  DisputeStatus,
  DisputeType,
  Priority,
} from "@/types/dispute.types";

// Status Configuration
const statusConfig: Record<
  DisputeStatus,
  {
    label: string;
    color: string;
    badgeColor: string;
    icon: any;
    bgGradient: string;
  }
> = {
  open: {
    label: "Open",
    color: "text-red-700",
    badgeColor: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    bgGradient: "from-red-50 to-red-100/50",
  },
  under_review: {
    label: "Under Review",
    color: "text-yellow-700",
    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Eye,
    bgGradient: "from-yellow-50 to-yellow-100/50",
  },
  escalated: {
    label: "Escalated",
    color: "text-orange-700",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    icon: ArrowUpCircle,
    bgGradient: "from-orange-50 to-orange-100/50",
  },
  resolved: {
    label: "Resolved",
    color: "text-green-700",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    bgGradient: "from-green-50 to-green-100/50",
  },
  closed: {
    label: "Closed",
    color: "text-gray-700",
    badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FileText,
    bgGradient: "from-gray-50 to-gray-100/50",
  },
};

const priorityConfig: Record<
  Priority,
  { label: string; color: string; bgColor: string }
> = {
  low: { label: "Low", color: "text-gray-700", bgColor: "bg-gray-100" },
  medium: {
    label: "Medium",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  high: { label: "High", color: "text-orange-700", bgColor: "bg-orange-100" },
  urgent: { label: "Urgent", color: "text-red-700", bgColor: "bg-red-100" },
};

const typeLabels: Record<DisputeType, string> = {
  wrongful_claim: "Wrongful Claim",
  item_damage: "Item Damage",
  fake_item: "Fake Item",
  harassment: "Harassment",
  communication_issue: "Communication Issue",
  other: "Other",
};

export default function UserDisputeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const tabsRef = useRef<HTMLDivElement>(null);

  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const { data, isLoading, error, refetch } = useDispute(id!);
  const { mutate: addMessage, isPending: isSending } = useAddDisputeMessage();

  const dispute = data?.data?.dispute as Dispute | undefined;

  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        const offset = tabsRef.current.offsetTop;
        setIsSticky(window.scrollY > offset - 60);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !dispute) return;

    addMessage(
      {
        id: dispute._id,
        data: {
          content: newMessage.trim(),
          attachments: attachments.filter((a) => a.trim()),
        },
      },
      {
        onSuccess: () => {
          setNewMessage("");
          setAttachments([]);
          refetch();
        },
        onError: (error: any) => {
          console.error("Error sending message:", error);
        },
      },
    );
  };

  const handleAddAttachment = () => {
    if (attachmentUrl.trim() && !attachments.includes(attachmentUrl.trim())) {
      setAttachments([...attachments, attachmentUrl.trim()]);
      setAttachmentUrl("");
    }
  };

  const handleRemoveAttachment = (url: string) => {
    setAttachments(attachments.filter((a) => a !== url));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-4 h-10 w-32" />
          <Skeleton className="mb-6 h-40 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 shadow-lg">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Dispute Not Found
          </h2>
          <p className="mb-6 text-gray-500">
            The dispute you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button
            onClick={() => navigate("/my-disputes")}
            className="gap-2 shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Disputes
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[dispute.status]?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300",
          isSticky ? "pt-0 pb-4" : "pt-0 pb-4",
        )}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/my-disputes")}
            className="mb-2 gap-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Disputes
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-white">
                {dispute.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Created {formatDistanceToNow(new Date(dispute.createdAt))}{" "}
                    ago
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>ID: {dispute._id.slice(-8)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge
                className={cn(
                  "gap-1 shadow-lg",
                  statusConfig[dispute.status]?.badgeColor,
                )}
              >
                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                {statusConfig[dispute.status]?.label}
              </Badge>
              <Badge
                className={cn(
                  "shadow-lg",
                  priorityConfig[dispute.priority]?.bgColor,
                  priorityConfig[dispute.priority]?.color,
                )}
              >
                {priorityConfig[dispute.priority]?.label} Priority
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Tabs Navigation */}
      <div
        ref={tabsRef}
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          isSticky
            ? "border-b border-gray-200 bg-white shadow-lg"
            : "border-b border-gray-100 bg-white/80 backdrop-blur-sm",
        )}
      >
        <div className="mx-auto max-w-4xl px-4">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto">
            {[
              { id: "details", label: "Details", icon: Info },
              { id: "item", label: "Item Info", icon: Tag },
              {
                id: "messages",
                label: "Messages",
                icon: MessageSquare,
                count: dispute.messages?.length || 0,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                  {isActive && (
                    <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-300">
            {/* Dispute Information Card */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div
                className={cn(
                  "h-1 w-full bg-gradient-to-r",
                  statusConfig[dispute.status]?.bgGradient,
                )}
              />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                  Dispute Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <Label className="text-xs tracking-wider text-gray-500 uppercase">
                      Type
                    </Label>
                    <p className="mt-1 font-semibold text-gray-900">
                      {typeLabels[dispute.type] || dispute.type}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <Label className="text-xs tracking-wider text-gray-500 uppercase">
                      Created
                    </Label>
                    <p className="mt-1 font-semibold text-gray-900">
                      {format(
                        new Date(dispute.createdAt),
                        "dd MMM yyyy, hh:mm a",
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs tracking-wider text-gray-500 uppercase">
                    Description
                  </Label>
                  <div className="mt-2 rounded-lg bg-gray-50 p-4">
                    <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                      {dispute.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parties Involved Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  Parties Involved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 shadow-md ring-2 ring-white">
                        <AvatarImage src={dispute.reportedBy?.avatar} />
                        <AvatarFallback className="bg-blue-500 text-lg text-white">
                          {dispute.reportedBy?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {dispute.reportedBy?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {dispute.reportedBy?.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-blue-700">
                      <div className="rounded-full bg-blue-200 px-2 py-0.5">
                        Reporter
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 shadow-md ring-2 ring-white">
                        <AvatarImage src={dispute.reportedAgainst?.avatar} />
                        <AvatarFallback className="bg-red-500 text-lg text-white">
                          {dispute.reportedAgainst?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {dispute.reportedAgainst?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {dispute.reportedAgainst?.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-700">
                      <div className="rounded-full bg-red-200 px-2 py-0.5">
                        Reported Against
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resolution Details */}
            {dispute.resolution && (
              <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Resolution Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-white/50 p-3">
                      <Label className="text-xs tracking-wider text-green-700 uppercase">
                        Resolution Type
                      </Label>
                      <p className="mt-1 font-semibold text-green-900">
                        {dispute.resolution.type
                          ?.replace(/_/g, " ")
                          .toUpperCase()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/50 p-3">
                      <Label className="text-xs tracking-wider text-green-700 uppercase">
                        Resolved By
                      </Label>
                      <p className="mt-1 font-semibold text-green-900">
                        {dispute.resolution.resolvedBy?.name}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/50 p-3">
                    <Label className="text-xs tracking-wider text-green-700 uppercase">
                      Resolution Description
                    </Label>
                    <p className="mt-1 text-green-800">
                      {dispute.resolution.description}
                    </p>
                  </div>
                  {dispute.resolution.actionTaken && (
                    <div className="rounded-lg bg-white/50 p-3">
                      <Label className="text-xs tracking-wider text-green-700 uppercase">
                        Action Taken
                      </Label>
                      <p className="mt-1 text-green-800">
                        {dispute.resolution.actionTaken}
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg bg-white/50 p-3">
                    <Label className="text-xs tracking-wider text-green-700 uppercase">
                      Resolved At
                    </Label>
                    <p className="mt-1 font-medium text-green-800">
                      {format(
                        new Date(dispute.resolution.resolvedAt),
                        "dd MMM yyyy, hh:mm a",
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Item Info Tab */}
        {activeTab === "item" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-300">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5 text-blue-600" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/30 p-4">
                    <Label className="text-xs tracking-wider text-gray-500 uppercase">
                      Item Name
                    </Label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {dispute.itemId?.itemName || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/30 p-4">
                    <Label className="text-xs tracking-wider text-gray-500 uppercase">
                      Item Status
                    </Label>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {dispute.itemId?.status || "N/A"}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <Label className="text-xs tracking-wider text-gray-500 uppercase">
                    Description
                  </Label>
                  <p className="mt-2 leading-relaxed text-gray-700">
                    {dispute.itemId?.description || "No description provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Item Images */}
            {dispute.itemId?.images && dispute.itemId.images.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Images ({dispute.itemId.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {dispute.itemId.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-100 shadow-md transition-all hover:shadow-xl"
                        onClick={() => window.open(img.url, "_blank")}
                      >
                        <img
                          src={img.url}
                          alt={`Item ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {img.isPrimary && (
                          <div className="absolute top-2 left-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white shadow-lg">
                            Primary
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 duration-300">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <CardContent className="p-0">
                {/* Messages List */}
                <div className="max-h-[500px] space-y-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4">
                  {dispute.messages && dispute.messages.length > 0 ? (
                    dispute.messages.map((msg, index) => {
                      const isOwnMessage =
                        msg.userId?._id === dispute.reportedBy?._id;
                      return (
                        <div
                          key={index}
                          className={cn(
                            "animate-in fade-in slide-in-from-bottom-2 flex gap-3 duration-300",
                            isOwnMessage ? "flex-row-reverse" : "",
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0 shadow-md">
                            <AvatarImage src={msg.userId?.avatar} />
                            <AvatarFallback
                              className={cn(
                                "text-xs",
                                isOwnMessage
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-300",
                              )}
                            >
                              {msg.userId?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "flex-1",
                              isOwnMessage ? "items-end" : "",
                            )}
                          >
                            <div
                              className={cn(
                                "inline-block max-w-[80%] rounded-2xl p-3 shadow-sm",
                                isOwnMessage
                                  ? "rounded-tr-sm bg-blue-600 text-white"
                                  : "rounded-tl-sm border border-gray-200 bg-white text-gray-900",
                              )}
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-xs font-medium opacity-90">
                                  {msg.userId?.name}
                                </span>
                                {msg.isAdmin && (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "px-1 py-0 text-[10px]",
                                      isOwnMessage
                                        ? "border-white/50 text-white"
                                        : "",
                                    )}
                                  >
                                    Admin
                                  </Badge>
                                )}
                                <span
                                  className={cn(
                                    "text-[10px] opacity-70",
                                    isOwnMessage
                                      ? "text-white/70"
                                      : "text-gray-400",
                                  )}
                                >
                                  {formatDistanceToNow(new Date(msg.createdAt))}{" "}
                                  ago
                                </span>
                              </div>
                              <p className="text-sm break-words whitespace-pre-wrap">
                                {msg.content}
                              </p>
                              {msg.attachments &&
                                msg.attachments.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {msg.attachments.map((url, idx) => (
                                      <Button
                                        key={idx}
                                        variant="link"
                                        size="sm"
                                        className={cn(
                                          "h-auto p-0 text-xs",
                                          isOwnMessage
                                            ? "text-white/80 hover:text-white"
                                            : "text-blue-600",
                                        )}
                                        onClick={() =>
                                          window.open(url, "_blank")
                                        }
                                      >
                                        <Download className="mr-1 h-3 w-3" />
                                        Attachment
                                      </Button>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <MessageSquare className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-500">
                        No messages yet
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        Start the conversation by adding a message below
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 bg-white p-4">
                  {attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {attachments.map((url, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm"
                        >
                          <span className="max-w-[200px] truncate text-gray-600">
                            {url}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 rounded-full p-0 hover:bg-gray-200"
                            onClick={() => handleRemoveAttachment(url)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mb-3 flex gap-2">
                    <Input
                      placeholder="Paste image/document URL..."
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddAttachment}
                      disabled={!attachmentUrl.trim()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[80px] resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="self-end bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <span>💡</span> Press{" "}
                    <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                      Enter
                    </kbd>{" "}
                    to send,{" "}
                    <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                      Shift + Enter
                    </kbd>{" "}
                    for new line
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
