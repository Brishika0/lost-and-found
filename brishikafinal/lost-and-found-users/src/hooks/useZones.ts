import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { zoneApis } from "@/services/zoneApis";
import type {
  GetZonesQuery,
  CreateZoneRequest,
  UpdateZoneRequest,
  AddRoomRequest,
  RemoveRoomRequest,
} from "@/types/zone.types";

//  QUERY KEYS

export const zoneKeys = {
  all: ["zones"] as const,
  lists: () => [...zoneKeys.all, "list"] as const,
  list: (params?: GetZonesQuery) => [...zoneKeys.lists(), params] as const,
  details: () => [...zoneKeys.all, "detail"] as const,
  detail: (id: string) => [...zoneKeys.details(), id] as const,
  nearby: (collegeId: string, lat: number, lng: number, distance?: number) =>
    [...zoneKeys.all, "nearby", collegeId, lat, lng, distance] as const,
};

//  QUERY HOOKS

/**
 * Get all zones with filters
 * - Super Admin: can view all zones or filter by collegeId
 * - College Admin: must provide collegeId in params
 */
export const useGetZones = (params?: GetZonesQuery) => {
  return useQuery({
    queryKey: zoneKeys.list(params),
    queryFn: () => zoneApis.getZones(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get single zone by ID
 */
export const useGetZoneById = (id: string) => {
  return useQuery({
    queryKey: zoneKeys.detail(id),
    queryFn: () => zoneApis.getZoneById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get nearby zones based on coordinates
 * - Super Admin: can pass collegeId
 * - College Admin: must pass collegeId
 */
export const useGetNearbyZones = (
  collegeId: string,
  latitude: number,
  longitude: number,
  maxDistance?: number,
) => {
  return useQuery({
    queryKey: zoneKeys.nearby(collegeId, latitude, longitude, maxDistance),
    queryFn: () =>
      zoneApis.getNearbyZones(collegeId, latitude, longitude, maxDistance),
    enabled: !!collegeId && !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
  });
};

//  MUTATION HOOKS

/**
 * Create a new zone
 * - Super Admin: requires collegeId in request
 * - College Admin: requires collegeId in request
 */
export const useCreateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateZoneRequest) => zoneApis.createZone(data),
    onSuccess: () => {
      toast.success("Zone created successfully");
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create zone");
    },
  });
};

/**
 * Update a zone
 * - Super Admin: can update any zone, collegeId optional
 * - College Admin: must include collegeId in request
 */
export const useUpdateZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateZoneRequest }) =>
      zoneApis.updateZone(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Zone updated successfully");
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update zone");
    },
  });
};

/**
 * Delete a zone
 * - Super Admin: can delete any zone, collegeId optional
 * - College Admin: must include collegeId in request
 */
export const useDeleteZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, collegeId }: { id: string; collegeId?: string }) =>
      zoneApis.deleteZone(id, collegeId ? { collegeId } : undefined),
    onSuccess: () => {
      toast.success("Zone deleted successfully");
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete zone");
    },
  });
};

/**
 * Add room to zone
 * - Super Admin: can add room to any zone, collegeId optional
 * - College Admin: must include collegeId in request
 */
export const useAddRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddRoomRequest }) =>
      zoneApis.addRoom(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Room added successfully");
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add room");
    },
  });
};

/**
 * Remove room from zone
 * - Super Admin: can remove room from any zone, collegeId optional
 * - College Admin: must include collegeId in request
 */
export const useRemoveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      roomNumber,
      data,
    }: {
      id: string;
      roomNumber: string;
      data: RemoveRoomRequest;
    }) => zoneApis.removeRoom(id, roomNumber, data),
    onSuccess: (_, { id }) => {
      toast.success("Room removed successfully");
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove room");
    },
  });
};
