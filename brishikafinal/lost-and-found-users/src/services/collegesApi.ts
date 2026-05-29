// api/collegeApis.ts
import type { College, CollegesResponse } from "@/types/college";
import { API_BASE_URL } from "./authApis";

export const collegesApi = {
  // GET ALL COLLEGES
  getColleges: async ({
    page = 1,
    limit = 10,
    search = "",
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}): Promise<CollegesResponse> => {
    const url = new URL(`${API_BASE_URL}/colleges`);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("sortBy", sortBy);
    url.searchParams.append("sortOrder", sortOrder);

    if (search) {
      url.searchParams.append("search", search);
    }

    if (isActive !== undefined) {
      url.searchParams.append("isActive", isActive.toString());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch colleges");
    }

    return data;
  },

  // VERIFY COLLEGE BY DOMAIN
  verifyCollegeByDomain: async (
    domain: string,
  ): Promise<{ success: boolean; data: College }> => {
    const response = await fetch(`${API_BASE_URL}/colleges/verify-domain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ domain }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify college domain");
    }

    return data;
  },
};
