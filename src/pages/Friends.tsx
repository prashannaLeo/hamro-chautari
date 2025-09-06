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
import { useFriends } from '@/hooks/useFriends';
import { useMessages } from '@/hooks/useMessages';
import { useCalling } from '@/hooks/useCalling';
import { useUserSearch } from '@/hooks/useUserSearch';
import EnhancedSearch from '@/components/Friends/EnhancedSearch';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  UserX, 
  MessageCircle,
  MoreHorizontal,
  Users,
  Heart,
  MapPin,
  Phone,
  Video
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


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
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const { 
    friends, 
    friendRequests, 
    sentRequests, 
    loading: friendsLoading,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    sendFriendRequest
  } = useFriends();
  const { createChat } = useMessages();
  const { initiateCall } = useCalling();
  const { searchResults, loading: searchLoading, searchUsers } = useUserSearch();

  if (loading || friendsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleAcceptRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
  };

  const handleDeclineRequest = async (requestId: string) => {
    await declineFriendRequest(requestId);
  };

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
    // Refresh search to remove the user from results
    if (userSearchQuery.trim()) {
      searchUsers(userSearchQuery);
    }
  };

  const handleUserSearch = (query: string) => {
    setUserSearchQuery(query);
    if (query.trim()) {
      searchUsers(query);
    } else {
      // Clear results when search is empty
      searchUsers('');
    }
  };

  const handleMessage = async (friend: any) => {
    try {
      const chat = await createChat([friend.connected_user_id], 'direct');
      if (chat) {
        toast({
          title: "Success",
          description: `Chat created with ${friend.profiles?.display_name || friend.profiles?.username}`
        });
        // Navigate to messages page
        window.location.href = '/messages';
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create chat",
        variant: "destructive"
      });
    }
  };

  const handleVideoCall = (friend: any) => {
    initiateCall(
      friend.profiles?.id || friend.id,
      friend.profiles?.display_name || friend.profiles?.username || friend.name,
      'video',
      friend.profiles?.avatar_url
    );
  };

  const handleVoiceCall = (friend: any) => {
    initiateCall(
      friend.profiles?.id || friend.id,
      friend.profiles?.display_name || friend.profiles?.username || friend.name,
      'voice',
      friend.profiles?.avatar_url
    );
  };

  const handleRemoveFriend = async (connectionId: string, friendName: string) => {
    if (window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      await removeFriend(connectionId);
    }
  };

  const filteredFriends = friends.filter(friend =>
    (friend.profiles?.display_name || friend.profiles?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
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
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="friends" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="w-4 h-4 mr-2" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Requests ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Heart className="w-4 h-4 mr-2" />
              Sent ({sentRequests.length})
            </TabsTrigger>
            <TabsTrigger value="discover" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Search className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {/* Enhanced Search */}
            <EnhancedSearch
              placeholder="Search friends by name or initials..."
              onUserSelect={(user) => {
                console.log('Selected user:', user);
                // You can add logic here to navigate to user profile or send friend request
              }}
              onPostSelect={(post) => {
                console.log('Selected post:', post);
                // You can add logic here to navigate to the post
              }}
              className="mb-8"
            />

            {/* Friends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No friends yet</h3>
                  <p className="text-muted-foreground">Start connecting with people in your community!</p>
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <Card key={friend.id} className="hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={friend.profiles?.avatar_url || ''} alt={friend.profiles?.display_name || friend.profiles?.username} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {(friend.profiles?.display_name || friend.profiles?.username)?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{friend.profiles?.display_name || friend.profiles?.username}</h3>
                            <p className="text-sm text-muted-foreground">@{friend.profiles?.username}</p>
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
                            <DropdownMenuItem 
                              onClick={() => handleRemoveFriend(friend.id, friend.profiles?.display_name || friend.profiles?.username || 'User')}
                            >
                              Unfriend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {friend.profiles?.mood && (
                        <Badge variant="outline" className="mb-2">
                          {getMoodEmoji(friend.profiles.mood)} {friend.profiles.mood}
                        </Badge>
                      )}

                      {friend.profiles?.bio && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {friend.profiles.bio}
                        </p>
                      )}

                      <div className="flex space-x-1 mb-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleMessage(friend)}
                          className="flex-1 hover:bg-primary hover:text-primary-foreground"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVoiceCall(friend)}
                          className="hover:bg-green-500 hover:text-white"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVideoCall(friend)}
                          className="hover:bg-blue-500 hover:text-white"
                        >
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendRequests.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No friend requests</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                friendRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.profiles?.avatar_url || ''} alt={request.profiles?.display_name || request.profiles?.username} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {(request.profiles?.display_name || request.profiles?.username)?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{request.profiles?.display_name || request.profiles?.username}</h3>
                          <p className="text-sm text-muted-foreground">@{request.profiles?.username}</p>
                        </div>
                      </div>

                      {request.profiles?.bio && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {request.profiles.bio}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground mb-4">
                        Friend request received
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
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentRequests.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sent requests</h3>
                  <p className="text-muted-foreground">Send friend requests to connect with people!</p>
                </div>
              ) : (
                sentRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.profiles?.avatar_url || ''} alt={request.profiles?.display_name || request.profiles?.username} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {(request.profiles?.display_name || request.profiles?.username)?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{request.profiles?.display_name || request.profiles?.username}</h3>
                          <p className="text-sm text-muted-foreground">@{request.profiles?.username}</p>
                        </div>
                      </div>

                      {request.profiles?.bio && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {request.profiles.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-center py-4">
                        <Badge variant="outline">Request Sent</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            {/* Enhanced User Search */}
            <EnhancedSearch
              placeholder="Search for users to add as friends or explore posts..."
              onUserSelect={(user) => {
                // Open user profile or show add friend option
                console.log('Selected user for friend request:', user);
              }}
              onPostSelect={(post) => {
                // Navigate to post or show post details
                console.log('Selected post:', post);
              }}
              className="mb-8"
            />

            {/* Search Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Searching...</p>
                </div>
              ) : searchResults.length === 0 && userSearchQuery.trim() ? (
                <div className="col-span-full text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No users found</h3>
                  <p className="text-muted-foreground">Try searching with a different username or name</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Discover New Friends</h3>
                  <p className="text-muted-foreground">Search for users by username or name to send friend requests</p>
                </div>
              ) : (
                searchResults.map((user) => (
                  <Card key={user.id} className="hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || ''} alt={user.display_name || user.username} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {(user.display_name || user.username)?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{user.display_name || user.username}</h3>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>

                      {user.mood && (
                        <Badge variant="outline" className="mb-2">
                          {getMoodEmoji(user.mood)} {user.mood}
                        </Badge>
                      )}

                      {user.bio && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {user.bio}
                        </p>
                      )}

                      {user.location && (
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <MapPin className="w-4 h-4 mr-1" />
                          {user.location}
                        </div>
                      )}

                      <Button 
                        className="w-full"
                        onClick={() => handleSendRequest(user.user_id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Send Friend Request
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Friends;