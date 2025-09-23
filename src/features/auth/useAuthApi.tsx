import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient, setAuthToken, getAuthToken, removeAuthToken, User } from '@/lib/api/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to get current user:', error);
      removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const response = await apiClient.register(email, password, name);
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signOut = () => {
    removeAuthToken();
    setUser(null);
  };

  const updateProfile = async (name: string) => {
    try {
      const response = await apiClient.updateProfile(name);
      setUser(response.user);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthApi() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthApi must be used within an AuthProvider');
  }
  return context;
}