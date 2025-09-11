import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  filter_applied?: string;
  views_count: number;
  created_at: string;
  expires_at: string;
  profiles?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchStories = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch stories - RLS policy now handles friend filtering automatically
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
        return;
      }

      setStories(data || []);
    } catch (error) {
      console.error('Error in fetchStories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (file: File, caption?: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Upload media to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      // Create story record
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: file.type.startsWith('video/') ? 'video' : 'image',
          caption: caption || null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating story:', error);
        return { error: error.message };
      }

      await fetchStories();
      return { data };
    } catch (error) {
      console.error('Error in createStory:', error);
      return { error: 'Failed to create story' };
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting story:', error);
        return { error: error.message };
      }

      await fetchStories();
      return { success: true };
    } catch (error) {
      console.error('Error in deleteStory:', error);
      return { error: 'Failed to delete story' };
    }
  };

  const incrementViews = async (storyId: string) => {
    try {
      const { error } = await supabase
        .rpc('increment_story_views', { story_id: storyId });

      if (error) {
        console.error('Error incrementing views:', error);
      }
    } catch (error) {
      console.error('Error in incrementViews:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('stories-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'stories' 
      }, () => {
        fetchStories();
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'stories' 
      }, () => {
        fetchStories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchStories();
  }, [user]);

  return {
    stories,
    loading,
    createStory,
    deleteStory,
    incrementViews,
    refetch: fetchStories
  };
};