import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import CreatePost from '@/components/Feed/CreatePost';
import PostCard from '@/components/Feed/PostCard';
import PostSuggestions from '@/components/AI/PostSuggestions';
import MoodMatcher from '@/components/MoodMatching/MoodMatcher';
import CallManager from '@/components/Calling/CallManager';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { createUserProfile } from '@/utils/createSampleData';
import { useEffect } from 'react';


const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { posts, loading: postsLoading, refetch } = usePosts();

  // Initialize user profile when user logs in
  useEffect(() => {
    if (user) {
      const initializeProfile = async () => {
        await createUserProfile(user.id, user.email || '');
      };
      initializeProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <CallManager />
      
      <main className="max-w-6xl mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Feed - Takes 3 columns on large screens */}
          <div className="lg:col-span-3 space-y-6">
            <div className="animate-fade-in">
              <CreatePost />
            </div>
            
            <div className="space-y-6">
              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No posts yet. Create the first post!</p>
                </div>
              ) : (
                posts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PostCard 
                      post={{
                        ...post,
                        user: {
                          name: post.profiles?.display_name || post.profiles?.username || 'Unknown User',
                          username: post.profiles?.username || 'unknown',
                          avatar: post.profiles?.avatar_url,
                          isVerified: post.profiles?.is_verified || false
                        },
                        timestamp: post.created_at,
                        likes: post.likes_count,
                        comments: post.comments_count,
                        shares: post.shares_count,
                        mood: post.mood_tag,
                        images: post.media_urls || []
                      }}
                      onEdit={(postId) => {
                        console.log('Edit post:', postId);
                        toast({
                          title: "Edit Feature",
                          description: "Post editing will be available soon!"
                        });
                      }}
                      onDelete={async (postId) => {
                        console.log('Delete post:', postId);
                        toast({
                          title: "Delete Feature", 
                          description: "Post deletion will be available soon!"
                        });
                        refetch();
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Takes 1 column on large screens, full width on mobile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <PostSuggestions />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <MoodMatcher />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
