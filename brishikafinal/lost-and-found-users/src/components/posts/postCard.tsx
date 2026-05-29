import React, { useState } from "react";
import {
  useLikeItem,
  useUnlikeItem,
  useShareItem,
  useFlagItem,
  useDeleteItem,
} from "@/hooks/useLostItems";
import {
  Heart,
  MessageCircle,
  Share2,
  Flag,
  Bookmark,
  MoreHorizontal,
  Trash2,
  AlertTriangle,
  MapPin,
  Clock,
  Eye,
  Copy,
  ShieldCheck,
  Scale,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  LostItem,
  FlagReason as LostItemFlagReason,
} from "@/types/lostItem.types";
import { Link } from "react-router-dom";
import { useStartConversation } from "@/hooks/useStartConversation";
import { formatDate, formatNumber, getInitials } from "@/utils/formatUtils";
import { CommentsSection } from "../posts/commentSection";
import { DisputeDialog } from "../dialogs/disputes/createDisputeDialog";

interface PostProps {
  item: LostItem;
  currentUserId: string;
  currentUserName: string;
  isAdmin: boolean;
}

export const Post: React.FC<PostProps> = ({
  item,
  currentUserId,
  currentUserName,
  isAdmin,
}) => {
  const [isLiked, setIsLiked] = useState(
    item.likes?.some((like) => like.user === currentUserId) || false,
  );
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const likeItem = useLikeItem();
  const unlikeItem = useUnlikeItem();
  const shareItem = useShareItem();
  const flagItem = useFlagItem();
  const deleteItem = useDeleteItem();

  const { startConversation, loading: isClaiming } = useStartConversation();

  const isOwner = item.reportedBy._id === currentUserId;
  const descriptionLength = item.description?.length || 0;
  const needsTruncate = descriptionLength > 150;
  const displayDescription = showFullDescription
    ? item.description
    : item.description?.slice(0, 150);

  const handleLike = async () => {
    if (isLiked) {
      await unlikeItem.mutateAsync(item._id);
      setIsLiked(false);
    } else {
      await likeItem.mutateAsync(item._id);
      setIsLiked(true);
    }
  };

  const handleShare = async (platform: string) => {
    await shareItem.mutateAsync({
      id: item._id,
      data: { sharedOn: platform as any },
    });
    setShowShareDialog(false);
  };

  const handleFlag = async (
    reason: LostItemFlagReason,
    description?: string,
  ) => {
    await flagItem.mutateAsync({ id: item._id, data: { reason, description } });
    setShowFlagDialog(false);
  };

  const handleDelete = async () => {
    await deleteItem.mutateAsync(item._id);
    setShowDeleteDialog(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${item._id}`);
    toast.success("Link copied to clipboard!");
  };

  const flagReasons: LostItemFlagReason[] = [
    "inappropriate",
    "spam",
    "fake",
    "duplicate",
    "other",
  ];

  const handleClaimItem = async () => {
    const postUrl = `${window.location.origin}/post/${item._id}`;
    await startConversation(
      item.reportedBy,
      `${item.status === "lost" ? "Hi! I'd like to return this item — I believe i have found this item." : "Hi! I'd like to claim this item — I believe it belongs to me."}\n\n📦 ${item.itemName}\n📍 ${item.locationDescription}\n\n${postUrl}`,
      {
        postId: item._id,
        postUrl,
        postTitle: item.itemName,
        postImage: item.images?.[0]?.url ?? null,
        postLocation: item.locationDescription,
        postStatus: item.status,
      },
    );
  };

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 shadow-md ring-2 ring-white">
              {item.reportedBy.avatar ? (
                <AvatarImage src={item.reportedBy.avatar} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-base text-white">
                  {getInitials(item.reportedBy.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold">
                  {item.reportedBy.name}
                </span>
                {item.isVerified && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-blue-50 text-xs text-blue-600"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                <Badge
                  className={cn(
                    "text-xs",
                    item.status === "lost"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600",
                  )}
                >
                  {item.status === "lost" ? "Lost" : "Found"}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-nowrap">{item.zoneId?.name}</span>
                  <span className="line-clamp-1">
                    {item.locationDescription}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {(isOwner || isAdmin) && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}

              {(isOwner || isAdmin) && (
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = `/edit-post/${item._id}`;
                  }}
                  className="text-blue-600"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Post
                </DropdownMenuItem>
              )}
              {!isOwner && (
                <>
                  <DropdownMenuItem onClick={() => setShowFlagDialog(true)}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDisputeDialog(true)}>
                    <Scale className="mr-2 h-4 w-4" />
                    File Dispute
                  </DropdownMenuItem>
                </>
              )}
              {!isOwner && (
                <DropdownMenuItem
                  onClick={handleClaimItem}
                  disabled={isClaiming}
                  className="text-blue-600"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {isClaiming
                    ? "Opening chat..."
                    : item.status === "lost"
                      ? "Return Item"
                      : "Claim item"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3">
          <Link to={`/post/${item._id}`} className="mt-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {item.itemName}
            </h2>
          </Link>
          <div className="mt-2 leading-relaxed text-gray-600">
            <p>
              {displayDescription}
              {needsTruncate && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="ml-1 text-sm font-medium text-blue-500 hover:text-blue-600"
                >
                  {showFullDescription ? "Show less" : "... See more"}
                </button>
              )}
            </p>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
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
      </div>

      {/* Images */}
      {item.images && item.images.length > 0 && (
        <div className="px-5 pb-3">
          <EnhancedImageCarousel images={item.images} />
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-5 py-2 text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span>{formatNumber(item.likesCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{formatNumber(item.commentsCount)} comments</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{formatNumber(item.views)} views</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-b border-gray-100 px-5 py-2">
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
                  <Heart className={cn("h-5 w-5", isLiked && "fill-red-500")} />
                  <span>Like</span>
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
                  onClick={() => setShowComments(!showComments)}
                  className="gap-2 rounded-full"
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
      {showComments && (
        <div className="px-5 pb-4">
          <CommentsSection
            itemId={item._id}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onCommentAdded={() => {}}
          />
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this post? This action cannot be
            undone.
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share "{item.itemName}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { platform: "timeline", icon: "📱", label: "Share to Timeline" },
              { platform: "message", icon: "💬", label: "Share via Message" },
              { platform: "whatsapp", icon: "📱", label: "Share to WhatsApp" },
            ].map((option) => (
              <Button
                key={option.platform}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleShare(option.platform)}
              >
                <span className="mr-3 text-xl">{option.icon}</span>
                {option.label}
              </Button>
            ))}
            <Separator />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={copyLink}
            >
              <span className="mr-3">🔗</span>
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {flagReasons.map((reason) => (
              <Button
                key={reason}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleFlag(reason)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                {reason.charAt(0).toUpperCase() + reason.slice(1)}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <DisputeDialog
        open={showDisputeDialog}
        onOpenChange={setShowDisputeDialog}
        item={item}
        currentUserId={currentUserId}
      />
    </div>
  );
};

interface CarouselImage {
  url: string;
  isPrimary?: boolean;
}

const EnhancedImageCarousel = ({ images }: { images: CarouselImage[] }) => {
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
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800">
          <img
            src={images[currentIndex].url}
            alt=""
            className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
            onClick={() => setIsFullscreen(true)}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/80"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/80"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      currentIndex === idx
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/50",
                    )}
                  />
                ))}
              </div>
              <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
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
