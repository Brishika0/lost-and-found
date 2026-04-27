export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyCollegeEmailRequest {
  email: string;
}

// RESPONSE TYPES

export interface CollegeInfo {
  id: string;
  name: string;
  shortName: string;
  domain: string;
  logo?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "college_admin";
  avatar?: string;
  isEmailVerified: boolean;
  college?: CollegeInfo;
  chatPrivacy?: {
    allowMessagesFrom: "everyone" | "verified_only" | "nobody";
    showReadReceipts: boolean;
  };
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
    comments: boolean;
  };
  lastActive?: string;
  createdAt?: string;
}

export type GetMeResponse = User;

export interface LoginResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    name: string;
    college: {
      name: string;
      shortName: string;
    };
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface GetMeResponseType {
  success: boolean;
  message: string;
  data: GetMeResponse;
}

export interface VerifyCollegeEmailResponse {
  success: boolean;
  message: string;
  data: {
    valid: boolean;
    college: CollegeInfo;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

// ERROR RESPONSE

export interface ApiError {
  success: false;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
