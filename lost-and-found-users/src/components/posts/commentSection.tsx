import { useState } from "react";
import {
  useGetComments,
  useAddComment,
  useAddReply,
  useLikeComment,
  useUnlikeComment,
  useDeleteComment,
  useFlagComment,
} from "@/hooks/useComments";
import type {
  Comment,
  FlagReason as CommentFlagReason,
} from "@/types/comment.types";
import { Badge } from "../ui/badge";
import {
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronUp,
  Flag,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber, getInitials } from "@/utils/formatUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "../ui/skeleton";

interface CommentItemProps {
  comment: Comment;
  itemId: string;
  currentUserId: string;
  currentUserName: string;
  onLike: (commentId: string) => void;
  onUnlike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentCommentId: string, content: string) => void;
  onFlag: (commentId: string, reason: CommentFlagReason) => void;
  level?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  itemId,
  currentUserId,
  currentUserName,
  onLike,
  onUnlike,
  onDelete,
  onReply,
  onFlag,
  level = 0,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLiked, setIsLiked] = useState(
    comment.likes?.includes(currentUserId) || false,
  );
  const [showReplies, setShowReplies] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  const isOwner = comment.userId._id === currentUserId;

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

  const handleFlag = (reason: CommentFlagReason) => {
    onFlag(comment._id, reason);
    setShowFlagDialog(false);
  };

  const renderContent = () => {
    let parts = [];
    let lastIndex = 0;
    const mentions = comment.mentions || [];
    const allMarkers = [...mentions];

    allMarkers.sort((a, b) => a.indices[0] - b.indices[0]);

    for (const mention of allMarkers) {
      if (mention.indices[0] > lastIndex) {
        parts.push(comment.content.slice(lastIndex, mention.indices[0]));
      }
      parts.push(
        <span
          key={`mention-${mention.userId._id}`}
          className="font-medium text-blue-600"
        >
          @{mention.username}
        </span>,
      );
      lastIndex = mention.indices[1];
    }
    if (lastIndex < comment.content.length) {
      parts.push(comment.content.slice(lastIndex));
    }

    return parts;
  };

  const flagReasons: CommentFlagReason[] = [
    "spam",
    "harassment",
    "hate_speech",
    "inappropriate",
    "other",
  ];

  return (
    <div className={cn("flex gap-3", level > 0 && "ml-12")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {comment.userId.avatar ? (
          <AvatarImage src={comment.userId.avatar} />
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-xs text-white">
            {getInitials(comment.userId.name)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            level === 0 ? "bg-gray-50" : "bg-gray-100",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">
                {comment.userId.name}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400">• edited</span>
              )}
              {comment.isPinned && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-xs text-yellow-700"
                >
                  <Award className="mr-1 h-3 w-3" />
                  Pinned
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
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
          </div>
          <p className="mt-1 text-sm break-words whitespace-pre-wrap text-gray-700">
            {renderContent()}
          </p>
        </div>
        <div className="mt-1 ml-2 flex gap-4">
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
                    {comment.likesCount > 0
                      ? formatNumber(comment.likesCount)
                      : ""}
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
              placeholder={`Reply to ${comment.userId.name}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleReply()}
              className="flex-1 text-sm"
              autoFocus
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
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                itemId={itemId}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
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

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
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
                {reason.charAt(0).toUpperCase() +
                  reason.slice(1).replace("_", " ")}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// COMMENTS SECTION

interface CommentsSectionProps {
  itemId: string;
  currentUserId: string;
  currentUserName: string;
  onCommentAdded?: () => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  itemId,
  currentUserId,
  currentUserName,
  onCommentAdded,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data: commentsData,
    isLoading,
    refetch,
  } = useGetComments(itemId, {
    page: 1,
    limit: isExpanded ? 50 : 3,
    sort: "latest",
    includeReplies: true,
  });

  const addComment = useAddComment();
  const addReply = useAddReply();
  const likeComment = useLikeComment();
  const unlikeComment = useUnlikeComment();
  const deleteComment = useDeleteComment();
  const flagComment = useFlagComment();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment.mutateAsync({
        itemId,
        data: { content: newComment },
      });
      setNewComment("");
      refetch();
      onCommentAdded?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    try {
      await addReply.mutateAsync({
        itemId,
        parentCommentId,
        content,
      });
      refetch();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleLikeComment = async (commentId: string) => {
    await likeComment.mutateAsync(commentId);
    refetch();
  };

  const handleUnlikeComment = async (commentId: string) => {
    await unlikeComment.mutateAsync(commentId);
    refetch();
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment.mutateAsync(commentId);
    refetch();
  };

  const handleFlagComment = async (
    commentId: string,
    reason: CommentFlagReason,
  ) => {
    await flagComment.mutateAsync({ commentId, data: { reason } });
  };

  const comments = commentsData?.data || [];
  const totalComments = commentsData?.pagination.total || 0;

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  const displayedComments = isExpanded ? comments : comments.slice(0, 3);

  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {totalComments} {totalComments === 1 ? "Comment" : "Comments"}
          </span>
        </div>
        {totalComments > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500"
          >
            {isExpanded ? (
              <ChevronUp className="mr-1 h-4 w-4" />
            ) : (
              <ChevronDown className="mr-1 h-4 w-4" />
            )}
            {isExpanded ? "Show less" : "Show all"}
          </Button>
        )}
      </div>

      <div className="mb-4 flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            {getInitials(currentUserName)}
          </AvatarFallback>
        </Avatar>
        <div className="relative flex-1">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            className="rounded-full bg-gray-50 pr-12"
          />
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || addComment.isPending}
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 rounded-full p-0"
          >
            {addComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {displayedComments.length > 0 ? (
        <div className="space-y-4">
          {displayedComments.map((comment, index) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              itemId={itemId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onLike={handleLikeComment}
              onUnlike={handleUnlikeComment}
              onDelete={handleDeleteComment}
              onReply={handleAddReply}
              onFlag={handleFlagComment}
            />
          ))}
          {!isExpanded && totalComments > 3 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm font-medium text-blue-500 hover:text-blue-600"
            >
              View all {totalComments} comments
            </button>
          )}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};
