import type {
  GetZonesQuery,
  CreateZoneRequest,
  UpdateZoneRequest,
  AddRoomRequest,
  RemoveRoomRequest,
  ZonesListResponse,
  ZoneResponse,
  NearbyZonesResponse,
  AddRoomResponse,
  DeleteResponse,
} from "@/types/zone.types";

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

export const zoneApis = {
  // Get all zones with filters
  getZones: async (params?: GetZonesQuery): Promise<ZonesListResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(`${API_BASE_URL}/zones${queryString}`, {
      credentials: "include",
    });
    return handleResponse<ZonesListResponse>(response);
  },

  // Get single zone by ID
  getZoneById: async (id: string): Promise<ZoneResponse> => {
    const response = await fetch(`${API_BASE_URL}/zones/${id}`, {
      credentials: "include",
    });
    return handleResponse<ZoneResponse>(response);
  },

  // Get nearby zones based on coordinates
  getNearbyZones: async (
    collegeId: string,
    latitude: number,
    longitude: number,
    maxDistance: number = 1000,
  ): Promise<NearbyZonesResponse> => {
    const queryString = buildQueryString({
      collegeId,
      latitude,
      longitude,
      maxDistance,
    });
    const response = await fetch(`${API_BASE_URL}/zones/nearby${queryString}`, {
      credentials: "include",
    });
    return handleResponse<NearbyZonesResponse>(response);
  },

  // Create zone
  createZone: async (data: CreateZoneRequest): Promise<ZoneResponse> => {
    const response = await fetch(`${API_BASE_URL}/zones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<ZoneResponse>(response);
  },

  // Update zone
  updateZone: async (
    id: string,
    data: UpdateZoneRequest,
  ): Promise<ZoneResponse> => {
    const response = await fetch(`${API_BASE_URL}/zones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<ZoneResponse>(response);
  },

  // Delete zone
  deleteZone: async (
    id: string,
    data?: { collegeId: string },
  ): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/zones/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data || {}),
      credentials: "include",
    });
    return handleResponse<DeleteResponse>(response);
  },

  // Add room to zone
  addRoom: async (
    id: string,
    data: AddRoomRequest,
  ): Promise<AddRoomResponse> => {
    const response = await fetch(`${API_BASE_URL}/zones/${id}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<AddRoomResponse>(response);
  },

  // Remove room from zone
  removeRoom: async (
    id: string,
    roomNumber: string,
    data: RemoveRoomRequest,
  ): Promise<AddRoomResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/zones/${id}/rooms/${roomNumber}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      },
    );
    return handleResponse<AddRoomResponse>(response);
  },
};
