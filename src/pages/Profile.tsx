import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
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
  const [isOwnProfile] = useState(true); // For now, always show own profile

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20 sm:pb-6">
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
                  <AvatarImage src={mockProfile.avatar} alt={mockProfile.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {mockProfile.name.charAt(0)}
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
                      <h1 className="text-2xl font-bold">{mockProfile.name}</h1>
                      {mockProfile.isVerified && (
                        <Badge variant="secondary" className="h-5 px-2">✓</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">@{mockProfile.username}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    {isOwnProfile ? (
                      <Button variant="outline">
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
                    <div className="text-xl font-bold">{mockProfile.stats.posts}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{mockProfile.stats.friends}</div>
                    <div className="text-xs text-muted-foreground">Friends</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{mockProfile.stats.followers}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{mockProfile.stats.following}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio and Details */}
            <div className="mt-6 space-y-3">
              {mockProfile.mood && (
                <Badge variant="outline" className="w-fit">
                  {getMoodEmoji(mockProfile.mood)} Feeling {mockProfile.mood}
                </Badge>
              )}
              
              <p className="text-sm leading-relaxed">{mockProfile.bio}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{mockProfile.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(mockProfile.joinedDate)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="media">
              <Camera className="w-4 h-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger value="friends">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Bookmark className="w-4 h-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
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
      </div>
    </div>
  );
};

export default Profile;