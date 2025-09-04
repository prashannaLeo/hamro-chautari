import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  reply_to?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name?: string;
    username: string;
    avatar_url?: string;
  };
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profile:profiles!comments_user_id_fkey(
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load comments"
        });
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error in fetchComments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, replyTo?: string) => {
    if (!user || !content.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          reply_to: replyTo || null
        })
        .select(`
          *,
          user_profile:profiles!comments_user_id_fkey(
            display_name,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add comment"
        });
        return;
      }

      setComments(prev => [...prev, data]);

      // Create notification for post owner
      const { data: postData } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (postData && postData.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: postData.user_id,
            type: 'comment',
            title: 'New Comment',
            message: `${user.email?.split('@')[0]} commented on your post`,
            data: { post_id: postId, comment_id: data.id }
          });
      }

      toast({
        variant: "success",
        title: "Success",
        description: "Comment added successfully"
      });
    } catch (error) {
      console.error('Error in addComment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment"
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting comment:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete comment"
        });
        return;
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        variant: "success",
        title: "Success",
        description: "Comment deleted successfully"
      });
    } catch (error) {
      console.error('Error in deleteComment:', error);
    }
  };

  const likeComment = async (commentId: string) => {
    // TODO: Implement comment liking functionality
    console.log('Like comment:', commentId);
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'comments',
          filter: `post_id=eq.${postId}`
        }, 
        (payload) => {
          console.log('New comment:', payload);
          fetchComments(); // Refetch to get user profile data
        }
      )
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'comments',
          filter: `post_id=eq.${postId}`
        }, 
        (payload) => {
          console.log('Comment deleted:', payload);
          setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    likeComment,
    refetch: fetchComments
  };
};