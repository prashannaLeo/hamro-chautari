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

  const searchUsers = async (searchQuery: string) => {
    if (!user || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Searching for users with query:', searchQuery.trim());

      // Get current user's connections to exclude them from results
      const { data: connections, error: connectionsError } = await supabase
        .from('connections')
        .select('connected_user_id, user_id')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

      if (connectionsError) {
        console.error('Error fetching connections:', connectionsError);
      }

      const connectedUserIds = connections?.flatMap(conn => 
        conn.user_id === user.id ? [conn.connected_user_id] : [conn.user_id]
      ) || [];

      // Add current user ID to exclude self
      connectedUserIds.push(user.id);
      console.log('Excluding user IDs:', connectedUserIds);

      // Build the query for searching users
      let query = supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery.trim()}%,display_name.ilike.%${searchQuery.trim()}%`)
        .eq('privacy_level', 'public')
        .limit(10);

      // Only add the exclusion filter if there are connected users
      if (connectedUserIds.length > 1) { // > 1 because we always have current user
        const quoted = connectedUserIds.map((id) => `"${id}"`).join(',');
        query = query.not('user_id', 'in', `(${quoted})`);
      } else {
        // Just exclude current user
        query = query.neq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log('Search results:', data);
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