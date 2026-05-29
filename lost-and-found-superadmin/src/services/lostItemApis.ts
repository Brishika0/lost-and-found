import type {
  CreateLostItemRequest,
  DeleteResponse,
  FlaggedItemsResponse,
  FlagItemRequest,
  FlagResponse,
  GetLostItemsQuery,
  ImageUploadResponse,
  InteractionsResponse,
  ItemsByZoneResponse,
  LikeResponse,
  LostItemListResponse,
  LostItemResponse,
  MyItemsResponse,
  NearbyItemsResponse,
  ResolveFlagsRequest,
  ResolveFlagsResponse,
  SearchItemsQuery,
  SearchItemsResponse,
  ShareItemRequest,
  ShareResponse,
  TrendingItemsResponse,
  UpdateLostItemRequest,
  UpdateStatusRequest,
  VerifyResponse,
} from "@/types/lostItem.types";

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

//  LOST ITEMS API

export const lostItemApis = {
  // Create lost item
  createLostItem: async (
    data: CreateLostItemRequest,
    images?: File[],
  ): Promise<LostItemResponse> => {
    const formData = new FormData();

    // Append images
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    // IMPORTANT: Append each field individually, NOT as a single JSON object
    // This matches what your backend controller expects
    formData.append("itemName", data.itemName);
    formData.append("description", data.description);
    formData.append("category", data.category);
    if (data.subCategory) formData.append("subCategory", data.subCategory);
    formData.append("status", data.status || "lost");
    formData.append("locationDescription", data.locationDescription);
    if (data.zoneId) formData.append("zoneId", data.zoneId);

    // Handle specificLocation
    if (data.specificLocation) {
      if (data.specificLocation.building) {
        formData.append(
          "specificLocation[building]",
          data.specificLocation.building,
        );
      }
      if (data.specificLocation.floor !== undefined) {
        formData.append(
          "specificLocation[floor]",
          data.specificLocation.floor.toString(),
        );
      }
      if (data.specificLocation.room) {
        formData.append("specificLocation[room]", data.specificLocation.room);
      }
      if (data.specificLocation.landmark) {
        formData.append(
          "specificLocation[landmark]",
          data.specificLocation.landmark,
        );
      }
      if (data.specificLocation.coordinates) {
        formData.append(
          "specificLocation[coordinates]",
          JSON.stringify(data.specificLocation.coordinates),
        );
      }
    }

    // Handle dates
    if (data.dateLost) formData.append("dateLost", data.dateLost);
    if (data.dateFound) formData.append("dateFound", data.dateFound);

    // Handle contactInfo
    if (data.contactInfo) {
      if (data.contactInfo.phone)
        formData.append("contactInfo[phone]", data.contactInfo.phone);
      if (data.contactInfo.email)
        formData.append("contactInfo[email]", data.contactInfo.email);
      if (data.contactInfo.preferredContact) {
        formData.append(
          "contactInfo[preferredContact]",
          data.contactInfo.preferredContact,
        );
      }
      formData.append(
        "contactInfo[showContact]",
        String(data.contactInfo.showContact ?? true),
      );
    }

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    const response = await fetch(`${API_BASE_URL}/lost-items`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return handleResponse<LostItemResponse>(response);
  },

  //  Get all lost items with pagination and filters
  getLostItems: async (
    params: GetLostItemsQuery,
  ): Promise<LostItemListResponse> => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/lost-items${queryString}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<LostItemListResponse>(response);
  },

  // Get trending items (most liked/shared/viewed)
  getTrendingItems: async (
    collegeId: string,
    limit: number = 10,
  ): Promise<TrendingItemsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/lost-items/trending?collegeId=${collegeId}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<TrendingItemsResponse>(response);
  },

  // Search items
  searchItems: async (
    params: SearchItemsQuery,
  ): Promise<SearchItemsResponse> => {
    const queryString = buildQueryString(params);
    const response = await fetch(
      `${API_BASE_URL}/lost-items/search${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<SearchItemsResponse>(response);
  },

  // Get items by zone
  getItemsByZone: async (
    zoneId: string,
    collegeId: string,
  ): Promise<ItemsByZoneResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/lost-items/zone/${zoneId}?collegeId=${collegeId}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<ItemsByZoneResponse>(response);
  },

  //    Get nearby items based on location
  getNearbyItems: async (
    collegeId: string,
    latitude: number,
    longitude: number,
    maxDistance: number = 1000,
  ): Promise<NearbyItemsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/lost-items/nearby?collegeId=${collegeId}&latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<NearbyItemsResponse>(response);
  },

  // Get single lost item by ID
  getLostItemById: async (id: string): Promise<LostItemResponse> => {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<LostItemResponse>(response);
  },

  // Get my lost items
  getMyLostItems: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<MyItemsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(
      `${API_BASE_URL}/lost-items/user/me${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<MyItemsResponse>(response);
  },

  // Get my interactions (items found, claimed, returned)
  getMyInteractions: async (): Promise<InteractionsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/lost-items/user/interactions`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<InteractionsResponse>(response);
  },

  // Update lost item - FIXED
  updateLostItem: async (
    id: string,
    data: UpdateLostItemRequest,
    images?: File[],
  ): Promise<LostItemResponse> => {
    const formData = new FormData();

    // Append images if provided
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    // 🔥 FIX: Append each field individually, same as create
    if (data.itemName) formData.append("itemName", data.itemName);
    if (data.description) formData.append("description", data.description);
    if (data.category) formData.append("category", data.category);
    if (data.subCategory) formData.append("subCategory", data.subCategory);
    if (data.status) formData.append("status", data.status);
    if (data.locationDescription)
      formData.append("locationDescription", data.locationDescription);
    if (data.zoneId) formData.append("zoneId", data.zoneId);
    if (data.isActive !== undefined)
      formData.append("isActive", String(data.isActive));
    if (data.isVerified !== undefined)
      formData.append("isVerified", String(data.isVerified));

    // Handle specificLocation
    if (data.specificLocation) {
      if (data.specificLocation.building) {
        formData.append(
          "specificLocation[building]",
          data.specificLocation.building,
        );
      }
      if (data.specificLocation.floor !== undefined) {
        formData.append(
          "specificLocation[floor]",
          data.specificLocation.floor.toString(),
        );
      }
      if (data.specificLocation.room) {
        formData.append("specificLocation[room]", data.specificLocation.room);
      }
      if (data.specificLocation.landmark) {
        formData.append(
          "specificLocation[landmark]",
          data.specificLocation.landmark,
        );
      }
      if (data.specificLocation.coordinates) {
        formData.append(
          "specificLocation[coordinates]",
          JSON.stringify(data.specificLocation.coordinates),
        );
      }
    }

    // Handle dates
    if (data.dateLost) formData.append("dateLost", data.dateLost);
    if (data.dateFound) formData.append("dateFound", data.dateFound);

    // Handle contactInfo
    if (data.contactInfo) {
      if (data.contactInfo.phone)
        formData.append("contactInfo[phone]", data.contactInfo.phone);
      if (data.contactInfo.email)
        formData.append("contactInfo[email]", data.contactInfo.email);
      if (data.contactInfo.preferredContact) {
        formData.append(
          "contactInfo[preferredContact]",
          data.contactInfo.preferredContact,
        );
      }
      if (data.contactInfo.showContact !== undefined) {
        formData.append(
          "contactInfo[showContact]",
          String(data.contactInfo.showContact),
        );
      }
    }

    // Handle tags
    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    const response = await fetch(`${API_BASE_URL}/lost-items/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    return handleResponse<LostItemResponse>(response);
  },

  // Update item status
  updateItemStatus: async (
    id: string,
    data: UpdateStatusRequest,
  ): Promise<LostItemResponse> => {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<LostItemResponse>(response);
  },

  // Verify item (admin only)
  verifyItem: async (id: string): Promise<VerifyResponse> => {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}/verify`, {
      method: "PATCH",
      credentials: "include",
    });
    return handleResponse<VerifyResponse>(response);
  },

  //  IMAGE MANAGEMENT

  // Add images to item
  addImages: async (
    id: string,
    images: File[],
  ): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await fetch(`${API_BASE_URL}/lost-items/${id}/images`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return handleResponse<ImageUploadResponse>(response);
  },

  // Set primary image (using publicId)
  setPrimaryImage: async (
    id: string,
    publicId: string,
  ): Promise<ImageUploadResponse> => {
    const encodedPublicId = encodeURIComponent(publicId);
    const response = await fetch(
      `${API_BASE_URL}/lost-items/${id}/images/${encodedPublicId}/primary`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );
    return handleResponse<ImageUploadResponse>(response);
  },

  // Remove image (using publicId)
  removeImage: async (
    id: string,
    publicId: string,
  ): Promise<ImageUploadResponse> => {
    const encodedPublicId = encodeURIComponent(publicId);
    const response = await fetch(
      `${API_BASE_URL}/lost-items/${id}/images/${encodedPublicId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    return handleResponse<ImageUploadResponse>(response);
  },

  //  SOCIAL ACTIONS

  // Like an item
  likeItem: async (id: string): Promise<LikeResponse> => {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}/like`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse<LikeResponse>(response);
  },

  // Unlike an item
  unlikeItem: async (id: string): Promise<LikeResponse> => {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}/like`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<LikeResponse>(response);
  },

  // Share an item
  shareItem: async (
    id: string,
    data?: ShareItemRequest,
  ): Promise<ShareResponse> => {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data || { sharedOn: "timeline" }),
      credentials: "include",
    });
    return handleResponse<ShareResponse>(response);
  },

  // Flag an item
  flagItem: async (
    id: string,
    data: FlagItemRequest,
  ): Promise<FlagResponse> => {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}/flag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<FlagResponse>(response);
  },

  //  DELETE

  // Soft delete item (owner or admin)
  deleteItem: async (id: string): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<DeleteResponse>(response);
  },

  // Permanently delete item (admin only)
  permanentDeleteItem: async (id: string): Promise<DeleteResponse> => {
    const response = await fetch(`${API_BASE_URL}/lost-items/${id}/permanent`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse<DeleteResponse>(response);
  },

  //  ADMIN ACTIONS

  // Get flagged items (admin only)
  getFlaggedItems: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<FlaggedItemsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await fetch(
      `${API_BASE_URL}/lost-items/admin/flagged${queryString}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    return handleResponse<FlaggedItemsResponse>(response);
  },

  // Resolve flags on an item (admin only)
  resolveFlags: async (
    id: string,
    data: ResolveFlagsRequest,
  ): Promise<ResolveFlagsResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/lost-items/${id}/resolve-flags`,
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
