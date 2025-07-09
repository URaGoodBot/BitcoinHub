import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  streakDays: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasTriedAuth, setHasTriedAuth] = useState(false);
  const { toast } = useToast();

  // Check for existing session on mount - only run once
  const { data: sessionData, isLoading: sessionLoading, isError } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !hasTriedAuth,
    staleTime: Infinity, // Don't refetch automatically
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!sessionLoading && !hasTriedAuth) {
      setHasTriedAuth(true);
      if (sessionData && !isError) {
        setUser(sessionData as User);
      }
      setIsInitialized(true);
    }
  }, [sessionData, sessionLoading, hasTriedAuth, isError]);

  // If still initializing, show loading
  const isLoading = !isInitialized;

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      return response.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
      setIsGuest(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/register', { username, password });
      return response.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
      setIsGuest(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Account created!",
        description: `Welcome to BitcoinHub, ${userData.username}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Username may already be taken",
        variant: "destructive",
      });
    }
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const register = async (username: string, password: string) => {
    await registerMutation.mutateAsync({ username, password });
  };

  const logout = () => {
    apiRequest('POST', '/api/auth/logout', {});
    setUser(null);
    setIsGuest(false);
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setIsInitialized(true);
    toast({
      title: "Guest mode",
      description: "Your progress won't be saved in guest mode",
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isGuest,
    isLoading: !isInitialized,
    login,
    register,
    logout,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};