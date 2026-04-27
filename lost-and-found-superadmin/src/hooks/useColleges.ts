import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CollegeFormData } from "@/types/college";
import { collegesApi } from "@/services/collegesApi";
import { toast } from "sonner";
import { userKeys } from "./useUsers";

export const collegeKeys = {
  all: ["colleges"] as const,
  lists: () => [...collegeKeys.all, "list"] as const,
  list: (filters: any) => [...collegeKeys.lists(), filters] as const,
  detail: (id: string) => [...collegeKeys.all, "detail", id] as const,
  stats: (id: string) => [...collegeKeys.all, "stats", id] as const,
};

//  GET ALL COLLEGES
export const useGetColleges = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: collegeKeys.list(params || {}),
    queryFn: async () => {
      try {
        const response = await collegesApi.getColleges(params);
        return response;
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch colleges");
        throw error;
      }
    },
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Don't refetch on window focus if you don't want to
    refetchOnWindowFocus: false,
    // Stale time - 5 minutes
    staleTime: 5 * 60 * 1000,
  });
};

//  GET SINGLE COLLEGE
export const useGetCollegeById = (id: string) => {
  return useQuery({
    queryKey: collegeKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await collegesApi.getCollegeById(id);
        return response.data;
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch college details");
        throw error;
      }
    },
    enabled: !!id, // Only run if id exists
    // Keep previous data while loading
    placeholderData: (previousData) => previousData,
  });
};

//  GET COLLEGE STATS
export const useGetCollegeStats = (collegeId: string) => {
  return useQuery({
    queryKey: collegeKeys.stats(collegeId),
    queryFn: async () => {
      try {
        const response = await collegesApi.getCollegeStats(collegeId);
        return response.data;
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch college stats");
        throw error;
      }
    },
    enabled: !!collegeId,
  });
};

//  VERIFY COLLEGE BY DOMAIN
export const useVerifyCollegeByDomain = () => {
  return useMutation({
    mutationFn: async (domain: string) => {
      const response = await collegesApi.verifyCollegeByDomain(domain);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`College found: ${data.name}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "College not found with this domain");
    },
  });
};

//  CREATE COLLEGE
export const useCreateCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collegeData: CollegeFormData) => {
      const response = await collegesApi.createCollege(collegeData);
      return response.data;
    },
    onSuccess: (data) => {
      // Show success toast
      toast.success(`College "${data.name}" created successfully!`);

      // Invalidate ALL college lists (to refetch)
      queryClient.invalidateQueries({ queryKey: collegeKeys.lists() });

      // Also invalidate any searches
      queryClient.invalidateQueries({ queryKey: collegeKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create college");
    },
  });
};

//  UPDATE COLLEGE
export const useUpdateCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CollegeFormData> & { logo?: File };
    }) => {
      const response = await collegesApi.updateCollege(id, data);
      return { id, data: response.data };
    },
    onSuccess: ({ id, data }) => {
      // Show success toast
      toast.success(`College "${data.name}" updated successfully!`);

      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: collegeKeys.lists() });

      // Invalidate this specific college's detail
      queryClient.invalidateQueries({ queryKey: collegeKeys.detail(id) });

      // Also invalidate stats since they might have changed
      queryClient.invalidateQueries({ queryKey: collegeKeys.stats(id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update college");
    },
  });
};

//  UPDATE COLLEGE STATUS
export const useUpdateCollegeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await collegesApi.updateCollegeStatus(id, isActive);
      return { id, isActive, data: response.data };
    },
    onSuccess: ({ id, isActive }) => {
      // Show success toast
      toast.success(
        `College ${isActive ? "activated" : "deactivated"} successfully!`,
      );

      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: collegeKeys.lists() });

      // Invalidate this specific college's detail
      queryClient.invalidateQueries({ queryKey: collegeKeys.detail(id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update college status");
    },
  });
};

//  DELETE COLLEGE
export const useDeleteCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await collegesApi.deleteCollege(id);
      return { id, message: response.message };
    },
    onSuccess: ({ id, message }) => {
      // Show success toast
      toast.success(message || "College deleted successfully!");

      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: collegeKeys.lists() });

      // Remove this college from cache
      queryClient.removeQueries({ queryKey: collegeKeys.detail(id) });
      queryClient.removeQueries({ queryKey: collegeKeys.stats(id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete college");
    },
  });
};

//  ADD COLLEGE ADMIN
export const useAddCollegeAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collegeId,
      adminId,
    }: {
      collegeId: string;
      adminId: string;
    }) => {
      const response = await collegesApi.addCollegeAdmin(collegeId, adminId);
      return { collegeId, adminId, data: response.data };
    },
    onSuccess: ({ collegeId }) => {
      // Show success toast
      toast.success("Admin added to college successfully!");

      // Invalidate this college's detail to show updated admin list
      queryClient.invalidateQueries({
        queryKey: collegeKeys.detail(collegeId),
      });

      // Also invalidate lists since admin count changed
      queryClient.invalidateQueries({ queryKey: collegeKeys.lists() });

      // Invaldate admins list
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add admin");
    },
  });
};

//  REMOVE COLLEGE ADMIN
export const useRemoveCollegeAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collegeId,
      adminId,
    }: {
      collegeId: string;
      adminId: string;
    }) => {
      const response = await collegesApi.removeCollegeAdmin(collegeId, adminId);
      return { collegeId, adminId, data: response.data };
    },
    onSuccess: ({ collegeId }) => {
      // Show success toast
      toast.success("Admin removed from college successfully!");

      // Invalidate this college's detail
      queryClient.invalidateQueries({
        queryKey: collegeKeys.detail(collegeId),
      });

      // Also invalidate lists
      queryClient.invalidateQueries({ queryKey: collegeKeys.lists() });

      // Invaldate admins list
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove admin");
    },
  });
};
