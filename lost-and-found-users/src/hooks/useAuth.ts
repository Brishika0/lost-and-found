import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApis } from "@/services/authApis";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyCollegeEmailRequest,
} from "@/types/auth";

// Extend auth keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  verification: () => [...authKeys.all, "verification"] as const,
  collegeVerification: (email: string) =>
    [...authKeys.all, "collegeVerification", email] as const,
};

// Register hook
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApis.register(data),
    onSuccess: (data) => {
      toast.success(
        data.message || "Registration successful! Please verify your email.",
      );
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Registration failed");
    },
  });
};

// Verify College Email hook (for checking college domain)
export const useVerifyCollegeEmail = () => {
  return useMutation({
    mutationFn: (data: VerifyCollegeEmailRequest) =>
      authApis.verifyCollegeEmail(data),
    onError: (error: any) => {
      // Don't show toast for validation errors during typing
      if (error?.message?.toLowerCase?.().includes("invalid college email")) {
        // Silently handle - let the form show the error
        return;
      }
      toast.error(error?.message || "Failed to verify college email");
    },
  });
};

// Forgot Password hook
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApis.forgotPassword(data),
    onSuccess: (data) => {
      toast.success("Password reset email sent successfully!", {
        description: data.message || "Please check your inbox and spam folder.",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send reset email");
    },
  });
};

// Reset Password hook
export const useResetPassword = (token: string) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      authApis.resetPassword(token, data),
    onSuccess: (data) => {
      toast.success(
        data.message ||
          "Password reset successfully! Please login with your new password.",
      );
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reset password");
    },
  });
};

// Change Password hook
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApis.changePassword(data),
    onSuccess: (data) => {
      toast.success(data.message || "Password changed successfully");
      // Optionally refresh user data
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      // setTimeout(() => navigate("/profile"), 2000);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to change password");
    },
  });
};

// Verify Email hook (with token)
export const useVerifyEmail = (token: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApis.verifyEmail(token),
    onSuccess: (data) => {
      toast.success(data.message || "Email verified successfully!");
      // Refresh user data to update verification status
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      navigate("/");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to verify email");
      navigate("/verify-email-prompt");
    },
  });
};

// Resend Verification hook
export const useResendVerification = () => {
  return useMutation({
    mutationFn: () => authApis.resendVerification(),
    onSuccess: (data) => {
      toast.success(data.message || "Verification email resent successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to resend verification email");
    },
  });
};

// Optional: Query hook to check college email validity (if you want to use useQuery instead of mutation)
export const useCheckCollegeEmail = (
  email: string,
  enabled: boolean = false,
) => {
  return useQuery({
    queryKey: authKeys.collegeVerification(email),
    queryFn: () => authApis.verifyCollegeEmail({ email }),
    enabled: enabled && !!email && email.includes("@"),
    retry: false,
    staleTime: Infinity, // Never refetch automatically
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
