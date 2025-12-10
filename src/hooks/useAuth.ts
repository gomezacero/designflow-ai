import { useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  bio: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: User;
  login: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  id: 'u1',
  name: 'Santiago Admin',
  email: 'santiago@designflow.ai',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  role: 'Product Manager',
  bio: 'Leading the design revolution with AI-powered workflows.',
};

/**
 * Custom hook for authentication state management
 */
export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>(DEFAULT_USER);

  const login = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    isAuthenticated,
    user,
    login,
    logout,
    updateProfile,
  };
};
