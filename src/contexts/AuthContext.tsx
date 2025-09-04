import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First check if username already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        return { 
          error: { 
            message: `Username "${username}" is already taken. Please choose a different username.` 
          } 
        };
      }

      // If there's an error other than no results, handle it
      if (profileError) {
        console.error('Username check error:', profileError);
        return { 
          error: { 
            message: 'Unable to verify username availability. Please try again.' 
          } 
        };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username.toLowerCase(),
            display_name: username
          }
        }
      });

      // Handle specific Supabase auth errors
      if (error) {
        if (error.message.includes('User already registered')) {
          return { 
            error: { 
              message: `An account with email "${email}" already exists. Please use a different email or try signing in.` 
            } 
          };
        }
        
        if (error.message.includes('Email rate limit exceeded')) {
          return { 
            error: { 
              message: 'Too many signup attempts. Please wait a few minutes before trying again.' 
            } 
          };
        }

        if (error.message.includes('Password should be at least')) {
          return { 
            error: { 
              message: 'Password must be at least 6 characters long.' 
            } 
          };
        }

        if (error.message.includes('Unable to validate email address')) {
          return { 
            error: { 
              message: 'Please enter a valid email address.' 
            } 
          };
        }
      }
      
      return { error };
    } catch (err: any) {
      return { 
        error: { 
          message: 'An unexpected error occurred. Please try again.' 
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Handle specific sign-in errors
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { 
            error: { 
              message: 'Invalid email or password. Please check your credentials and try again.' 
            } 
          };
        }

        if (error.message.includes('Email not confirmed')) {
          return { 
            error: { 
              message: 'Please check your email and click the confirmation link before signing in.' 
            } 
          };
        }

        if (error.message.includes('Too many requests')) {
          return { 
            error: { 
              message: 'Too many login attempts. Please wait a few minutes before trying again.' 
            } 
          };
        }
      }
      
      return { error };
    } catch (err: any) {
      return { 
        error: { 
          message: 'An unexpected error occurred. Please try again.' 
        } 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};