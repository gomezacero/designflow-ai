import { useState, useCallback } from 'react';

interface UseAuthReturn {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

/**
 * Custom hook for authentication state management
 */
export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    login,
    logout,
  };
};
