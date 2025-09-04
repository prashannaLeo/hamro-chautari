import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PostData {
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
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

export const usePostData = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id(
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setPosts(data as PostData[] || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePostCounts = (postId: string, updates: { likes?: number; comments?: number }) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes_count: updates.likes ?? post.likes_count,
            comments_count: updates.comments ?? post.comments_count
          }
        : post
    ));
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time updates for posts
    const subscription = supabase
      .channel('posts-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'posts'
        }, 
        (payload) => {
          console.log('Post updated:', payload);
          // Update specific post in the list
          setPosts(prev => prev.map(post => 
            post.id === payload.new.id 
              ? { ...post, ...payload.new }
              : post
          ));
        }
      )
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'posts'
        }, 
        (payload) => {
          console.log('New post:', payload);
          fetchPosts(); // Refetch to get profile data
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    posts,
    loading,
    updatePostCounts,
    refetch: fetchPosts
  };
};