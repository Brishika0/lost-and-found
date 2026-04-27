// pages/DisputeDetailsPage.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowUpCircle,
  Eye,
  Download,
  Clock,
  Tag,
  Info,
  ArrowLeft,
  MoreVertical,
  UserCheck,
  Paperclip,
  X,
  Loader2,
  Send,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

// Status Configuration
const statusConfig = {
  open: {
    label: "Open",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
  },
  under_review: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Eye,
  },
  escalated: {
    label: "Escalated",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: ArrowUpCircle,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: FileText,
  },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800" },
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
          toast.success("Message sent successfully");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to send message");
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
          toast.success("Admin assigned successfully");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to assign admin");
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
          toast.success("Dispute resolved successfully");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to resolve dispute");
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
          toast.success("Dispute escalated successfully");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to escalate dispute");
        },
      },
    );
  };

  const handleArchiveDispute = () => {
    if (!dispute) return;

    archiveDispute(dispute._id, {
      onSuccess: () => {
        setArchiveDialogOpen(false);
        toast.success("Dispute archived successfully");
        navigate("/disputes");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to archive dispute");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 py-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/disputes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="container mx-auto max-w-7xl py-6">
        <div className="py-12 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Dispute Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The dispute you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => navigate("/disputes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Disputes
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[dispute.status]?.icon || AlertTriangle;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-7xl py-6">
        {/* Header */}
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 pb-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/disputes")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {dispute.title}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  ID: {dispute._id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusConfig[dispute.status]?.color} gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig[dispute.status]?.label}
              </Badge>
              <Badge className={priorityConfig[dispute.priority]?.color}>
                {priorityConfig[dispute.priority]?.label} Priority
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Details and Tabs */}
          <div className="space-y-6 lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details" className="gap-2">
                  <Info className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="conversation" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages ({dispute.messages?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="evidence" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Evidence ({dispute.evidence?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-4 space-y-4">
                {/* Item Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Tag className="h-5 w-5" />
                      Item Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Item Name
                        </p>
                        <p className="mt-1 font-medium">
                          {dispute.itemId?.itemName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Item Status
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {dispute.itemId?.status || "N/A"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parties Involved */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Reported By
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={dispute.reportedBy?.avatar} />
                          <AvatarFallback>
                            {dispute.reportedBy?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {dispute.reportedBy?.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {dispute.reportedBy?.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5" />
                        Reported Against
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={dispute.reportedAgainst?.avatar} />
                          <AvatarFallback>
                            {dispute.reportedAgainst?.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {dispute.reportedAgainst?.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {dispute.reportedAgainst?.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Dispute Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Info className="h-5 w-5" />
                      Dispute Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Type</p>
                        <Badge variant="outline" className="mt-1">
                          {typeLabels[dispute.type] || dispute.type}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Description
                        </p>
                        <p className="mt-1 whitespace-pre-wrap">
                          {dispute.description}
                        </p>
                      </div>
                      {dispute.assignedAdmin && (
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Assigned Admin
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={dispute.assignedAdmin.avatar} />
                              <AvatarFallback>
                                {dispute.assignedAdmin.name
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{dispute.assignedAdmin.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Resolution Details */}
                {dispute.resolution && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        Resolution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Resolution Type
                          </p>
                          <p className="mt-1 font-medium">
                            {dispute.resolution.type
                              ?.replace(/_/g, " ")
                              .toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Description
                          </p>
                          <p className="mt-1">
                            {dispute.resolution.description}
                          </p>
                        </div>
                        {dispute.resolution.actionTaken && (
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Action Taken
                            </p>
                            <p className="mt-1">
                              {dispute.resolution.actionTaken}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Resolved By
                            </p>
                            <p>{dispute.resolution.resolvedBy?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-sm">
                              Resolved At
                            </p>
                            <p>
                              {format(
                                new Date(dispute.resolution.resolvedAt),
                                "dd/MM/yyyy HH:mm",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Conversation Tab */}
              <TabsContent value="conversation" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px] p-4">
                      {dispute.messages && dispute.messages.length > 0 ? (
                        <div className="space-y-4">
                          {dispute.messages.map((msg, index) => (
                            <div key={index} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.userId?.avatar} />
                                <AvatarFallback>
                                  {msg.userId?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {msg.userId?.name}
                                    {msg.isAdmin && (
                                      <Badge
                                        variant="outline"
                                        className="ml-2 text-xs"
                                      >
                                        Admin
                                      </Badge>
                                    )}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {formatDistanceToNow(
                                      new Date(msg.createdAt),
                                    )}{" "}
                                    ago
                                  </span>
                                </div>
                                <p className="mt-1 text-sm whitespace-pre-wrap">
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
                                          className="h-auto p-0 text-xs"
                                          onClick={() =>
                                            window.open(url, "_blank")
                                          }
                                        >
                                          <Download className="mr-1 h-3 w-3" />
                                          Attachment {idx + 1}
                                        </Button>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <MessageSquare className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                          <p className="text-muted-foreground">
                            No messages yet
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Start the conversation by adding a message below
                          </p>
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="space-y-3">
                        {attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {attachments.map((url, idx) => (
                              <div
                                key={idx}
                                className="bg-muted flex items-center gap-2 rounded-lg px-3 py-1 text-sm"
                              >
                                <span className="max-w-[200px] truncate">
                                  {url}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleRemoveAttachment(url)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <div className="flex flex-1 gap-2">
                            <Input
                              placeholder="Enter attachment URL"
                              value={attachmentUrl}
                              onChange={(e) => setAttachmentUrl(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddAttachment}
                              disabled={!attachmentUrl.trim()}
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </div>
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
                            className="self-end"
                          >
                            {isSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Press Enter to send, Shift + Enter for new line
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Evidence Tab */}
              <TabsContent value="evidence" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    {dispute.evidence && dispute.evidence.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {dispute.evidence.map((item, index) => (
                          <div
                            key={index}
                            className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                          >
                            <div>
                              <Badge variant="outline" className="mb-1">
                                {item.type}
                              </Badge>
                              <p className="max-w-[200px] truncate text-sm">
                                {item.url}
                              </p>
                              <p className="text-muted-foreground mt-1 text-xs">
                                {format(
                                  new Date(item.uploadedAt),
                                  "dd/MM/yyyy HH:mm",
                                )}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.url, "_blank")}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <FileText className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                        <p className="text-muted-foreground">
                          No evidence submitted
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Dispute Created</p>
                            <p className="text-muted-foreground text-sm">
                              Filed by {dispute.reportedBy?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(
                              new Date(dispute.createdAt),
                              "dd/MM/yyyy HH:mm",
                            )}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(dispute.createdAt))}{" "}
                            ago
                          </p>
                        </div>
                      </div>

                      {dispute.assignedAdmin && (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                              <UserCheck className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Admin Assigned</p>
                              <p className="text-muted-foreground text-sm">
                                Assigned to {dispute.assignedAdmin.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {dispute.updatedAt
                                ? format(
                                    new Date(dispute.updatedAt),
                                    "dd/MM/yyyy HH:mm",
                                  )
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      )}

                      {dispute.escalatedAt && (
                        <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50/50 p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                              <ArrowUpCircle className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-orange-800">
                                Dispute Escalated
                              </p>
                              <p className="text-sm text-orange-700">
                                Reason: {dispute.escalationReason}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {format(
                                new Date(dispute.escalatedAt),
                                "dd/MM/yyyy HH:mm",
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {dispute.resolution?.resolvedAt && (
                        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50/50 p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-green-800">
                                Dispute Resolved
                              </p>
                              <p className="text-sm text-green-700">
                                {dispute.resolution.type
                                  ?.replace(/_/g, " ")
                                  .toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {format(
                                new Date(dispute.resolution.resolvedAt),
                                "dd/MM/yyyy HH:mm",
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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

                {!dispute.assignedAdmin && (
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
                  dispute.status !== "resolved" && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-orange-600 hover:text-orange-700"
                      onClick={() => setEscalateDialogOpen(true)}
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                      Escalate to Super Admin
                    </Button>
                  )}

                <Separator />

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                  onClick={() => setArchiveDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Archive Dispute
                </Button>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-sm">Created</p>
                  <p className="font-medium">
                    {format(new Date(dispute.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(dispute.updatedAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                {dispute.timeoutAt && (
                  <div>
                    <p className="text-muted-foreground text-sm">Timeout</p>
                    <p className="font-medium">
                      {format(new Date(dispute.timeoutAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                    <SelectItem value="admin1">
                      John Doe (Super Admin)
                    </SelectItem>
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
                {isAssigning && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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
                    <div
                      key={type.value}
                      className="flex items-center space-x-2"
                    >
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
                    <SelectItem value="none">
                      Don't update item status
                    </SelectItem>
                    <SelectItem value="claimed">
                      Mark item as Claimed
                    </SelectItem>
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
                className="bg-green-600"
              >
                {isResolving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
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
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
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
                className="bg-orange-600"
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
                Are you sure you want to archive this dispute? This action
                cannot be undone.
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
                {isArchiving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Archive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
