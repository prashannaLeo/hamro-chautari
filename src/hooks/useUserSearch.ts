import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SearchUser {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  mood: string | null;
  location: string | null;
}

export const useUserSearch = () => {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (query: string) => {
    if (!user || !query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);

      // Get current user's connections to exclude them from results
      const { data: connections } = await supabase
        .from('connections')
        .select('connected_user_id, user_id')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

      const connectedUserIds = connections?.flatMap(conn => 
        conn.user_id === user.id ? [conn.connected_user_id] : [conn.user_id]
      ) || [];

      // Add current user ID to exclude self
      connectedUserIds.push(user.id);

      // Search for users by username or display name
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .not('user_id', 'in', `(${connectedUserIds.join(',')})`)
        .eq('privacy_level', 'public')
        .limit(10);

      if (error) throw error;

      setSearchResults(data as SearchUser[] || []);
    } catch (err: any) {
      console.error('Error searching users:', err);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResults,
    loading,
    searchUsers
  };
};