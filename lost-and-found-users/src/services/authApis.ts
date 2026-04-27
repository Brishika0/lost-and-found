import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  GetMeResponseType,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyCollegeEmailRequest,
  VerifyCollegeEmailResponse,
  VerifyEmailResponse,
} from "@/types/auth";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper to handle response
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      success: false,
      message: "An unexpected error occurred",
    }));
    throw errorData;
  }
  return response.json();
}

//  AUTH FETCH FUNCTIONS

export const authApis = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<LoginResponse>(response);
  },

  // Register
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<RegisterResponse>(response);
  },

  // Logout
  logout: async (): Promise<LogoutResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse<LogoutResponse>(response);
  },

  // Get Current User
  getMe: async (): Promise<GetMeResponseType> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<GetMeResponseType>(response);
  },

  // Verify College Email (i.e, if the given email belongs to any college or not)
  verifyCollegeEmail: async (
    data: VerifyCollegeEmailRequest,
  ): Promise<VerifyCollegeEmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<VerifyCollegeEmailResponse>(response);
  },

  // Forgot Password
  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<ForgotPasswordResponse>(response);
  },

  // Reset Password (token from URL param)
  resetPassword: async (
    token: string,
    data: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, token }),
    });
    return handleResponse<ResetPasswordResponse>(response);
  },

  // Change Password
  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<ChangePasswordResponse>(response);
  },

  // Verify Email (token from URL param)
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<VerifyEmailResponse>(response);
  },

  // Resend Verification Email
  resendVerification: async (): Promise<ResendVerificationResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<ResendVerificationResponse>(response);
  },
};
