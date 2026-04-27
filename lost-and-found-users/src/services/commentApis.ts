import type {
  AddCommentRequest,
  UpdateCommentRequest,
  GetCommentsQuery,
  GetRepliesQuery,
  FlagCommentRequest,
  ResolveFlagsRequest,
  PinCommentRequest,
  HideCommentRequest,
  CommentListResponse,
  CommentResponse,
  RepliesResponse,
  UserCommentsResponse,
  LikeCommentResponse,
  FlagCommentResponse,
  PinCommentResponse,
  HideCommentResponse,
  DeleteCommentResponse,
  FlaggedCommentsResponse,
  ResolveFlagsResponse,
} from "@/types/comment.types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to handle response
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data as T;
}

// Helper to build query string
function buildQueryString(params: Record<string, any>): string {
  const filtered = Object.entries(params).filter(
    ([_, value]) => value !== undefined && value !== null && value !== "",
  );
  if (filtered.length === 0) return "";
  return (
    "?" +
    filtered
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")
  );
}

// COMMENT APIS

export const commentApis = {
  // CREATE

  // Add comment to a lost item
  addComment: async (
    itemId: string,
    data: AddCommentRequest,
  ): Promise<CommentResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/lost-items/${itemId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      },
    );
    return handleResponse<CommentResponse>(response);
  },

  // READ

  // Get comments for a lost item
  getComments: async (
    itemId: string,
    params?: GetCommentsQuery,
  ): Promise<CommentListResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(
      `${API_BASE_URL}/lost-items/${itemId}/comments${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<CommentListResponse>(response);
  },

  // Get replies for a comment
  getReplies: async (
    commentId: string,
    params?: GetRepliesQuery,
  ): Promise<RepliesResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}/replies${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<RepliesResponse>(response);
  },

  // Get single comment by ID
  getCommentById: async (commentId: string): Promise<CommentResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<CommentResponse>(response);
  },

  // Get comments by user
  getUserComments: async (
    userId: string,
    params?: { page?: number; limit?: number },
  ): Promise<UserCommentsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/comments${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<UserCommentsResponse>(response);
  },

  // UPDATE

  // Update comment
  updateComment: async (
    commentId: string,
    data: UpdateCommentRequest,
  ): Promise<CommentResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<CommentResponse>(response);
  },

  // Pin comment (admin only)
  pinComment: async (
    commentId: string,
    data: PinCommentRequest,
  ): Promise<PinCommentResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/pin`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<PinCommentResponse>(response);
  },

  // Hide comment (admin only)
  hideComment: async (
    commentId: string,
    data: HideCommentRequest,
  ): Promise<HideCommentResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/hide`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<HideCommentResponse>(response);
  },

  // DELETE

  // Delete comment (soft delete)
  deleteComment: async (commentId: string): Promise<DeleteCommentResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<DeleteCommentResponse>(response);
  },

  // Permanently delete comment (admin only)
  permanentDeleteComment: async (
    commentId: string,
  ): Promise<DeleteCommentResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}/permanent`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    return handleResponse<DeleteCommentResponse>(response);
  },

  // SOCIAL ACTIONS

  // Like a comment
  likeComment: async (commentId: string): Promise<LikeCommentResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse<LikeCommentResponse>(response);
  },

  // Unlike a comment
  unlikeComment: async (commentId: string): Promise<LikeCommentResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<LikeCommentResponse>(response);
  },

  // Flag a comment
  flagComment: async (
    commentId: string,
    data: FlagCommentRequest,
  ): Promise<FlagCommentResponse> => {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/flag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<FlagCommentResponse>(response);
  },

  // ADMIN ACTIONS

  // Get flagged comments (admin only)
  getFlaggedComments: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<FlaggedCommentsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(
      `${API_BASE_URL}/admin/comments/flagged${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<FlaggedCommentsResponse>(response);
  },

  // Resolve flags on a comment (admin only)
  resolveCommentFlags: async (
    commentId: string,
    data: ResolveFlagsRequest,
  ): Promise<ResolveFlagsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}/resolve-flags`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      },
    );
    return handleResponse<ResolveFlagsResponse>(response);
  },
};
