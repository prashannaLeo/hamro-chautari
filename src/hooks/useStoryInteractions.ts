import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useStoryInteractions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const reactToStory = useCallback(async (storyId: string, reactionType: string = 'like') => {
    if (!user) return;

    try {
      // Check if already reacted
      const { data: existingReaction } = await supabase
        .from('story_reactions')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('story_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
        return false; // unreacted
      } else {
        // Add reaction
        const { error } = await supabase
          .from('story_reactions')
          .insert({
            story_id: storyId,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (error) throw error;
        return true; // reacted
      }
    } catch (error: any) {
      console.error('Error reacting to story:', error);
      toast({
        title: "Error",
        description: "Failed to react to story",
        variant: "destructive"
      });
    }
  }, [user]);

  const commentOnStory = useCallback(async (storyId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('story_comments')
        .insert({
          story_id: storyId,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment added successfully"
      });

      return data;
    } catch (error: any) {
      console.error('Error commenting on story:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const shareStory = useCallback(async (storyId: string) => {
    if (!user) return;

    try {
      // Check if already shared
      const { data: existingShare } = await supabase
        .from('story_shares')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingShare) {
        toast({
          title: "Already shared",
          description: "You have already shared this story"
        });
        return;
      }

      // Record share
      const { error } = await supabase
        .from('story_shares')
        .insert({
          story_id: storyId,
          user_id: user.id
        });

      if (error) throw error;

      // Increment shares count
      const { error: incrementError } = await supabase.rpc('increment_story_shares', { story_id: storyId });
      
      if (incrementError) {
        console.error('Error incrementing shares count:', incrementError);
      }

      toast({
        title: "Success",
        description: "Story shared successfully"
      });

      return true;
    } catch (error: any) {
      console.error('Error sharing story:', error);
      toast({
        title: "Error",
        description: "Failed to share story",
        variant: "destructive"
      });
    }
  }, [user]);

  const getStoryComments = useCallback(async (storyId: string) => {
    try {
      const { data, error } = await supabase
        .from('story_comments')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching story comments:', error);
      return [];
    }
  }, []);

  const getStoryReactions = useCallback(async (storyId: string) => {
    try {
      const { data, error } = await supabase
        .from('story_reactions')
        .select('*')
        .eq('story_id', storyId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching story reactions:', error);
      return [];
    }
  }, []);

  return {
    reactToStory,
    commentOnStory,
    shareStory,
    getStoryComments,
    getStoryReactions,
    loading
  };
};