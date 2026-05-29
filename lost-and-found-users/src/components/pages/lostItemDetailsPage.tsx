import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useLostItem,
  useLikeItem,
  useUnlikeItem,
  useShareItem,
  useFlagItem,
  useDeleteItem,
  useUpdateItemStatus,
} from "@/hooks/useLostItems";
import {
  useGetComments,
  useAddComment,
  useAddReply,
  useLikeComment,
  useUnlikeComment,
  useDeleteComment,
  useFlagComment,
} from "@/hooks/useComments";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Heart,
  MessageCircle,
  Share2,
  Flag,
  Bookmark,
  MoreHorizontal,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
  Link2,
  Trash2,
  Edit,
  Scale,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DisputeDialog } from "../dialogs/disputes/createDisputeDialog";

// Image Carousel Component
const ImageCarousel = ({
  images,
}: {
  images: { url: string; isPrimary?: boolean }[];
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="group relative">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
          <img
            src={images[currentIndex].url}
            alt=""
            className="h-full w-full cursor-pointer object-contain"
            onClick={() => setIsFullscreen(true)}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/80"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/80"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      currentIndex === idx
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/50",
                    )}
                  />
                ))}
              </div>
              <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                {currentIndex + 1}/{images.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="h-[95vh] max-w-[95vw] border-0 bg-black p-0">
          <div className="relative flex h-full w-full items-center justify-center">
            <img
              src={images[currentIndex].url}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Comment Component
const Comment = ({
  comment,
  itemId,
  currentUserId,
  onLike,
  onUnlike,
  onDelete,
  onReply,
  onFlag,
  level = 0,
}: {
  comment: any;
  itemId: string;
  currentUserId: string;
  onLike: (commentId: string) => void;
  onUnlike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentCommentId: string, content: string) => void;
  onFlag: (commentId: string, reason: string) => void;
  level?: number;
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLiked, setIsLiked] = useState(
    comment.likes?.includes(currentUserId) || false,
  );
  const [showReplies, setShowReplies] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  const isOwner = comment.userId?._id === currentUserId;

  const handleLike = () => {
    if (isLiked) {
      onUnlike(comment._id);
      setIsLiked(false);
    } else {
      onLike(comment._id);
      setIsLiked(true);
    }
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment._id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const flagReasons = [
    "spam",
    "harassment",
    "hate_speech",
    "inappropriate",
    "other",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", level > 0 && "ml-12")}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        {comment.userId?.avatar ? (
          <AvatarImage src={comment.userId.avatar} />
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-xs text-white">
            {getInitials(comment.userId?.name || "User")}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-gray-100 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {comment.userId?.name || "Unknown User"}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400">edited</span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem
                    onClick={() => onDelete(comment._id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <DropdownMenuItem onClick={() => setShowFlagDialog(true)}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="mt-1 text-sm break-words whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
        <div className="mt-1 flex gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-red-500"
                >
                  <Heart
                    className={cn(
                      "h-3.5 w-3.5",
                      isLiked && "fill-red-500 text-red-500",
                    )}
                  />
                  <span>
                    {comment.likesCount > 0 ? comment.likesCount : ""}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>{isLiked ? "Unlike" : "Like"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-blue-500"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Reply</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Reply</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {comment.replyCount > 0 && !showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="text-xs text-blue-500 hover:underline"
            >
              View {comment.replyCount}{" "}
              {comment.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-3 flex gap-2">
            <Input
              placeholder={`Reply to ${comment.userId?.name}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReply()}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleReply}
              disabled={!replyContent.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {showReplies && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply: any) => (
              <Comment
                key={reply._id}
                comment={reply}
                itemId={itemId}
                currentUserId={currentUserId}
                onLike={onLike}
                onUnlike={onUnlike}
                onDelete={onDelete}
                onReply={onReply}
                onFlag={onFlag}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Flag Dialog for Comment */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {flagReasons.map((reason) => (
              <Button
                key={reason}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  onFlag(comment._id, reason);
                  setShowFlagDialog(false);
                }}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {reason.charAt(0).toUpperCase() +
                  reason.slice(1).replace("_", " ")}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Main Component
export default function LostItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  const { data, isLoading, error } = useLostItem(
    id || "",
    user?.college?.id || "",
  );

  const likeItem = useLikeItem();
  const unlikeItem = useUnlikeItem();
  const shareItem = useShareItem();
  const flagItem = useFlagItem();
  const deleteItem = useDeleteItem();
  const updateStatus = useUpdateItemStatus();

  const { data: commentsData, refetch: refetchComments } = useGetComments(
    id || "",
    {
      limit: showAllComments ? 50 : 3,
      sort: "latest",
      includeReplies: true,
    },
  );

  const addComment = useAddComment();
  const addReply = useAddReply();
  const likeComment = useLikeComment();
  const unlikeComment = useUnlikeComment();
  const deleteComment = useDeleteComment();
  const flagComment = useFlagComment();

  const item = data?.data;

  useEffect(() => {
    if (item) {
      setIsLiked(
        item.likes?.some((like: any) => like.user === user?.id) || false,
      );
    }
  }, [item, user?.id]);

  const handleLike = async () => {
    if (!id) return;
    if (isLiked) {
      await unlikeItem.mutateAsync(id);
      setIsLiked(false);
    } else {
      await likeItem.mutateAsync(id);
      setIsLiked(true);
    }
  };

  const handleShare = async (platform: string) => {
    if (!id) return;
    await shareItem.mutateAsync({ id, data: { sharedOn: platform as any } });
    setShowShareDialog(false);
    toast.success(`Shared to ${platform}`);
  };

  const handleFlag = async (reason: string) => {
    if (!id) return;
    await flagItem.mutateAsync({ id, data: { reason: reason as any } });
    setShowFlagDialog(false);
    toast.success("Item reported");
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteItem.mutateAsync(id);
    setShowDeleteDialog(false);
    navigate("/feed");
    toast.success("Item deleted");
  };

  const handleStatusUpdate = async (status: string) => {
    if (!id) return;
    await updateStatus.mutateAsync({ id, data: { status: status as any } });
    toast.success(`Status updated to ${status}`);
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    await addComment.mutateAsync({ itemId: id, data: { content: newComment } });
    setNewComment("");
    refetchComments();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-4 h-10 w-32" />
        <Skeleton className="mb-6 h-[400px] w-full rounded-xl" />
        <div className="mb-4 flex gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="mb-4 h-32 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold text-red-600">Item Not Found</h2>
          <p className="mt-2 text-gray-600">
            The item you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => navigate("/feed")}>
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = item.reportedBy?._id === user?.id;
  const isAdmin = user?.role === "college_admin";
  const canEdit = isOwner || isAdmin;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </motion.button>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-2xl border bg-white shadow-lg"
      >
        {/* Header */}
        <div className="border-b p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 shadow-md ring-2 ring-white">
                {item.reportedBy?.avatar ? (
                  <AvatarImage src={item.reportedBy.avatar} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-base text-white">
                    {item.reportedBy?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold">
                    {item.reportedBy?.name || "Unknown User"}
                  </span>
                  {item.isVerified && (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-blue-50 text-blue-600"
                    >
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  <Badge
                    className={cn(
                      "text-xs",
                      item.status === "lost"
                        ? "bg-red-100 text-red-600"
                        : item.status === "found"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600",
                    )}
                  >
                    {item.status?.charAt(0).toUpperCase() +
                      item.status?.slice(1) || "Unknown"}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{item.zoneId?.name || "Unknown Location"}</span>
                    {item.locationDescription && (
                      <span className="text-gray-400">
                        • {item.locationDescription}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canEdit && (
                  <>
                    <DropdownMenuItem
                      onClick={() => navigate(`/post/${item._id}/edit`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {item.status === "lost" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate("found")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Found
                      </DropdownMenuItem>
                    )}
                    {item.status === "found" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate("claimed")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Mark as Claimed
                      </DropdownMenuItem>
                    )}
                    {item.status === "claimed" && (
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate("returned")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Returned
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                  </>
                )}
                {!isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => setShowFlagDialog(true)}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDisputeDialog(true)}
                    >
                      <Scale className="mr-2 h-4 w-4" />
                      File Dispute
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={copyLink}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title & Description */}
        <div className="border-b p-5">
          <h1 className="mb-3 text-2xl font-bold">{item.itemName}</h1>
          <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
            {item.description}
          </p>
          {item.tags && item.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-gray-50 text-xs"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        {item.images && item.images.length > 0 && (
          <div className="border-b p-5">
            <ImageCarousel images={item.images} />
          </div>
        )}

        {/* Stats Bar */}
        <div className="flex items-center justify-between border-b px-5 py-3 text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span>{item.likesCount || 0} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{item.commentsCount || 0} comments</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span>{item.sharesCount || 0} shares</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-b px-5 py-2">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={cn(
                      "gap-2 rounded-full",
                      isLiked && "text-red-500",
                    )}
                  >
                    <Heart
                      className={cn("h-5 w-5", isLiked && "fill-red-500")}
                    />
                    <span>{isLiked ? "Liked" : "Like"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isLiked ? "Unlike" : "Like"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-full"
                    onClick={() =>
                      document.getElementById("comment-input")?.focus()
                    }
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Comment</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Comment</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareDialog(true)}
                    className="gap-2 rounded-full"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSaved(!isSaved)}
                  className="rounded-full"
                >
                  <Bookmark
                    className={cn(
                      "h-5 w-5",
                      isSaved && "fill-yellow-500 text-yellow-500",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isSaved ? "Saved" : "Save"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Comments Section */}
        <div className="p-5">
          <div className="mb-4 flex gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              {user?.avatar ? (
                <AvatarImage src={user.avatar} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-1 gap-2">
              <Input
                id="comment-input"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim() || addComment.isPending}
                className="rounded-full"
              >
                {addComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {commentsData?.data && commentsData.data.length > 0 ? (
            <div className="space-y-4">
              {commentsData.data.map((comment: any) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  itemId={id || ""}
                  currentUserId={user?.id || ""}
                  onLike={async (commentId) => {
                    await likeComment.mutateAsync(commentId);
                    refetchComments();
                  }}
                  onUnlike={async (commentId) => {
                    await unlikeComment.mutateAsync(commentId);
                    refetchComments();
                  }}
                  onDelete={async (commentId) => {
                    await deleteComment.mutateAsync(commentId);
                    refetchComments();
                  }}
                  onReply={async (parentId, content) => {
                    await addReply.mutateAsync({
                      itemId: id || "",
                      parentCommentId: parentId,
                      content,
                    });
                    refetchComments();
                  }}
                  onFlag={async (commentId, reason) => {
                    await flagComment.mutateAsync({
                      commentId,
                      data: { reason: reason as any },
                    });
                    toast.success("Comment reported");
                  }}
                />
              ))}
              {commentsData.pagination?.total > 3 && !showAllComments && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  View all {commentsData.pagination.total} comments
                </button>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No comments yet</p>
              <p className="text-sm text-gray-400">Be the first to comment!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share "{item.itemName}"</DialogTitle>
            <DialogDescription>
              Share this item with others to help find it
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleShare("timeline")}
            >
              <span className="text-xl">📱</span>
              Share to Timeline
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleShare("message")}
            >
              <span className="text-xl">💬</span>
              Share via Message
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleShare("whatsapp")}
            >
              <span className="text-xl">📱</span>
              Share to WhatsApp
            </Button>
            <Separator />
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={copyLink}
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Item</DialogTitle>
            <DialogDescription>
              Why are you reporting this item?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {["inappropriate", "spam", "fake", "duplicate", "other"].map(
              (reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleFlag(reason)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {reason.charAt(0).toUpperCase() + reason.slice(1)}
                </Button>
              ),
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <DisputeDialog
        open={showDisputeDialog}
        onOpenChange={setShowDisputeDialog}
        item={item}
        currentUserId={user?.id || ""}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              item "{item.itemName}" and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
