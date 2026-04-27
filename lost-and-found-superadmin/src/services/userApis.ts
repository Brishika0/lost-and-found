import type {
  UsersResponse,
  UserResponse,
  CreateUserPayload,
  UpdateUserPayload,
  UserStatsResponse,
  DeleteResponse,
} from "@/types/user.types";
import { API_BASE_URL } from "./authApis";

export const userApis = {
  // GET STUDENTS
  getStudents: async ({
    page = 1,
    limit = 10,
    search = "",
    isActive,
    collegeId,
    isEmailVerified,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    collegeId?: string;
    isEmailVerified?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}): Promise<UsersResponse> => {
    const url = new URL(`${API_BASE_URL}/users/students`);

    // Add query parameters
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("sortBy", sortBy);
    url.searchParams.append("sortOrder", sortOrder);

    if (search) url.searchParams.append("search", search);
    if (isActive !== undefined)
      url.searchParams.append("isActive", isActive.toString());
    if (collegeId) url.searchParams.append("collegeId", collegeId);
    if (isEmailVerified !== undefined)
      url.searchParams.append("isEmailVerified", isEmailVerified.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch students");
    }

    return response.json();
  },

  // GET COLLEGE ADMINS
  getCollegeAdmins: async ({
    page = 1,
    limit = 10,
    search = "",
    isActive,
    collegeId,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    collegeId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}): Promise<UsersResponse> => {
    const url = new URL(`${API_BASE_URL}/users/admins`);

    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("sortBy", sortBy);
    url.searchParams.append("sortOrder", sortOrder);

    if (search) url.searchParams.append("search", search);
    if (isActive !== undefined)
      url.searchParams.append("isActive", isActive.toString());
    if (collegeId) url.searchParams.append("collegeId", collegeId);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch admins");
    }

    return response.json();
  },

  // GET USER STATS
  getUserStats: async (): Promise<UserStatsResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch user stats");
    }

    return response.json();
  },

  // GET USER BY ID
  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch user");
    }

    return response.json();
  },

  // CREATE USER (Student only)
  createUser: async (userData: CreateUserPayload): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create user");
    }

    return response.json();
  },

  // UPDATE USER
  updateUser: async (
    id: string,
    userData: UpdateUserPayload,
  ): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update user");
    }

    return response.json();
  },

  // TOGGLE USER STATUS
  toggleUserStatus: async (id: string): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to toggle user status");
    }

    return response.json();
  },

  // DELETE USER (Soft Delete)
  deleteUser: async (id: string): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete user");
    }

    return response.json();
  },

  // PERMANENT DELETE USER
  permanentDeleteUser: async (id: string): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/permanent`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to permanently delete user");
    }

    return response.json();
  },

  // VERIFY USER EMAIL
  verifyUserEmail: async (id: string): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/verify-email`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to verify user email");
    }

    return response.json();
  },

  // BULK VERIFY EMAILS
  bulkVerifyEmails: async (
    userIds: string[],
  ): Promise<{
    success: boolean;
    message: string;
    data: { matchedCount: number; modifiedCount: number };
  }> => {
    const response = await fetch(`${API_BASE_URL}/users/bulk-verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to bulk verify emails");
    }

    return response.json();
  },

  // GET UNVERIFIED USERS
  getUnverifiedUsers: async ({
    page = 1,
    limit = 20,
    search = "",
    collegeId,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    collegeId?: string;
  } = {}): Promise<UsersResponse> => {
    const url = new URL(`${API_BASE_URL}/users/unverified`);

    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());

    if (search) url.searchParams.append("search", search);
    if (collegeId) url.searchParams.append("collegeId", collegeId);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch unverified users");
    }

    return response.json();
  },

  // ADMIN RESEND VERIFICATION
  resendVerification: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(
      `${API_BASE_URL}/users/${id}/resend-verification`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to resend verification");
    }

    return response.json();
  },
};
