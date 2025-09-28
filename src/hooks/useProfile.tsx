// src/hooks/useProfile.ts - SIMPLE - Just fetches data
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ data: Session | null; error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ data: Session | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updateOrganization: (updates: Partial<Organization>) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  organization: null,
  loading: true,
  error: null,
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => ({ error: null }),
  updateProfile: async () => ({ success: false }),
  updateOrganization: async () => ({ success: false }),
  refetch: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile query timeout')), 10000);
      });

      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as { data: UserProfile | null; error: { code: string; message: string } | null };

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('⚠️ No profile found');
          setProfile(null);
          setOrganization(null);
          return;
        }
        throw profileError;
      }

      console.log('✅ Profile loaded:', profileData);
      setProfile(profileData);

      // Get organization
      if (profileData.organization_id) {
        console.log('🏢 Fetching organization:', profileData.organization_id);
        
        const orgPromise = supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single();

        const orgTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Organization query timeout')), 10000);
        });

        const { data: orgData, error: orgError } = await Promise.race([
          orgPromise,
          orgTimeoutPromise
        ]) as { data: Organization | null; error: { code: string; message: string } | null };

        if (orgError) {
          console.error('❌ Organization fetch error:', orgError);
          setOrganization(null);
        } else {
          console.log('✅ Organization loaded:', orgData);
          setOrganization(orgData);
        }
      }

      setError(null);
    } catch (err) {
      console.error('💥 Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setLoading(true);
          await fetchProfile(session.user.id);
          setLoading(false);
        } else {
          setProfile(null);
          setOrganization(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // Remove fetchProfile from dependency array

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) setError(error.message);
      return { data: data?.session ?? null, error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) setError(error.message);
      return { data: data?.session ?? null, error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setError(error.message);
      return { error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return { error };
    }
  };

  const refetch = async () => {
    if (user?.id) {
      setLoading(true);
      setHasFetched(false); // Reset the flag
      await fetchProfile(user.id);
      setHasFetched(true);
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    try {
      setError(null);

      if (!profile?.organization_id) {
        throw new Error('No organization found');
      }

      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', profile.organization_id)
        .select()
        .single();

      if (error) throw error;
      
      setOrganization(data);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    organization,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateOrganization,
    refetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useProfile() {
  return useAuth();
}

export type { UserProfile, Organization };