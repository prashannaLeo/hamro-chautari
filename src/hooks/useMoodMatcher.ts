import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MoodMatch {
  id: string;
  name: string;
  username: string;
  avatar: string;
  mood: string;
  location: string | null;
  bio: string | null;
  matchScore: number;
  mutualInterests: string[];
}

export const useMoodMatcher = () => {
  const [matches, setMatches] = useState<MoodMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const findMatches = async (selectedMood: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('mood', selectedMood)
        .eq('privacy_level', 'public')
        .neq('user_id', user.id)
        .limit(10);

      if (error) {
        console.error('Error fetching mood matches:', error);
        setMatches([]);
        return;
      }

      // Transform data to match expected format
      const transformedMatches: MoodMatch[] = (profiles || []).map((profile) => ({
        id: profile.user_id,
        name: profile.display_name || profile.username,
        username: profile.username,
        avatar: profile.avatar_url || '',
        mood: profile.mood || selectedMood,
        location: profile.location,
        bio: profile.bio,
        matchScore: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
        mutualInterests: ['adventure', 'nature', 'travel'] // TODO: Implement real interests matching
      }));

      setMatches(transformedMatches);
    } catch (error) {
      console.error('Error in findMatches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    matches,
    loading,
    findMatches
  };
};