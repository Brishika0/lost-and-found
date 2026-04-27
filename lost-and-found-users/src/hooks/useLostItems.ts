import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { lostItemApis } from "@/services/lostItemApis";
import type {
  CreateLostItemRequest,
  UpdateLostItemRequest,
  UpdateStatusRequest,
  GetLostItemsQuery,
  SearchItemsQuery,
  FlagItemRequest,
  ShareItemRequest,
  ResolveFlagsRequest,
} from "@/types/lostItem.types";

// QUERY KEYS

export const lostItemKeys = {
  all: ["lost-items"] as const,
  lists: () => [...lostItemKeys.all, "list"] as const,
  list: (filters: GetLostItemsQuery) =>
    [...lostItemKeys.lists(), filters] as const,
  details: () => [...lostItemKeys.all, "detail"] as const,
  detail: (id: string) => [...lostItemKeys.details(), id] as const,
  trending: (collegeId: string) =>
    [...lostItemKeys.all, "trending", collegeId] as const,
  search: (params: SearchItemsQuery) =>
    [...lostItemKeys.all, "search", params] as const,
  nearby: (collegeId: string, lat: number, lng: number, distance: number) =>
    [...lostItemKeys.all, "nearby", collegeId, lat, lng, distance] as const,
  byZone: (zoneId: string, collegeId: string) =>
    [...lostItemKeys.all, "zone", zoneId, collegeId] as const,
  myItems: (params?: { page?: number; limit?: number; status?: string }) =>
    [...lostItemKeys.all, "my-items", params] as const,
  myInteractions: () => [...lostItemKeys.all, "my-interactions"] as const,
  flagged: (params?: { page?: number; limit?: number }) =>
    [...lostItemKeys.all, "flagged", params] as const,
};

// QUERY HOOKS

// Get all lost items with pagination and filters
export const useLostItems = (params: GetLostItemsQuery) => {
  return useQuery({
    queryKey: lostItemKeys.list(params),
    queryFn: () => lostItemApis.getLostItems(params),
    enabled: !!params.collegeId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get trending items
export const useTrendingItems = (collegeId: string, limit: number = 10) => {
  return useQuery({
    queryKey: lostItemKeys.trending(collegeId),
    queryFn: () => lostItemApis.getTrendingItems(collegeId, limit),
    enabled: !!collegeId,
    staleTime: 5 * 60 * 1000,
  });
};

// Search items
export const useSearchItems = (params: SearchItemsQuery) => {
  return useQuery({
    queryKey: lostItemKeys.search(params),
    queryFn: () => lostItemApis.searchItems(params),
    enabled: !!params.q && !!params.collegeId,
    staleTime: 0,
  });
};

// Get items by zone
export const useItemsByZone = (zoneId: string, collegeId: string) => {
  return useQuery({
    queryKey: lostItemKeys.byZone(zoneId, collegeId),
    queryFn: () => lostItemApis.getItemsByZone(zoneId, collegeId),
    enabled: !!zoneId && !!collegeId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get nearby items
export const useNearbyItems = (
  collegeId: string,
  latitude: number,
  longitude: number,
  maxDistance: number = 1000,
) => {
  return useQuery({
    queryKey: lostItemKeys.nearby(collegeId, latitude, longitude, maxDistance),
    queryFn: () =>
      lostItemApis.getNearbyItems(collegeId, latitude, longitude, maxDistance),
    enabled: !!collegeId && !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
  });
};

// Get single lost item by ID
export const useLostItem = (id: string, collegeId: string) => {
  return useQuery({
    queryKey: lostItemKeys.detail(id),
    queryFn: () => lostItemApis.getLostItemById(id, collegeId),
    enabled: !!id && !!collegeId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get my lost items
export const useMyLostItems = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: lostItemKeys.myItems(params),
    queryFn: () => lostItemApis.getMyLostItems(params),
    staleTime: 2 * 60 * 1000,
  });
};

// Get my interactions (found, claimed, returned items)
export const useMyInteractions = () => {
  return useQuery({
    queryKey: lostItemKeys.myInteractions(),
    queryFn: () => lostItemApis.getMyInteractions(),
    staleTime: 2 * 60 * 1000,
  });
};

// Get flagged items (admin only)
export const useFlaggedItems = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: lostItemKeys.flagged(params),
    queryFn: () => lostItemApis.getFlaggedItems(params),
    staleTime: 30 * 1000,
  });
};

// MUTATION HOOKS

// Create lost item
export const useCreateLostItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      images,
    }: {
      data: CreateLostItemRequest;
      images?: File[];
    }) => lostItemApis.createLostItem(data, images),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Item created successfully");

      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to create item");
    },
  });
};

