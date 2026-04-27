import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commentApis } from "@/services/commentApis";
import type {
  AddCommentRequest,
  UpdateCommentRequest,
  GetCommentsQuery,
  FlagCommentRequest,
  ResolveFlagsRequest,
  PinCommentRequest,
  HideCommentRequest,
} from "@/types/comment.types";

// QUERY KEYS

export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (itemId: string, params: GetCommentsQuery) =>
    [...commentKeys.lists(), itemId, params] as const,
  details: () => [...commentKeys.all, "detail"] as const,
  detail: (id: string) => [...commentKeys.details(), id] as const,
  replies: (commentId: string, params?: { page?: number; limit?: number }) =>
    [...commentKeys.all, "replies", commentId, params] as const,
  userComments: (userId: string, params?: { page?: number; limit?: number }) =>
    [...commentKeys.all, "user", userId, params] as const,
  flagged: (params?: { page?: number; limit?: number }) =>
    [...commentKeys.all, "flagged", params] as const,
};

// QUERY HOOKS

// Get comments for a lost item
export const useGetComments = (itemId: string, params?: GetCommentsQuery) => {
  return useQuery({
    queryKey: commentKeys.list(itemId, params || {}),
    queryFn: () => commentApis.getComments(itemId, params),
    enabled: !!itemId,
    staleTime: 2 * 60 * 1000,
  });
};

// Get replies for a comment
export const useGetReplies = (
  commentId: string,
  params?: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: commentKeys.replies(commentId, params),
    queryFn: () => commentApis.getReplies(commentId, params),
    enabled: !!commentId,
    staleTime: 2 * 60 * 1000,
  });
};

// Get single comment by ID
export const useGetCommentById = (commentId: string) => {
  return useQuery({
    queryKey: commentKeys.detail(commentId),
    queryFn: () => commentApis.getCommentById(commentId),
    enabled: !!commentId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get comments by user
export const useGetUserComments = (
  userId: string,
  params?: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: commentKeys.userComments(userId, params),
    queryFn: () => commentApis.getUserComments(userId, params),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

// Get flagged comments (admin only)
export const useGetFlaggedComments = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: commentKeys.flagged(params),
    queryFn: () => commentApis.getFlaggedComments(params),
    staleTime: 30 * 1000,
  });
};

// MUTATION HOOKS

// Add comment
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: AddCommentRequest;
    }) => commentApis.addComment(itemId, data),

    onSuccess: (response, { itemId }) => {
      toast.success(response.message || "Comment added");

      // Invalidate comments list for this item
      queryClient.invalidateQueries({ queryKey: commentKeys.list(itemId, {}) });
      // Also invalidate lost item to update comment count
      queryClient.invalidateQueries({
        queryKey: ["lost-items", "detail", itemId],
      });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to add comment");
    },
  });
};

// Add reply to comment
export const useAddReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      parentCommentId,
      content,
    }: {
      itemId: string;
      parentCommentId: string;
      content: string;
    }) => commentApis.addComment(itemId, { content, parentCommentId }),

    onSuccess: (response, { itemId, parentCommentId }) => {
      toast.success(response.message || "Reply added");

      // Invalidate comments list for this item
      queryClient.invalidateQueries({ queryKey: commentKeys.list(itemId, {}) });
      // Invalidate replies for parent comment
      queryClient.invalidateQueries({
        queryKey: commentKeys.replies(parentCommentId, {}),
      });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to add reply");
    },
  });
};

// Update comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentRequest;
    }) => commentApis.updateComment(commentId, data),

    onSuccess: (response, { commentId }) => {
      toast.success(response.message || "Comment updated");

      // Invalidate the specific comment and its parent list
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to update comment");
    },
  });
};

// Like comment
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentApis.likeComment(commentId),

    onSuccess: (response, commentId) => {
      toast.success(response.message || "Comment liked");

      // Invalidate the specific comment and its list
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to like comment");
    },
  });
};

// Unlike comment
export const useUnlikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentApis.unlikeComment(commentId),

    onSuccess: (response, commentId) => {
      toast.success(response.message || "Comment unliked");

      // Invalidate the specific comment and its list
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to unlike comment");
    },
  });
};

// Flag comment
export const useFlagComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: FlagCommentRequest;
    }) => commentApis.flagComment(commentId, data),

    onSuccess: (response, { commentId }) => {
      toast.success(response.message || "Comment flagged");

      // Invalidate the specific comment
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to flag comment");
    },
  });
};

// Delete comment (soft delete)
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentApis.deleteComment(commentId),

    onSuccess: (response, commentId) => {
      toast.success(response.message || "Comment deleted");

      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
      // Also invalidate lost item to update comment count
      queryClient.invalidateQueries({ queryKey: ["lost-items"] });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });
};

// Pin comment (admin only)
export const usePinComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: PinCommentRequest;
    }) => commentApis.pinComment(commentId, data),

    onSuccess: (response, { commentId }) => {
      toast.success(
        response.message ||
          `Comment ${response.data.isPinned ? "pinned" : "unpinned"}`,
      );

      // Invalidate comment lists to update order
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to pin comment");
    },
  });
};

// Hide comment (admin only)
export const useHideComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: HideCommentRequest;
    }) => commentApis.hideComment(commentId, data),

    onSuccess: (response, { commentId }) => {
      toast.success(
        response.message ||
          `Comment ${response.data.isHidden ? "hidden" : "unhidden"}`,
      );

      // Invalidate comment lists
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to hide comment");
    },
  });
};

// Permanent delete comment (admin only)
export const usePermanentDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      commentApis.permanentDeleteComment(commentId),

    onSuccess: (response, commentId) => {
      toast.success(response.message || "Comment permanently deleted");

      // Invalidate all comment queries
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to permanently delete comment");
    },
  });
};

// Resolve comment flags (admin only)
export const useResolveCommentFlags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: ResolveFlagsRequest;
    }) => commentApis.resolveCommentFlags(commentId, data),

    onSuccess: (response, { commentId }) => {
      toast.success(response.message || "Flags resolved");

      // Invalidate flagged comments list and the specific comment
      queryClient.invalidateQueries({ queryKey: commentKeys.flagged() });
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(commentId),
      });
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to resolve flags");
    },
  });
};
