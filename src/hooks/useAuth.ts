import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  auth_id?: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  bio: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  isPasswordRecovery: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

/**
 * Custom hook for REAL Supabase authentication
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);

  // Fetch the public profile from the 'designers' table
  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        const profile = data as any;
        setUser({
          id: profile.id,
          auth_id: userId,
          name: profile.name,
          email: profile.email || email || '',
          avatar: profile.avatar || '',
          role: 'Designer',
          bio: 'Ready to design.'
        });
        setIsAuthenticated(true);
      } else if (error && email) {
        // Fallback if trigger hasn't run yet or failed
        console.warn('Profile not found, using basic auth info', error);
        setUser({
          id: 'temp',
          auth_id: userId,
          name: (email ? email.split('@')[0] : 'User') || 'User',
          email: email || '',
          avatar: '',
          role: 'New User',
          bio: ''
        });
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (session?.user) {
        // Only fetch if we don't have the user or it's a different user
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) return { error };

    if (authData.user) {
      // Robustness: Check if profile exists (in case trigger worked)
      const { data: existingProfile } = await supabase
        .from('designers')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();

      if (!existingProfile) {
        // If not detailed, insert it manually
        const name = fullName || email.split('@')[0];
        await supabase.from('designers').insert({
          user_id: authData.user.id,
          name: name,
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, // Generate random avatar
        } as any);
      }
    }

    return { error: null };
  }, []);

  const resetPassword = async (email: string) => {
    try {
      // Use production URL for password reset, fallback to current origin for local dev
      const redirectUrl = import.meta.env.PROD
        ? 'https://designflow-ai-lemon.vercel.app'
        : window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user?.auth_id) return;

    // Update local state optimistic
    setUser(prev => prev ? { ...prev, ...updates } : null);

    // Update DB
    const { error } = await supabase
      .from('designers')
      .update({
        name: updates.name,
        avatar: updates.avatar,
        // Add other fields to DB schema if needed
      })
      .eq('user_id', user.auth_id);

    if (error) console.error('Failed to update profile:', error);
  }, [user]);

  return {
    isAuthenticated,
    isLoading,
    user,
    isPasswordRecovery,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
    updatePassword
  };
};
