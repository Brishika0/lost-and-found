import type { LoginCredentials, LoginResponse, SuperAdmin } from "@/types/auth";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const authApis = {
  fetchCurrentUser: async (): Promise<SuperAdmin | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error("Auth check failed:", error);
      return null;
    }
  },

  loginRequest: async (
    credentials: LoginCredentials,
  ): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/superadmin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Login failed");
    }

    return data;
  },

  logoutRequest: async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
};
