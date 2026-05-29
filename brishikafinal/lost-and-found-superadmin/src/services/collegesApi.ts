// api/collegeApis.ts
import type {
  College,
  CollegesResponse,
  CollegeStatsResponse,
  CollegeFormData,
} from "@/types/college";
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

  // GET SINGLE COLLEGE
  getCollegeById: async (
    id: string,
  ): Promise<{ success: boolean; data: College }> => {
    const response = await fetch(`${API_BASE_URL}/colleges/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch college");
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

  // CREATE COLLEGE
  createCollege: async (
    collegeData: CollegeFormData,
  ): Promise<{ success: boolean; message: string; data: College }> => {
    const formData = new FormData();

    // Append all fields to FormData
    formData.append("name", collegeData.name);
    formData.append("domain", collegeData.domain);
    formData.append("shortName", collegeData.shortName);

    if (collegeData.logo instanceof File) {
      formData.append("logo", collegeData.logo);
    }

    if (collegeData.location) {
      formData.append("location", JSON.stringify(collegeData.location));
    }

    if (collegeData.contactInfo) {
      formData.append("contactInfo", JSON.stringify(collegeData.contactInfo));
    }

    if (collegeData.metadata) {
      formData.append("metadata", JSON.stringify(collegeData.metadata));
    }

    const response = await fetch(`${API_BASE_URL}/colleges`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create college");
    }

    return data;
  },

  // UPDATE COLLEGE
  updateCollege: async (
    id: string,
    collegeData: Partial<Omit<CollegeFormData, "logo">> & { logo?: File },
  ): Promise<{ success: boolean; message: string; data: College }> => {
    const formData = new FormData();

    // Append only provided fields
    if (collegeData.name) formData.append("name", collegeData.name);
    if (collegeData.domain) formData.append("domain", collegeData.domain);
    if (collegeData.shortName)
      formData.append("shortName", collegeData.shortName);
    if (collegeData.logo) formData.append("logo", collegeData.logo);
    if (collegeData.location)
      formData.append("location", JSON.stringify(collegeData.location));
    if (collegeData.contactInfo)
      formData.append("contactInfo", JSON.stringify(collegeData.contactInfo));
    if (collegeData.metadata)
      formData.append("metadata", JSON.stringify(collegeData.metadata));

    const response = await fetch(`${API_BASE_URL}/colleges/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update college");
    }

    return data;
  },

  // UPDATE COLLEGE STATUS
  updateCollegeStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<{ success: boolean; message: string; data: College }> => {
    const response = await fetch(`${API_BASE_URL}/colleges/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ isActive }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update college status");
    }

    return data;
  },

  // DELETE COLLEGE
  deleteCollege: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/colleges/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete college");
    }

    return data;
  },

  // ADD COLLEGE ADMIN
  addCollegeAdmin: async (
    collegeId: string,
    adminId: string,
  ): Promise<{ success: boolean; message: string; data: College }> => {
    const response = await fetch(
      `${API_BASE_URL}/colleges/${collegeId}/admins`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ adminId }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add college admin");
    }

    return data;
  },

  // REMOVE COLLEGE ADMIN
  removeCollegeAdmin: async (
    collegeId: string,
    adminId: string,
  ): Promise<{ success: boolean; message: string; data: College }> => {
    const response = await fetch(
      `${API_BASE_URL}/colleges/${collegeId}/admins/${adminId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to remove college admin");
    }

    return data;
  },

  // GET COLLEGE STATS
  getCollegeStats: async (collegeId: string): Promise<CollegeStatsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/colleges/${collegeId}/stats`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch college stats");
    }

    return data;
  },
};
