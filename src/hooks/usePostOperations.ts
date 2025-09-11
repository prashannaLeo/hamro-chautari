import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const BACKEND_URL = 'http://localhost:5000';

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
    shared_post_id?: string;
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
          shared_post_id: postData.shared_post_id,
          post_type: postData.media_urls?.length ? 'media' : (postData.shared_post_id ? 'shared' : 'text')
        })
        .select()
        .single();

      if (error) throw error;

      // Sync with Express backend
      try {
        await fetch(`${BACKEND_URL}/api/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabasePostId: data.id,
            userId: user.id,
            content: postData.content,
            visibility: postData.visibility,
            mood: postData.mood === 'none' ? null : postData.mood,
            location: postData.location,
            mediaUrls: postData.media_urls || [],
            postType: postData.media_urls?.length ? 'media' : 'text'
          }),
        });
      } catch (backendError) {
        console.error('Backend sync error:', backendError);
        // Don't throw - Supabase creation was successful
      }

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
        .maybeSingle();

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Decrement likes count using RPC function
        const { error: decrementError } = await supabase.rpc('decrement_likes', { post_id: postId });
        
        if (decrementError) {
          console.error('Error decrementing like count:', decrementError);
          throw decrementError;
        }

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

        // Increment likes count using RPC function
        const { error: incrementError } = await supabase.rpc('increment_likes', { post_id: postId });
        
        if (incrementError) {
          console.error('Error incrementing like count:', incrementError);
          throw incrementError;
        }

        // Create notification for post owner
        const { data: postData } = await supabase
          .from('posts')
          .select('user_id, content')
          .eq('id', postId)
          .single();

        if (postData && postData.user_id !== user.id) {
          // Get liker profile
          const { data: likerProfile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', user.id)
            .single();

          const postTitle = postData.content?.slice(0, 30) + (postData.content?.length > 30 ? '...' : '') || 'your post';
          const likerName = likerProfile?.display_name || likerProfile?.username || 'Someone';

          await supabase
            .from('notifications')
            .insert({
              user_id: postData.user_id,
              type: 'like',
              title: 'New Like',
              message: `${likerName} liked "${postTitle}"`,
              data: { post_id: postId, post_title: postTitle }
            });
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