import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  UserX, 
  MessageCircle,
  MoreHorizontal,
  Users,
  Heart,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockFriends = [
  {
    id: '1',
    name: 'Priya Sharma',
    username: 'priya_sharma',
    avatar: '',
    bio: 'Adventure seeker and mountain lover from Kathmandu',
    location: 'Kathmandu, Nepal',
    mutualFriends: 5,
    isOnline: true,
    mood: 'happy',
    status: 'friend'
  },
  {
    id: '2',
    name: 'Arjun Thapa',
    username: 'arjun_thapa',
    avatar: '',
    bio: 'Professional trekker and photographer',
    location: 'Pokhara, Nepal',
    mutualFriends: 12,
    isOnline: false,
    mood: 'adventurous',
    status: 'friend'
  },
  {
    id: '3',
    name: 'Sita Rai',
    username: 'sita_rai',
    avatar: '',
    bio: 'Traditional dance instructor and cultural enthusiast',
    location: 'Lalitpur, Nepal',
    mutualFriends: 8,
    isOnline: true,
    mood: 'creative',
    status: 'friend'
  },
];

const mockRequests = [
  {
    id: '4',
    name: 'Bikash Gurung',
    username: 'bikash_gurung',
    avatar: '',
    bio: 'Travel blogger exploring Nepal',
    location: 'Chitwan, Nepal',
    mutualFriends: 3,
    requestedAt: '2 days ago',
    status: 'pending'
  },
  {
    id: '5',
    name: 'Nisha Shrestha',
    username: 'nisha_shrestha',
    avatar: '',
    bio: 'Food lover and chef',
    location: 'Bhaktapur, Nepal',
    mutualFriends: 7,
    requestedAt: '1 week ago',
    status: 'pending'
  },
];

const mockSuggestions = [
  {
    id: '6',
    name: 'Ramesh Magar',
    username: 'ramesh_magar',
    avatar: '',
    bio: 'Nature photographer',
    location: 'Mustang, Nepal',
    mutualFriends: 15,
    reason: 'Works at Mountain Photography',
    status: 'suggested'
  },
  {
    id: '7',
    name: 'Sunita Tamang',
    username: 'sunita_tamang',
    avatar: '',
    bio: 'Yoga instructor and wellness coach',
    location: 'Kathmandu, Nepal',
    mutualFriends: 9,
    reason: 'Friends with Priya Sharma',
    status: 'suggested'
  },
  {
    id: '8',
    name: 'Dipak Thakuri',
    username: 'dipak_thakuri',
    avatar: '',
    bio: 'Software engineer and tech enthusiast',
    location: 'Kathmandu, Nepal',
    mutualFriends: 4,
    reason: 'From your contacts',
    status: 'suggested'
  },
];

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

const Friends = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleAcceptRequest = (friendId: string) => {
    // TODO: Implement accept friend request
    console.log('Accepting friend request:', friendId);
  };

  const handleDeclineRequest = (friendId: string) => {
    // TODO: Implement decline friend request
    console.log('Declining friend request:', friendId);
  };

  const handleSendRequest = (userId: string) => {
    // TODO: Implement send friend request
    console.log('Sending friend request:', userId);
  };

  const filteredFriends = mockFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Friends</h1>
          <p className="text-gray-600 text-lg">Connect with people in your community</p>
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="friends" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Friends ({mockFriends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Requests ({mockRequests.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Heart className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Friends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.map((friend) => (
                <Card key={friend.id} className="hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={friend.avatar} alt={friend.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {friend.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {friend.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{friend.name}</h3>
                          <p className="text-sm text-muted-foreground">@{friend.username}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Unfriend</DropdownMenuItem>
                          <DropdownMenuItem>Block</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {friend.mood && (
                      <Badge variant="outline" className="mb-2">
                        {getMoodEmoji(friend.mood)} {friend.mood}
                      </Badge>
                    )}

                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {friend.bio}
                    </p>

                    <div className="flex items-center text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{friend.location}</span>
                    </div>

                    <div className="text-xs text-muted-foreground mb-4">
                      {friend.mutualFriends} mutual friends
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserCheck className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.avatar} alt={request.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {request.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{request.name}</h3>
                        <p className="text-sm text-muted-foreground">@{request.username}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {request.bio}
                    </p>

                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{request.location}</span>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      {request.mutualFriends} mutual friends
                    </div>

                    <div className="text-xs text-muted-foreground mb-4">
                      Requested {request.requestedAt}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {suggestion.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{suggestion.name}</h3>
                        <p className="text-sm text-muted-foreground">@{suggestion.username}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {suggestion.bio}
                    </p>

                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{suggestion.location}</span>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      {suggestion.mutualFriends} mutual friends
                    </div>

                    <div className="text-xs text-primary mb-4">
                      {suggestion.reason}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleSendRequest(suggestion.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add Friend
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Friends;