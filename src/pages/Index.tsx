import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import CreatePost from '@/components/Feed/CreatePost';
import PostCard from '@/components/Feed/PostCard';
import PostSuggestions from '@/components/AI/PostSuggestions';
import MoodMatcher from '@/components/MoodMatching/MoodMatcher';
import CallManager from '@/components/Calling/CallManager';

const mockPosts = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
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
                      user_id: user?.id === post.user.username ? user.id : 'other-user-id'
                    }}
                    onEdit={(postId) => {
                      console.log('Edit post:', postId);
                      // TODO: Implement edit functionality
                    }}
                    onDelete={(postId) => {
                      console.log('Delete post:', postId);
                      // TODO: Implement delete functionality
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
