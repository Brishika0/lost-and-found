// Types
export interface SuperAdmin {
  email: string;
  role: "super_admin";
  isSuperAdmin?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  totp?: string;
}

export interface LoginResponse {
  success?: boolean;
  message: string;
  superAdmin: SuperAdmin;
}

export interface AuthContextType {
  user: SuperAdmin | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}
