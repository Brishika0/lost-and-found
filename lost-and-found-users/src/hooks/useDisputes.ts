import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { disputesApi } from "@/services/disputeApis";
import type {
  Dispute,
  DisputeQueryParams,
  CreateDisputeRequest,
  UpdateStatusRequest,
  AddMessageRequest,
  ResolveDisputeRequest,
  EscalateDisputeRequest,
  AssignAdminRequest,
  AddEvidenceRequest,
} from "@/types/dispute.types";
import { toast } from "sonner";

// Query Keys

export const disputeKeys = {
  all: ["disputes"] as const,
  lists: () => [...disputeKeys.all, "list"] as const,
  list: (params: DisputeQueryParams) =>
    [...disputeKeys.lists(), params] as const,
  my: () => [...disputeKeys.all, "my"] as const,
  myList: (params: { status?: string; page?: number; limit?: number }) =>
    [...disputeKeys.my(), params] as const,
  statistics: (collegeId?: string) =>
    [...disputeKeys.all, "statistics", collegeId] as const,
  byItem: (itemId: string) => [...disputeKeys.all, "item", itemId] as const,
  details: () => [...disputeKeys.all, "detail"] as const,
  detail: (id: string) => [...disputeKeys.details(), id] as const,
};

// Query Hooks

/**
 * Get all disputes with filtering and pagination
 */
export const useDisputes = (params: DisputeQueryParams = {}) => {
  return useQuery({
    queryKey: disputeKeys.list(params),
    queryFn: () => disputesApi.getDisputes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });
};

/**
 * Get current user's disputes
 */
export const useMyDisputes = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: disputeKeys.myList(params || {}),
    queryFn: () => disputesApi.getMyDisputes(params || {}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Get dispute statistics
 */
export const useDisputeStatistics = (collegeId?: string) => {
  return useQuery({
    queryKey: disputeKeys.statistics(collegeId),
    queryFn: () => disputesApi.getDisputeStatistics(collegeId),
    staleTime: 10 * 60 * 1000, // 10 minutes - stats don't change often
    gcTime: 30 * 60 * 1000,
  });
};

/**
 * Get disputes by item ID
 */
export const useDisputesByItem = (itemId: string) => {
  return useQuery({
    queryKey: disputeKeys.byItem(itemId),
    queryFn: () => disputesApi.getDisputesByItem(itemId),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get single dispute by ID
 */
export const useDispute = (id: string) => {
  return useQuery({
    queryKey: disputeKeys.detail(id),
    queryFn: () => disputesApi.getDisputeById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Mutation Hooks

/**
 * Create a new dispute
 */
export const useCreateDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisputeRequest) => disputesApi.createDispute(data),
    onSuccess: (variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.my() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.statistics() });

      // Invalidate item-specific disputes
      if (variables.data.dispute.itemId) {
        queryClient.invalidateQueries({
          queryKey: disputeKeys.byItem(variables.data.dispute.itemId._id),
        });
      }

      toast.success("Dispute filed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to file dispute");
    },
  });
};

/**
 * Update dispute status
 */
export const useUpdateDisputeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusRequest }) =>
      disputesApi.updateDisputeStatus(id, data),
    onSuccess: (variables) => {
      // Invalidate the specific dispute
      queryClient.invalidateQueries({
        queryKey: disputeKeys.detail(variables.data.dispute._id),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.my() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.statistics() });

      toast.success("Dispute status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update dispute status");
    },
  });
};

/**
 * Add message to dispute
 */
export const useAddDisputeMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddMessageRequest }) =>
      disputesApi.addDisputeMessage(id, data),
    onSuccess: (variables) => {
      // Invalidate the specific dispute to get updated messages
      queryClient.invalidateQueries({
        queryKey: disputeKeys.detail(
          variables.data.messages[0]?.disputeId || "",
        ),
      });

      toast.success("Message added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add message");
    },
  });
};

/**
 * Resolve dispute (Admin only)
 */
export const useResolveDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveDisputeRequest }) =>
      disputesApi.resolveDispute(id, data),
    onSuccess: (result, variables) => {
      // Invalidate the specific dispute
      queryClient.invalidateQueries({
        queryKey: disputeKeys.detail(variables.id),
      });

      // Invalidate lists and statistics
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.my() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.statistics() });

      // Invalidate item if status was updated
      if (result.data.dispute?.itemId) {
        queryClient.invalidateQueries({
          queryKey: disputeKeys.byItem(result.data.dispute.itemId._id),
        });
      }

      toast.success("Dispute resolved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to resolve dispute");
    },
  });
};

/**
 * Escalate dispute (College Admin only)
 */
export const useEscalateDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EscalateDisputeRequest }) =>
      disputesApi.escalateDispute(id, data),
    onSuccess: (variables) => {
      // Invalidate the specific dispute
      queryClient.invalidateQueries({
        queryKey: disputeKeys.detail(variables.data.dispute._id),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.my() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.statistics() });

      toast.success("Dispute escalated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to escalate dispute");
    },
  });
};

/**
 * Assign admin to dispute
 */
export const useAssignAdminToDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignAdminRequest }) =>
      disputesApi.assignAdminToDispute(id, data),
    onSuccess: (variables) => {
      // Invalidate the specific dispute
      queryClient.invalidateQueries({
        queryKey: disputeKeys.detail(variables.data.dispute._id),
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.my() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.statistics() });

      toast.success("Admin assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign admin");
    },
  });
};

/**
 * Add evidence to dispute
 */
export const useAddDisputeEvidence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddEvidenceRequest }) =>
      disputesApi.addDisputeEvidence(id, data),
    onSuccess: (variables) => {
      // Invalidate the specific dispute to get updated evidence
      queryClient.invalidateQueries({
        queryKey: disputeKeys.detail(
          variables.data.evidence[0]?.disputeId || "",
        ),
      });

      toast.success("Evidence added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add evidence");
    },
  });
};

/**
 * Archive dispute (Super Admin only)
 */
export const useArchiveDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => disputesApi.archiveDispute(id),
    onSuccess: (variables) => {
      // Invalidate the specific dispute
      queryClient.invalidateQueries({
        queryKey: disputeKeys.detail(variables.data.disputeId),
      });

      // Invalidate lists and statistics
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.my() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.statistics() });

      toast.success("Dispute archived successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to archive dispute");
    },
  });
};

// Utility Hooks

/**
 * Hook to prefetch dispute data
 */
export const usePrefetchDispute = () => {
  const queryClient = useQueryClient();

  const prefetchDispute = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: disputeKeys.detail(id),
      queryFn: () => disputesApi.getDisputeById(id),
      staleTime: 2 * 60 * 1000,
    });
  };

  return { prefetchDispute };
};

/**
 * Hook to get cached dispute data
 */
export const useDisputeFromCache = (id: string) => {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<{ data: { dispute: Dispute } }>(
    disputeKeys.detail(id),
  );
  return data?.data?.dispute;
};
