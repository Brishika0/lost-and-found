import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { authApis } from "@/services/authApis";
import type {
  AuthContextType,
  LoginCredentials,
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
    data: user = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: authKeys.user(),

    // queryFn: authApis.fetchCurrentUser,
    queryFn: async () => {
      console.log("🔍 Fetching current user...");
      const user = await authApis.fetchCurrentUser();
      console.log("📦 User fetched:", user);
      return user;
    },

    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Log when user changes
  useEffect(() => {
    console.log("🔄 AuthContext user updated:", user);
  }, [user]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApis.loginRequest,
    onSuccess: (data) => {
      // Update the user data in cache
      queryClient.setQueryData(authKeys.user(), data.superAdmin);
      toast.success(data.message || "Login successful");

      // Force refetch to ensure cache is updated
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      // Navigate to home page
      navigate("/");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during login";
      toast.error(errorMessage);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApis.logoutRequest,
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(authKeys.user(), null);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });

  const login = async (
    credentials: LoginCredentials,
  ): Promise<LoginResponse> => {
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
    isSuperAdmin: user?.isSuperAdmin! && user?.role === "super_admin",
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
    const router = useNavigate(); // if using react-router

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router("/login");
      }
    }, [isLoading, isAuthenticated, router]);

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
