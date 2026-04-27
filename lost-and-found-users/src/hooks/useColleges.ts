import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { collegesApi } from "@/services/collegesApi";

// Query keys for better cache management
export const collegeKeys = {
  all: ["colleges"] as const,
  lists: () => [...collegeKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...collegeKeys.lists(), filters] as const,
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
