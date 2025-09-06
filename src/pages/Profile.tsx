import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import EditProfileDialog from '@/components/Profile/EditProfileDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/Feed/PostCard';
import { 
  Settings, 
  MessageCircle, 
  UserPlus, 
  MapPin, 
  Calendar,
  Edit,
  Heart,
  Users,
  Camera,
  Grid3X3,
  Bookmark
} from 'lucide-react';

const mockProfile = {
  id: '1',
  name: 'Your Name',
  username: 'your_username',
  email: 'you@example.com',
  bio: 'Adventure seeker and mountain lover from Nepal. Always looking for the next great trek! 🏔️',
  location: 'Kathmandu, Nepal',
  joinedDate: '2023-01-15',
  avatar: '',
  coverImage: '',
  isVerified: false,
  mood: 'adventurous',
  stats: {
    posts: 42,
    friends: 156,
    followers: 89,
    following: 134
  }
};

const mockPosts = [
  {
    id: '1',
    user: {
      name: 'Your Name',
      username: 'your_username',
      avatar: '',
    },
    content: 'Just completed an amazing sunrise hike to Nagarkot! The views of the Himalayas were absolutely breathtaking. There\'s nothing quite like watching the sun rise over the world\'s highest peaks. 🏔️☀️',
    mood: 'grateful',
    location: 'Nagarkot, Nepal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    likes: 28,
    comments: 12,
    shares: 5,
    isLiked: false,
  },
  {
    id: '2',
    user: {
      name: 'Your Name',
      username: 'your_username',
      avatar: '',
    },
    content: 'Learning traditional Newari cuisine from my grandmother today. The recipes passed down through generations are truly precious. Food is culture! 🍜',
    mood: 'happy',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    likes: 34,
    comments: 8,
    shares: 3,
    isLiked: true,
  },
];

const Profile = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { posts, loading: postsLoading } = usePosts();
  const [isOwnProfile] = useState(true); // For now, always show own profile
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '😊',
      excited: '🎉',
      grateful: '🙏',
      adventurous: '🏔️',
      peaceful: '🧘',
      creative: '🎨',
    };
    return moodEmojis[mood] || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-20 sm:pb-8">
        {/* Cover Photo */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 relative">
            {mockProfile.coverImage ? (
              <img 
                src={mockProfile.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {isOwnProfile && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute bottom-4 right-4"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit Cover
              </Button>
            )}
          </div>
          
          <CardContent className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 relative">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || profile?.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {(profile?.display_name || profile?.username || user?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-2xl font-bold">{profile?.display_name || profile?.username || 'Your Name'}</h1>
                      {profile?.is_verified && (
                        <Badge variant="secondary" className="h-5 px-2">✓</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">@{profile?.username || 'username'}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    {isOwnProfile ? (
                      <Button variant="outline" onClick={() => setEditProfileOpen(true)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Friend
                        </Button>
                        <Button variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">{posts?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Friends</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio and Details */}
            <div className="mt-6 space-y-3">
              {profile?.mood && (
                <Badge variant="outline" className="w-fit">
                  {getMoodEmoji(profile.mood)} Feeling {profile.mood}
                </Badge>
              )}
              
              {profile?.bio && (
                <p className="text-sm leading-relaxed">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile?.created_at || new Date().toISOString())}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl mb-8">
            <TabsTrigger value="posts" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="media" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Camera className="w-4 h-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger value="friends" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="saved" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bookmark className="w-4 h-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {postsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : posts && posts.length > 0 ? (
              posts.filter(post => post.user_id === user?.id).map((post) => {
                // Transform database post to PostCard format
                const transformedPost = {
                  id: post.id,
                  user_id: post.user_id,
                  user: {
                    name: profile?.display_name || profile?.username || 'User',
                    username: profile?.username || 'user',
                    avatar: profile?.avatar_url || '',
                    isVerified: profile?.is_verified || false
                  },
                  content: post.content || '',
                  images: post.media_urls || [],
                  mood: post.mood_tag || '',
                  location: post.location || '',
                  timestamp: post.created_at,
                  likes: post.likes_count || 0,
                  comments: post.comments_count || 0,
                  shares: post.shares_count || 0,
                  isLiked: false // TODO: implement like status check
                };
                return <PostCard key={post.id} post={transformedPost} />;
              })
            ) : (
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-muted-foreground">Share your first post to get started!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Mock media grid */}
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="aspect-square overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                  <CardContent className="p-0 h-full bg-muted flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Mock friends grid */}
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      F{index + 1}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium text-sm mb-1">Friend {index + 1}</h3>
                  <p className="text-xs text-muted-foreground">@friend{index + 1}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No saved posts yet</h3>
              <p className="text-sm text-muted-foreground">
                Posts you save will appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <EditProfileDialog 
          open={editProfileOpen} 
          onOpenChange={setEditProfileOpen}
          profile={profile}
        />
      </main>
    </div>
  );
};

export default Profile;