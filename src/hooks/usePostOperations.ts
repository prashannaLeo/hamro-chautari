import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  post_type: string;
  visibility: string;
  mood_tag: string | null;
  location: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
}

export const usePostOperations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createPost = async (postData: {
    content: string;
    visibility: string;
    mood?: string;
    location?: string;
    media_urls?: string[];
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          visibility: postData.visibility,
          mood_tag: postData.mood === 'none' ? null : postData.mood,
          location: postData.location,
          media_urls: postData.media_urls,
          post_type: postData.media_urls?.length ? 'media' : 'text'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!"
      });

      return data;
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Decrement likes count
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: supabase.rpc('increment', { x: -1 }) })
          .eq('id', postId);

        if (updateError) throw updateError;

        return false; // unliked
      } else {
        // Like
        const { error: insertError } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (insertError) throw insertError;

        // Increment likes count
        const { error: updateError } = await supabase.rpc('increment_likes', { post_id: postId });
        if (updateError) {
          // Fallback to manual increment
          const { error: manualUpdateError } = await supabase
            .from('posts')
            .update({ likes_count: supabase.rpc('increment', { x: 1 }) })
            .eq('id', postId);
          
          if (manualUpdateError) throw manualUpdateError;
        }

        return true; // liked
      }
    } catch (err: any) {
      console.error('Error toggling like:', err);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully"
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    createPost,
    likePost,
    deletePost,
    loading
  };
};