// api/disputeApis.ts
import type {
  Dispute,
  DisputesResponse,
  CreateDisputeRequest,
  UpdateStatusRequest,
  AddMessageRequest,
  ResolveDisputeRequest,
  EscalateDisputeRequest,
  AssignAdminRequest,
  AddEvidenceRequest,
  DisputeStatistics,
  DisputeQueryParams,
} from "@/types/dispute.types";
import { API_BASE_URL } from "./authApis";

export const disputesApi = {
  // CREATE DISPUTE
  createDispute: async (
    data: CreateDisputeRequest,
  ): Promise<{
    success: boolean;
    message: string;
    data: { dispute: Dispute };
  }> => {
    const response = await fetch(`${API_BASE_URL}/disputes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create dispute");
    }

    return result;
  },

  // GET ALL DISPUTES (with filtering and pagination)
  getDisputes: async ({
    status,
    type,
    priority,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: DisputeQueryParams = {}): Promise<DisputesResponse> => {
    const url = new URL(`${API_BASE_URL}/disputes`);

    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("sortBy", sortBy);
    url.searchParams.append("sortOrder", sortOrder);

    if (status) {
      url.searchParams.append("status", status);
    }
    if (type) {
      url.searchParams.append("type", type);
    }
    if (priority) {
      url.searchParams.append("priority", priority);
    }
    if (fromDate) {
      url.searchParams.append("fromDate", fromDate);
    }
    if (toDate) {
      url.searchParams.append("toDate", toDate);
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
      throw new Error(data.message || "Failed to fetch disputes");
    }

    return data;
  },

  // GET MY DISPUTES (current user's disputes)
  getMyDisputes: async ({
    status,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  }: {
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}): Promise<DisputesResponse> => {
    const url = new URL(`${API_BASE_URL}/disputes/my`);

    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("sortBy", sortBy);
    url.searchParams.append("sortOrder", sortOrder);

    if (status) {
      url.searchParams.append("status", status);
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
      throw new Error(data.message || "Failed to fetch your disputes");
    }

    return data;
  },

  // GET DISPUTE STATISTICS
  getDisputeStatistics: async (
    collegeId?: string,
  ): Promise<{ success: boolean; data: DisputeStatistics }> => {
    const url = new URL(`${API_BASE_URL}/disputes/statistics`);

    if (collegeId) {
      url.searchParams.append("collegeId", collegeId);
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
      throw new Error(data.message || "Failed to fetch dispute statistics");
    }

    return data;
  },

  // GET DISPUTES BY ITEM
  getDisputesByItem: async (
    itemId: string,
  ): Promise<{
    success: boolean;
    data: { disputes: Dispute[]; count: number };
  }> => {
    const response = await fetch(`${API_BASE_URL}/disputes/item/${itemId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch disputes for item");
    }

    return data;
  },

  // GET SINGLE DISPUTE BY ID
  getDisputeById: async (
    id: string,
  ): Promise<{ success: boolean; data: { dispute: Dispute } }> => {
    const response = await fetch(`${API_BASE_URL}/disputes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch dispute");
    }

    return data;
  },

  // UPDATE DISPUTE STATUS
  updateDisputeStatus: async (
    id: string,
    data: UpdateStatusRequest,
  ): Promise<{
    success: boolean;
    message: string;
    data: { dispute: Dispute };
  }> => {
    const response = await fetch(`${API_BASE_URL}/disputes/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update dispute status");
    }

    return result;
  },

  // ADD MESSAGE TO DISPUTE
  addDisputeMessage: async (
    id: string,
    data: AddMessageRequest,
  ): Promise<{
    success: boolean;
    message: string;
    data: { messages: any[] };
  }> => {
    const response = await fetch(`${API_BASE_URL}/disputes/${id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add message");
    }

    return result;
  },

  // RESOLVE DISPUTE
  resolveDispute: async (
    id: string,
    data: ResolveDisputeRequest,
  ): Promise<{
    success: boolean;
    message: string;
    data: { dispute: Dispute };
  }> => {
    const response = await fetch(`${API_BASE_URL}/disputes/${id}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to resolve dispute");
    }

    return result;
  },

  // ESCALATE DISPUTE
  escalateDispute: async (
    id: string,
    data: EscalateDisputeRequest,
  ): Promise<{
    success: boolean;
    message: string;
    data: { dispute: Dispute };
  }> => {
    const response = await fetch(`${API_BASE_URL}/disputes/${id}/escalate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to escalate dispute");
    }

    return result;
  },

  // ASSIGN ADMIN TO DISPUTE
  assignAdminToDispute: async (
    id: string,
    data: AssignAdminRequest,
  ): Promise<{
    success: boolean;
    message: string;
    data: { dispute: Dispute };
  }> => {
    const response = await fetch(`${API_BASE_URL}/disputes/${id}/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to assign admin");
    }

    return result;
  },

  // ADD EVIDENCE TO DISPUTE
  addDisputeEvidence: async (
    id: string,
    data: AddEvidenceRequest,
  ): Promise<{
    success: boolean;
    message: string;
    data: { evidence: any[] };
  }> => {
    const response = await fetch(`${API_BASE_URL}/disputes/${id}/evidence`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add evidence");
    }

    return result;
  },

  // ARCHIVE DISPUTE (Super Admin only)
  archiveDispute: async (
    id: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: { disputeId: string; status: string };
  }> => {
    const response = await fetch(`${API_BASE_URL}/disputes/${id}/archive`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to archive dispute");
    }

    return data;
  },
};
