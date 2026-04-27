import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUserPayload, UpdateUserPayload } from "@/types/user.types";
import { userApis } from "@/services/userApis";
import { toast } from "sonner";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  students: () => [...userKeys.all, "students"] as const,
  studentList: (filters: any) => [...userKeys.students(), filters] as const,
  admins: () => [...userKeys.all, "admins"] as const,
  adminList: (filters: any) => [...userKeys.admins(), filters] as const,
  unverified: () => [...userKeys.all, "unverified"] as const,
  unverifiedList: (filters: any) =>
    [...userKeys.unverified(), filters] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

//  GET STUDENTS
export const useGetStudents = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  collegeId?: string;
  isEmailVerified?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: userKeys.studentList(params || {}),
    queryFn: () => userApis.getStudents(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

//  GET COLLEGE ADMINS
export const useGetCollegeAdmins = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  collegeId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  return useQuery({
    queryKey: userKeys.adminList(params || {}),
    queryFn: () => userApis.getCollegeAdmins(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};

//  GET USER STATS
export const useGetUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userApis.getUserStats(),
    staleTime: 10 * 60 * 1000,
  });
};

//  GET USER BY ID
export const useGetUserById = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApis.getUserById(id),
    enabled: !!id,
    placeholderData: (previousData) => previousData,
  });
};

//  GET UNVERIFIED USERS
export const useGetUnverifiedUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  collegeId?: string;
}) => {
  return useQuery({
    queryKey: userKeys.unverifiedList(params || {}),
    queryFn: () => userApis.getUnverifiedUsers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
  });
};

//  CREATE USER
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserPayload) => userApis.createUser(userData),
    onSuccess: (data) => {
      toast.success(`User "${data.data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user");
    },
  });
};

//  UPDATE USER
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      userApis.updateUser(id, data),
    onSuccess: (data, variables) => {
      toast.success(`User updated successfully!`);
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });
};

//  TOGGLE USER STATUS
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApis.toggleUserStatus(id),
    onSuccess: (data, id) => {
      toast.success(
        `User ${data.data.isActive ? "activated" : "deactivated"} successfully!`,
      );
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle user status");
    },
  });
};

//  DELETE USER
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApis.deleteUser(id),
    onSuccess: (_, id) => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
};

//  PERMANENT DELETE USER
export const usePermanentDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApis.permanentDeleteUser(id),
    onSuccess: (_, id) => {
      toast.success("User permanently deleted!");
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
      queryClient.invalidateQueries({ queryKey: userKeys.admins() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to permanently delete user");
    },
  });
};

//  VERIFY USER EMAIL
export const useVerifyUserEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApis.verifyUserEmail(id),
    onSuccess: (data, id) => {
      toast.success(`Email verified for ${data.data.name}!`);
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
      queryClient.invalidateQueries({ queryKey: userKeys.unverified() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to verify email");
    },
  });
};

//  BULK VERIFY EMAILS
export const useBulkVerifyEmails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => userApis.bulkVerifyEmails(userIds),
    onSuccess: (data) => {
      toast.success(`${data.data.modifiedCount} users verified successfully!`);
      queryClient.invalidateQueries({ queryKey: userKeys.students() });
      queryClient.invalidateQueries({ queryKey: userKeys.unverified() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to bulk verify emails");
    },
  });
};

//  RESEND VERIFICATION
export const useResendVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApis.resendVerification(id),
    onSuccess: () => {
      toast.success("Verification email sent!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send verification email");
    },
  });
};
