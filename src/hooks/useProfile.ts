// src/hooks/useProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

// Use the generated types from your database
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];

export type { UserProfile, Organization };

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setOrganization(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching profile for user:', user?.id);

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          console.log('Profile not found, creating new profile...');
          await createProfile();
          return;
        }
        throw profileError;
      }

      console.log('Profile found:', profileData);
      setProfile(profileData);

      // Get organization if profile has one
      if (profileData.organization_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single();

        if (orgError) throw orgError;
        console.log('Organization found:', orgData);
        setOrganization(orgData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching profile:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createProfile = async () => {
    try {
      console.log('Creating new organization and profile...');
      
      if (!user?.id || !user?.email) {
        throw new Error('User not authenticated');
      }
      
      // Create organization first
      const orgName = `${user.email.split('@')[0] || 'My'} Florals`;
      const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');

      const orgInsert: OrganizationInsert = {
        name: orgName,
        slug: orgSlug,
        plan: 'free',
        subscription_status: 'active',
        email: user.email
      };

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert(orgInsert)
        .select()
        .single();

      if (orgError) throw orgError;
      console.log('Organization created:', orgData);

      // Create user profile
      const profileInsert: UserProfileInsert = {
        id: user.id,
        organization_id: orgData.id,
        email: user.email,
        first_name: '',
        last_name: '',
        role: 'owner',
        status: 'available'
      };

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileInsert)
        .select()
        .single();

      if (profileError) throw profileError;
      console.log('Profile created:', profileData);

      setProfile(profileData);
      setOrganization(orgData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error creating profile:', err);
      setError(errorMessage);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null);
      console.log('Updating profile:', updates);

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

      console.log('Profile updated:', data);
      setProfile(data);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating profile:', err);
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

      console.log('Updating organization:', updates);

      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', profile.organization_id)
        .select()
        .single();

      if (error) throw error;

      console.log('Organization updated:', data);
      setOrganization(data);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating organization:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    profile,
    organization,
    loading,
    error,
    updateProfile,
    updateOrganization,
    refetch: fetchProfile
  };
}