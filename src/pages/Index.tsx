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
import { createSamplePosts, createUserProfile } from '@/utils/createSampleData';
import { useEffect } from 'react';

const mockPosts = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    user: {
      name: 'Priya Sharma',
      username: 'priya_sharma',
      avatar: '',
      isVerified: true,
    },
    content: 'Beautiful sunrise this morning in Kathmandu! The mountains looked absolutely stunning. Feeling grateful for another day in this amazing city. 🏔️☀️ #KathmanduMorning #Nepal',
    mood: 'grateful',
    location: 'Kathmandu, Nepal',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    likes: 24,
    comments: 5,
    shares: 2,
    isLiked: false,
  },
  {
    id: 'b2c3d4e5-f6g7-8901-2345-67890abcdef1',
    user: {
      name: 'Arjun Thapa',
      username: 'arjun_thapa',
      avatar: '',
    },
    content: 'Just finished an amazing trek to Annapurna Base Camp! The journey was challenging but absolutely worth it. Met some incredible people along the way and created memories that will last a lifetime.',
    mood: 'adventurous',
    location: 'Annapurna Base Camp',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    likes: 45,
    comments: 12,
    shares: 8,
    isLiked: true,
  },
  {
    id: 'c3d4e5f6-g7h8-9012-3456-7890abcdef12',
    user: {
      name: 'Sita Rai',
      username: 'sita_rai',
      avatar: '',
    },
    content: 'Spending the evening learning traditional Nepali dance. Culture is so important to preserve and pass on to the next generation. Anyone else passionate about keeping our traditions alive?',
    mood: 'creative',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    likes: 18,
    comments: 7,
    shares: 3,
    isLiked: false,
  },
];

const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Initialize sample data when user logs in
  useEffect(() => {
    if (user) {
      const initializeData = async () => {
        console.log('Initializing sample data for user:', user.email);
        
        // Create user profile
        await createUserProfile(user.id, user.email || '');
        
        // Create sample posts
        await createSamplePosts(user.id);
        
        toast({
          title: "Welcome!",
          description: "Sample posts created. You can now test commenting functionality!",
        });
      };

      initializeData();
    }
  }, [user, toast]);

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
              {mockPosts.map((post, index) => (
                <div 
                  key={post.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PostCard 
                    post={{
                      ...post,
                      user_id: user?.email === 'priya.sharma@example.com' && post.user.username === 'priya_sharma' ? user.id : undefined
                    }}
                    onEdit={(postId) => {
                      console.log('Edit post:', postId);
                      toast({
                        title: "Edit Feature",
                        description: "Post editing will be available soon!"
                      });
                    }}
                    onDelete={(postId) => {
                      console.log('Delete post:', postId);
                      toast({
                        title: "Delete Feature", 
                        description: "Post deletion will be available soon!"
                      });
                    }}
                  />
                </div>
              ))}
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
