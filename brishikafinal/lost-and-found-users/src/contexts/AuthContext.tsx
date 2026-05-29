import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { authApis } from "@/services/authApis";
import type {
  AuthContextType,
  LoginRequest,
  LoginResponse,
} from "@/types/auth";
import { toast } from "sonner";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for current user
  const {
    data: userResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      console.log("🔍 Fetching current user...");
      const response = await authApis.getMe();
      console.log("📦 User fetched:", response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Extract user from response
  const user = userResponse?.data ?? null;

  // Log when user changes
  useEffect(() => {
    console.log("🔄 AuthContext user updated:", user);
  }, [user]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApis.login,
    onSuccess: (data) => {
      // Update the user data in cache
      queryClient.setQueryData(authKeys.user(), data);
      toast.success(data.message || "Login successful");

      // Force refetch to ensure cache is updated
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      // Navigate to home page
      navigate("/");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || "An unknown error occurred during login";
      toast.error(errorMessage);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApis.logout,
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(authKeys.user(), null);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      // Navigate to login page
      navigate("/login");
      toast.success("Logged out successfully");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "An error occurred during logout";
      toast.error(errorMessage);
    },
  });

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const result = await loginMutation.mutateAsync(credentials);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: error as Error | null,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Modified withAuth HOC (optional enhancement)
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent?: React.ComponentType,
): React.FC<P> => {
  return function WithAuth(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate("/login");
      }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) {
      return LoadingComponent ? <LoadingComponent /> : <Spinner />;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
};

// Optional: Hook for protected data fetching
export const useProtectedQuery = <TData,>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options = {},
) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey,
    queryFn,
    enabled: isAuthenticated,
    ...options,
  });
};