// Update lost item
export const useUpdateLostItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      images,
    }: {
      id: string;
      data: UpdateLostItemRequest;
      images?: File[];
    }) => lostItemApis.updateLostItem(id, data, images),

    onSuccess: (response, { id }) => {
      toast.success(response.message || "Item updated successfully");

      // Invalidate the specific item and lists
      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to update item");
    },
  });
};

// Update item status
export const useUpdateItemStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusRequest }) =>
      lostItemApis.updateItemStatus(id, data),

    onSuccess: (response, { id }) => {
      toast.success(response.message || "Status updated successfully");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: lostItemKeys.myInteractions(),
      });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });
};

// Verify item (admin only)
export const useVerifyItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lostItemApis.verifyItem(id),

    onSuccess: (response, id) => {
      toast.success(response.message || "Item verified successfully");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to verify item");
    },
  });
};

// Add images to item
export const useAddImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, images }: { id: string; images: File[] }) =>
      lostItemApis.addImages(id, images),

    onSuccess: (response, { id }) => {
      toast.success(response.message || "Images added successfully");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to add images");
    },
  });
};

// Set primary image
export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, publicId }: { id: string; publicId: string }) =>
      lostItemApis.setPrimaryImage(id, publicId),

    onSuccess: (response, { id }) => {
      toast.success(response.message || "Primary image set successfully");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to set primary image");
    },
  });
};

// Remove image
export const useRemoveImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, publicId }: { id: string; publicId: string }) =>
      lostItemApis.removeImage(id, publicId),

    onSuccess: (response, { id }) => {
      toast.success(response.message || "Image removed successfully");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to remove image");
    },
  });
};

// Like item
export const useLikeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lostItemApis.likeItem(id),

    onSuccess: (response, id) => {
      toast.success(response.message || "Item liked");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.trending("") });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to like item");
    },
  });
};

// Unlike item
export const useUnlikeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lostItemApis.unlikeItem(id),

    onSuccess: (response, id) => {
      toast.success(response.message || "Item unliked");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.trending("") });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to unlike item");
    },
  });
};

// Share item
export const useShareItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ShareItemRequest }) =>
      lostItemApis.shareItem(id, data),

    onSuccess: (response, { id }) => {
      toast.success(response.message || "Item shared successfully");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.trending("") });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to share item");
    },
  });
};

// Flag item
export const useFlagItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FlagItemRequest }) =>
      lostItemApis.flagItem(id, data),

    onSuccess: (response, { id }) => {
      toast.success(response.message || "Item flagged successfully");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to flag item");
    },
  });
};

// Delete item (soft delete)
export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lostItemApis.deleteItem(id),

    onSuccess: (response, id) => {
      toast.success(response.message || "Item deleted successfully");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.myItems() });
      queryClient.invalidateQueries({
        queryKey: lostItemKeys.myInteractions(),
      });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to delete item");
    },
  });
};

// Permanent delete item (admin only)
export const usePermanentDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lostItemApis.permanentDeleteItem(id),

    onSuccess: (response, id) => {
      toast.success(response.message || "Item permanently deleted");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.flagged() });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to permanently delete item");
    },
  });
};

// Resolve flags (admin only)
export const useResolveFlags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveFlagsRequest }) =>
      lostItemApis.resolveFlags(id, data),

    onSuccess: (response, { id }) => {
      toast.success(response.message || "Flags resolved successfully");

      queryClient.invalidateQueries({ queryKey: lostItemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.flagged() });
      queryClient.invalidateQueries({ queryKey: lostItemKeys.lists() });
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to resolve flags");
    },
  });
};
