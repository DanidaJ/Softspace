import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase, authHelpers } from '../utils/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<{ needsVerification: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isNewUser: boolean;
  clearNewUserFlag: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check active session on mount
    const initAuth = async () => {
      try {
        const session = await authHelpers.getSession();
        if (session?.user) {
          // Check if email is verified
          const emailConfirmed = !!session.user.email_confirmed_at;
          setIsEmailVerified(emailConfirmed);
          
          // Only set user if email is verified
          if (emailConfirmed) {
            setUser({
              id: session.user.id,
              name: session.user.user_metadata.full_name || 'Space Traveler',
              email: session.user.email || '',
              avatarUrl: session.user.user_metadata.avatar_url,
            });
            
            // Check if this is a new user (first login after verification)
            const hasLoggedInBefore = localStorage.getItem(`softspace_has_logged_in_${session.user.id}`);
            if (!hasLoggedInBefore) {
              setIsNewUser(true);
            }
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        const emailConfirmed = !!session.user.email_confirmed_at;
        setIsEmailVerified(emailConfirmed);
        
        // Only set user as authenticated if email is verified
        if (emailConfirmed) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata.full_name || 'Cosmic Traveler',
            email: session.user.email || '',
            avatarUrl: session.user.user_metadata.avatar_url,
          });
          
          // Check if new user on EMAIL_VERIFIED event
          if (event === 'SIGNED_IN') {
            const hasLoggedInBefore = localStorage.getItem(`softspace_has_logged_in_${session.user.id}`);
            if (!hasLoggedInBefore) {
              setIsNewUser(true);
            }
          }
        } else {
          // Email not verified - don't authenticate
          setUser(null);
        }
      } else {
        setUser(null);
        setIsEmailVerified(false);
      }
      
      // Ensure loading is false after any auth state change
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearNewUserFlag = () => {
    if (user?.id) {
      localStorage.setItem(`softspace_has_logged_in_${user.id}`, 'true');
      setIsNewUser(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user: authUser } = await authHelpers.signIn(email, password);
    if (authUser) {
      const emailConfirmed = !!(authUser as any).email_confirmed_at;
      setIsEmailVerified(emailConfirmed);
      
      if (!emailConfirmed) {
        // Sign out unverified users
        await authHelpers.signOut();
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }
      
      setUser({
        id: authUser.id,
        name: authUser.user_metadata.full_name || 'Space Traveler',
        email: authUser.email || '',
        avatarUrl: authUser.user_metadata.avatar_url,
      });
      
      // Check if new user
      const hasLoggedInBefore = localStorage.getItem(`softspace_has_logged_in_${authUser.id}`);
      if (!hasLoggedInBefore) {
        setIsNewUser(true);
      }
    }
  };

  const signup = async (email: string, password: string, fullName?: string): Promise<{ needsVerification: boolean }> => {
    const { user: authUser } = await authHelpers.signUp(email, password, fullName);
    
    // Don't set user yet - they need to verify email first
    // Supabase sends verification email automatically
    if (authUser) {
      // Check if email confirmation is required (email_confirmed_at will be null)
      const needsVerification = !(authUser as any).email_confirmed_at;
      
      if (!needsVerification) {
        // Email confirmation disabled in Supabase - allow direct login
        setUser({
          id: authUser.id,
          name: fullName || 'Cosmic Traveler',
          email: authUser.email || '',
          avatarUrl: authUser.user_metadata?.avatar_url,
        });
        setIsEmailVerified(true);
        setIsNewUser(true);
      }
      
      return { needsVerification };
    }
    
    return { needsVerification: true };
  };

  const logout = async () => {
    await authHelpers.signOut();
    setUser(null);
    setIsEmailVerified(false);
    setIsNewUser(false);
  };

  const resetPassword = async (email: string) => {
    await authHelpers.resetPassword(email);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      resetPassword, 
      isAuthenticated: !!user && isEmailVerified, 
      isEmailVerified,
      isNewUser,
      clearNewUserFlag,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};