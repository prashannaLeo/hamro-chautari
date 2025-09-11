import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  mood: string | null;
  privacy_level: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          if (targetUserId === user?.id) {
            await createProfile();
          }
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'user',
          display_name: user.email,
          mood: 'neutral',
          privacy_level: 'public'
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      setProfile(data);
      
      return data;
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message);
      throw err; // Re-throw to handle in component
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};