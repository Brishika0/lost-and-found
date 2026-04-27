import { useParams, useNavigate } from "react-router-dom";
import {
  useDispute,
  useAddDisputeMessage,
  useUpdateDisputeStatus,
  useResolveDispute,
  useEscalateDispute,
  useAssignAdminToDispute,
  useArchiveDispute,
} from "@/hooks/useDisputes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import {
  Calendar,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowUpCircle,
  Eye,
  Download,
  Clock,
  Info,
  ArrowLeft,
  UserCheck,
  Paperclip,
  X,
  Loader2,
  Send,
  Trash2,
} from "lucide-react";

// Status Configuration
const statusConfig = {
  open: {
    label: "Open",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: AlertTriangle,
    badgeColor: "bg-red-100 text-red-800",
  },
  under_review: {
    label: "Under Review",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Eye,
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
  escalated: {
    label: "Escalated",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: ArrowUpCircle,
    badgeColor: "bg-orange-100 text-orange-800",
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle,
    badgeColor: "bg-green-100 text-green-800",
  },
  closed: {
    label: "Closed",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    icon: FileText,
    badgeColor: "bg-gray-100 text-gray-800",
  },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const typeLabels: Record<string, string> = {
  wrongful_claim: "Wrongful Claim",
  item_damage: "Item Damage",
  fake_item: "Fake Item",
  harassment: "Harassment",
  communication_issue: "Communication Issue",
  other: "Other",
};

const resolutionTypes = [
  { value: "resolved_in_favor_of_reporter", label: "In Favor of Reporter" },
  { value: "resolved_in_favor_of_other", label: "In Favor of Reported User" },
  { value: "mutual_agreement", label: "Mutual Agreement" },
  { value: "no_action", label: "No Action Taken" },
  { value: "other", label: "Other" },
];

export default function DisputeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("details");
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState("");

  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState("");

  // Resolve form states
  const [resolutionType, setResolutionType] = useState(
    "resolved_in_favor_of_reporter",
  );
  const [resolutionDescription, setResolutionDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [updateItemStatus, setUpdateItemStatus] = useState<
    "claimed" | "returned" | "none"
  >("none");

  // Escalate form state
  const [escalationReason, setEscalationReason] = useState("");

  // Queries
  const { data, isLoading, error, refetch } = useDispute(id!);
  const { mutate: addMessage, isPending: isSending } = useAddDisputeMessage();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateDisputeStatus();
  const { mutate: resolveDispute, isPending: isResolving } =
    useResolveDispute();
  const { mutate: escalateDispute, isPending: isEscalating } =
    useEscalateDispute();
  const { mutate: assignAdmin, isPending: isAssigning } =
    useAssignAdminToDispute();
  const { mutate: archiveDispute, isPending: isArchiving } =
    useArchiveDispute();

  const dispute = data?.data?.dispute;

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

  const handleAssignAdmin = () => {
    if (!dispute || !selectedAdminId) return;

    assignAdmin(
      {
        id: dispute._id,
        data: { adminId: selectedAdminId },
      },
      {
        onSuccess: () => {
          setAssignDialogOpen(false);
          setSelectedAdminId("");
          refetch();
        },
        onError: (error: any) => {
          console.error("Error assigning admin:", error);
        },
      },
    );
  };

  const handleResolveDispute = () => {
    if (!dispute || !resolutionDescription.trim()) return;

    resolveDispute(
      {
        id: dispute._id,
        data: {
          resolutionType: resolutionType as any,
          description: resolutionDescription.trim(),
          actionTaken: actionTaken.trim() || undefined,
          updateItemStatus:
            updateItemStatus === "none" ? undefined : updateItemStatus,
        },
      },
      {
        onSuccess: () => {
          setResolveDialogOpen(false);
          setResolutionType("resolved_in_favor_of_reporter");
          setResolutionDescription("");
          setActionTaken("");
          setUpdateItemStatus("none");
          refetch();
        },
        onError: (error: any) => {
          console.error("Error resolving dispute:", error);
        },
      },
    );
  };

  const handleEscalateDispute = () => {
    if (!dispute || !escalationReason.trim()) return;

    escalateDispute(
      {
        id: dispute._id,
        data: { reason: escalationReason.trim() },
      },
      {
        onSuccess: () => {
          setEscalateDialogOpen(false);
          setEscalationReason("");
          refetch();
        },
        onError: (error: any) => {
          console.error("Error escalating dispute:", error);
        },
      },
    );
  };

  const handleArchiveDispute = () => {
    if (!dispute) return;

    archiveDispute(dispute._id, {
      onSuccess: () => {
        setArchiveDialogOpen(false);
        navigate("/disputes");
      },
      onError: (error: any) => {
        console.error("Error archiving dispute:", error);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    console.error("Error fetching dispute:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Dispute Not Found</h2>
          <p className="mb-6 text-gray-500">
            The dispute you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => navigate("/admin/disputes")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Disputes
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[dispute.status]?.icon;

  return (
    <div className="mx-auto">
      {/* Header Section */}
      <div className="mb-6 rounded-lg border bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/disputes")}
              className="-ml-2 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Disputes
            </Button>
            <div className="flex items-center gap-2">
              <Badge className={statusConfig[dispute.status]?.badgeColor}>
                {StatusIcon && <StatusIcon className="mr-1 h-3 w-3" />}
                {statusConfig[dispute.status]?.label}
              </Badge>
              <Badge className={priorityConfig[dispute.priority]?.color}>
                {priorityConfig[dispute.priority]?.label} Priority
              </Badge>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dispute.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">ID: {dispute._id}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Tabs */}
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="border-b px-6 pt-4">
              <div className="flex space-x-6">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`relative px-1 pb-3 text-sm font-medium transition-colors ${
                    activeTab === "details"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Info className="mr-2 inline h-4 w-4" />
                  Details
                </button>
                <button
                  onClick={() => setActiveTab("conversation")}
                  className={`relative px-1 pb-3 text-sm font-medium transition-colors ${
                    activeTab === "conversation"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MessageSquare className="mr-2 inline h-4 w-4" />
                  Messages ({dispute.messages?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("evidence")}
                  className={`relative px-1 pb-3 text-sm font-medium transition-colors ${
                    activeTab === "evidence"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FileText className="mr-2 inline h-4 w-4" />
                  Evidence ({dispute.evidence?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`relative px-1 pb-3 text-sm font-medium transition-colors ${
                    activeTab === "timeline"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Clock className="mr-2 inline h-4 w-4" />
                  Timeline
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Item Information */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-500">
                      Item Information
                    </h3>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="mb-1 text-xs text-gray-500">
                            Item Name
                          </p>
                          <p className="font-medium text-gray-900">
                            {dispute.itemId?.itemName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-gray-500">
                            Item Status
                          </p>
                          <Badge variant="outline">
                            {dispute.itemId?.status || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parties Involved */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-500">
                      Parties Involved
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={dispute.reportedBy?.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {dispute.reportedBy?.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {dispute.reportedBy?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {dispute.reportedBy?.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <p className="text-xs text-gray-500">
                            Role: Reporter
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={dispute.reportedAgainst?.avatar}
                            />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {dispute.reportedAgainst?.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {dispute.reportedAgainst?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {dispute.reportedAgainst?.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <p className="text-xs text-gray-500">
                            Role: Reported Against
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dispute Details */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-500">
                      Dispute Details
                    </h3>
                    <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                      <div>
                        <p className="mb-1 text-xs text-gray-500">Type</p>
                        <Badge variant="outline">
                          {typeLabels[dispute.type] || dispute.type}
                        </Badge>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500">
                          Description
                        </p>
                        <p className="whitespace-pre-wrap text-gray-700">
                          {dispute.description}
                        </p>
                      </div>
                      {dispute.assignedAdmin && (
                        <div>
                          <p className="mb-1 text-xs text-gray-500">
                            Assigned Admin
                          </p>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={dispute.assignedAdmin.avatar} />
                              <AvatarFallback>
                                {dispute.assignedAdmin.name
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-700">
                              {dispute.assignedAdmin.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resolution Details */}
                  {dispute.resolution && (
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-gray-500">
                        Resolution
                      </h3>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="space-y-3">
                          <div>
                            <p className="mb-1 text-xs text-green-700">
                              Resolution Type
                            </p>
                            <p className="font-medium text-green-900">
                              {dispute.resolution.type
                                ?.replace(/_/g, " ")
                                .toUpperCase()}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs text-green-700">
                              Description
                            </p>
                            <p className="text-green-800">
                              {dispute.resolution.description}
                            </p>
                          </div>
                          {dispute.resolution.actionTaken && (
                            <div>
                              <p className="mb-1 text-xs text-green-700">
                                Action Taken
                              </p>
                              <p className="text-green-800">
                                {dispute.resolution.actionTaken}
                              </p>
                            </div>
                          )}
                          <div className="flex justify-between pt-2">
                            <div>
                              <p className="mb-1 text-xs text-green-700">
                                Resolved By
                              </p>
                              <p className="text-sm text-green-800">
                                {dispute.resolution.resolvedBy?.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="mb-1 text-xs text-green-700">
                                Resolved At
                              </p>
                              <p className="text-sm text-green-800">
                                {format(
                                  new Date(dispute.resolution.resolvedAt),
                                  "dd/MM/yyyy HH:mm",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conversation Tab */}
              {activeTab === "conversation" && (
                <div>
                  <div className="mb-6 max-h-[500px] space-y-4 overflow-y-auto pr-2">
                    {dispute.messages && dispute.messages.length > 0 ? (
                      dispute.messages.map((msg, index) => (
                        <div key={index} className="flex gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={msg.userId?.avatar} />
                            <AvatarFallback className="text-xs">
                              {msg.userId?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {msg.userId?.name}
                              </span>
                              {msg.isAdmin && (
                                <Badge variant="outline" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(msg.createdAt))}{" "}
                                ago
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap text-gray-700">
                              {msg.content}
                            </p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {msg.attachments.map((url, idx) => (
                                  <Button
                                    key={idx}
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-blue-600"
                                    onClick={() => window.open(url, "_blank")}
                                  >
                                    <Download className="mr-1 h-3 w-3" />
                                    Attachment {idx + 1}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400">
                          Start the conversation by adding a message below
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t pt-4">
                    {attachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {attachments.map((url, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 text-sm"
                          >
                            <span className="max-w-[200px] truncate text-gray-600">
                              {url}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-gray-200"
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
                        placeholder="Enter attachment URL (image, document, etc.)"
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
                        placeholder="Type your message here... (Press Enter to send)"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="resize-none"
                        rows={3}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="self-end bg-blue-600 hover:bg-blue-700"
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Press Enter to send, Shift + Enter for new line
                    </p>
                  </div>
                </div>
              )}

              {/* Evidence Tab */}
              {activeTab === "evidence" && (
                <div>
                  {dispute.evidence && dispute.evidence.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {dispute.evidence.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                        >
                          <Badge variant="outline" className="mb-2">
                            {item.type}
                          </Badge>
                          <p className="mb-2 truncate text-sm text-gray-600">
                            {item.url}
                          </p>
                          <p className="mb-3 text-xs text-gray-400">
                            {format(
                              new Date(item.uploadedAt),
                              "dd/MM/yyyy HH:mm",
                            )}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(item.url, "_blank")}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            View Evidence
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                      <p className="text-gray-500">No evidence submitted</p>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === "timeline" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 border-b pb-4">
                      <p className="font-medium text-gray-900">
                        Dispute Created
                      </p>
                      <p className="text-sm text-gray-500">
                        Filed by {dispute.reportedBy?.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {format(
                          new Date(dispute.createdAt),
                          "dd/MM/yyyy HH:mm",
                        )}{" "}
                        ({formatDistanceToNow(new Date(dispute.createdAt))} ago)
                      </p>
                    </div>
                  </div>

                  {dispute.assignedAdmin && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 border-b pb-4">
                        <p className="font-medium text-gray-900">
                          Admin Assigned
                        </p>
                        <p className="text-sm text-gray-500">
                          Assigned to {dispute.assignedAdmin.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {dispute.updatedAt &&
                            format(
                              new Date(dispute.updatedAt),
                              "dd/MM/yyyy HH:mm",
                            )}
                        </p>
                      </div>
                    </div>
                  )}

                  {dispute.escalatedAt && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                        <ArrowUpCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1 border-b pb-4">
                        <p className="font-medium text-orange-900">
                          Dispute Escalated
                        </p>
                        <p className="text-sm text-orange-700">
                          Reason: {dispute.escalationReason}
                        </p>
                        <p className="mt-1 text-xs text-orange-600">
                          {format(
                            new Date(dispute.escalatedAt),
                            "dd/MM/yyyy HH:mm",
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {dispute.resolution?.resolvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-900">
                          Dispute Resolved
                        </p>
                        <p className="text-sm text-green-700">
                          {dispute.resolution.type
                            ?.replace(/_/g, " ")
                            .toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-green-600">
                          {format(
                            new Date(dispute.resolution.resolvedAt),
                            "dd/MM/yyyy HH:mm",
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Actions
              </h3>
              <div className="space-y-3">
                {dispute.status === "open" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() =>
                      updateStatus({
                        id: dispute._id,
                        data: { status: "under_review" },
                      })
                    }
                    disabled={isUpdatingStatus}
                  >
                    <Eye className="h-4 w-4" />
                    Mark as Under Review
                  </Button>
                )}

                {dispute.status === "under_review" && (
                  <Button
                    className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => setResolveDialogOpen(true)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Resolve Dispute
                  </Button>
                )}

                {!dispute.assignedAdmin && dispute.status !== "resolved" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setAssignDialogOpen(true)}
                  >
                    <UserCheck className="h-4 w-4" />
                    Assign Admin
                  </Button>
                )}

                {dispute.status !== "escalated" &&
                  dispute.status !== "resolved" &&
                  dispute.status !== "closed" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-orange-200 text-orange-600 hover:border-orange-300 hover:text-orange-700"
                      onClick={() => setEscalateDialogOpen(true)}
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                      Escalate to Super Admin
                    </Button>
                  )}

                <Separator className="my-4" />

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setArchiveDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Archive Dispute
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Quick Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(dispute.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(dispute.updatedAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                {dispute.timeoutAt && (
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Timeout</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(dispute.timeoutAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                )}
                <Separator className="my-2" />
                <div>
                  <p className="mb-1 text-xs text-gray-500">Type</p>
                  <p className="text-sm text-gray-900">
                    {typeLabels[dispute.type] || dispute.type}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-gray-500">Priority</p>
                  <Badge className={priorityConfig[dispute.priority]?.color}>
                    {priorityConfig[dispute.priority]?.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}

      {/* Assign Admin Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Admin</DialogTitle>
            <DialogDescription>
              Assign an admin to handle this dispute. The admin will be
              notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Admin</Label>
              <Select
                value={selectedAdminId}
                onValueChange={setSelectedAdminId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an admin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin1">John Doe (Super Admin)</SelectItem>
                  <SelectItem value="admin2">
                    Jane Smith (College Admin)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignAdmin}
              disabled={!selectedAdminId || isAssigning}
            >
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dispute Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Provide resolution details. This will notify all parties.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Resolution Type</Label>
              <RadioGroup
                value={resolutionType}
                onValueChange={setResolutionType}
                className="space-y-2"
              >
                {resolutionTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Resolution Description *</Label>
              <Textarea
                placeholder="Describe how the dispute was resolved..."
                value={resolutionDescription}
                onChange={(e) => setResolutionDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Action Taken (Optional)</Label>
              <Textarea
                placeholder="Describe any actions taken..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Update Item Status</Label>
              <Select
                value={updateItemStatus}
                onValueChange={(value: any) => setUpdateItemStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Don't update item status</SelectItem>
                  <SelectItem value="claimed">Mark item as Claimed</SelectItem>
                  <SelectItem value="returned">
                    Mark item as Returned
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveDispute}
              disabled={!resolutionDescription.trim() || isResolving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isResolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Dispute Dialog */}
      <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Escalate Dispute</DialogTitle>
            <DialogDescription>
              Escalate this dispute to a super admin for higher-level review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert
              variant="destructive"
              className="border-orange-200 bg-orange-50 text-orange-800"
            >
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                This action cannot be undone. Please ensure you have attempted
                to resolve at college level.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Escalation Reason *</Label>
              <Textarea
                placeholder="Explain why this needs to be escalated..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-gray-500">Minimum 10 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEscalateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEscalateDispute}
              disabled={
                !escalationReason.trim() ||
                escalationReason.length < 10 ||
                isEscalating
              }
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isEscalating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Escalate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Dispute Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Archive Dispute</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this dispute? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setArchiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleArchiveDispute}
              disabled={isArchiving}
              variant="destructive"
            >
              {isArchiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
