import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export interface SearchPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: string;
}

export const useEnhancedSearch = () => {
  const { user } = useAuth();
  const [userSuggestions, setUserSuggestions] = useState<SearchUser[]>([]);
  const [postSuggestions, setPostSuggestions] = useState<SearchPost[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);

  // Load recent searches from localStorage
  const loadRecentSearches = useCallback(() => {
    try {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        const searches = JSON.parse(saved) as RecentSearch[];
        setRecentSearches(searches.slice(0, 5)); // Keep only 5 most recent
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Save recent search to localStorage
  const addRecentSearch = useCallback((query: string) => {
    try {
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: new Date().toISOString()
      };

      const saved = localStorage.getItem('recent_searches');
      let searches: RecentSearch[] = [];
      
      if (saved) {
        searches = JSON.parse(saved);
      }

      // Remove duplicate if exists
      searches = searches.filter(s => s.query.toLowerCase() !== query.toLowerCase());
      
      // Add to beginning
      searches.unshift(newSearch);
      
      // Keep only 5 most recent
      searches = searches.slice(0, 5);
      
      localStorage.setItem('recent_searches', JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }, []);

  // Search for users and posts
  const search = useCallback(async (query: string) => {
    if (!user || !query.trim()) {
      setUserSuggestions([]);
      setPostSuggestions([]);
      return;
    }

    setLoading(true);
    
    try {
      // Search for users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query.trim()}%,display_name.ilike.%${query.trim()}%`)
        .eq('privacy_level', 'public')
        .neq('user_id', user.id)
        .limit(5);

      if (usersError) {
        console.error('Error searching users:', usersError);
      } else {
        setUserSuggestions(users as SearchUser[] || []);
      }

      // Search for posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .ilike('content', `%${query.trim()}%`)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(5);

      if (postsError) {
        console.error('Error searching posts:', postsError);
      } else {
        setPostSuggestions(posts as SearchPost[] || []);
      }

      // Also search by initials for users
      const initials = query.trim().toUpperCase();
      if (initials.length >= 2) {
        const { data: initialUsers, error: initialsError } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.${initials}%,display_name.ilike.${initials}%`)
          .eq('privacy_level', 'public')
          .neq('user_id', user.id)
          .limit(3);

        if (!initialsError && initialUsers) {
          // Merge with existing results, avoiding duplicates
          const existingIds = users?.map(u => u.id) || [];
          const newUsers = initialUsers.filter(u => !existingIds.includes(u.id));
          setUserSuggestions(prev => [...prev, ...newUsers].slice(0, 8));
        }
      }

    } catch (error) {
      console.error('Error in enhanced search:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load recent searches on mount
  useState(() => {
    loadRecentSearches();
  });

  return {
    userSuggestions,
    postSuggestions,
    recentSearches,
    loading,
    search,
    addRecentSearch,
    loadRecentSearches
  };
};
