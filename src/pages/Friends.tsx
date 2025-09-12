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
import { useCallingContext } from '@/contexts/CallingContext';
import { useUserSearch } from '@/hooks/useUserSearch';
import EnhancedSearch from '@/components/Friends/EnhancedSearch';
import { toast } from 'sonner';
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
  Video,
  Loader2,
  Check,
  X
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
    sad: '😢',
    stressed: '😰',
    focused: '🎯',
    neutral: '😐'
  };
  return moodEmojis[mood] || '😐';
};

const Friends = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
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
  const { initiateCall } = useCallingContext();
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

  const handleAcceptRequest = async (requestId: string, senderName: string) => {
    setActionLoading(requestId);
    try {
      await acceptFriendRequest(requestId);
      toast.success(`You are now friends with ${senderName}`);
    } catch (error) {
      toast.error('Failed to accept friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await declineFriendRequest(requestId);
      toast.success('Friend request declined');
    } catch (error) {
      toast.error('Failed to decline friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendRequest = async (userId: string, userName: string) => {
    setActionLoading(userId);
    try {
      await sendFriendRequest(userId);
      toast.success(`Friend request sent to ${userName}`);
      // Refresh search to remove the user from results
      if (userSearchQuery.trim()) {
        searchUsers(userSearchQuery);
      }
    } catch (error) {
      toast.error('Failed to send friend request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserSearch = (query: string) => {
    setUserSearchQuery(query);
    if (query.trim()) {
      searchUsers(query);
    }
  };

  const handleMessage = async (friend: any) => {
    try {
      const chat = await createChat([friend.connected_user_id], 'direct');
      if (chat) {
        toast.success(`Chat started with ${friend.profiles?.display_name || friend.profiles?.username}`);
        // Navigate to messages page
        window.location.href = '/messages';
      }
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const handleVideoCall = (friend: any) => {
    initiateCall(friend.connected_user_id, friend.profiles?.display_name || friend.profiles?.username || 'Unknown', 'video', friend.profiles?.avatar_url);
    toast.success(`Starting video call with ${friend.profiles?.display_name || friend.profiles?.username}`);
  };

  const handleVoiceCall = (friend: any) => {
    initiateCall(friend.connected_user_id, friend.profiles?.display_name || friend.profiles?.username || 'Unknown', 'voice', friend.profiles?.avatar_url);
    toast.success(`Starting voice call with ${friend.profiles?.display_name || friend.profiles?.username}`);
  };

  const handleRemoveFriend = async (connectionId: string, friendName: string) => {
    setActionLoading(connectionId);
    try {
      await removeFriend(connectionId);
      toast.success(`Removed ${friendName} from friends`);
    } catch (error) {
      toast.error('Failed to remove friend');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSentRequest = async (connectionId: string, userName: string) => {
    setActionLoading(connectionId);
    try {
      await removeFriend(connectionId);
      toast.success(`Cancelled request to ${userName}`);
    } catch (error) {
      toast.error('Failed to cancel request');
    } finally {
      setActionLoading(null);
    }
  };
  // Handle user selection from EnhancedSearch
  const handleUserSelect = (selectedUser: any) => {
    handleSendRequest(selectedUser.user_id || selectedUser.id, selectedUser.display_name || selectedUser.username);
  };

  // Test calling functionality - initiate a call to yourself for testing
  const handleTestCall = (type: 'voice' | 'video') => {
    if (user) {
      initiateCall(
        user.id,
        'Test User',
        type,
        undefined
      );
      toast.success(`${type} call test started`);
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
          <p className="text-gray-600 text-lg mb-4">Connect with people in your community</p>
          
          {/* Test Call Buttons */}
          <div className="flex gap-3 mb-4">
            <Button
              onClick={() => handleTestCall('voice')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Test Voice Call
            </Button>
            <Button
              onClick={() => handleTestCall('video')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Test Video Call
            </Button>
          </div>
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
            {/* Friend Search (enhanced with suggestions) */}
            <EnhancedSearch
              placeholder="Search people and send friend requests..."
              onUserSelect={handleUserSelect}
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
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={friend.profiles?.avatar_url || ''} alt={friend.profiles?.display_name || friend.profiles?.username} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {(friend.profiles?.display_name || friend.profiles?.username)?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
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
                          onClick={() => handleAcceptRequest(request.id, request.profiles?.display_name || request.profiles?.username || 'Unknown')}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeclineRequest(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          <X className="w-4 h-4" />
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

                      <div className="flex items-center justify-between py-4">
                        <Badge variant="outline" className="mr-3">Request Sent</Badge>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelSentRequest(request.id, request.profiles?.display_name || request.profiles?.username || 'User')}
                          disabled={actionLoading === request.id}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </>
                          )}
                        </Button>
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
              placeholder="Search for users to add as friends..."
              onUserSelect={handleUserSelect}
              className="mb-8"
            />
            
            {/* Search Results */}
            <div className="space-y-4">
              {userSearchQuery.trim().length > 2 && (
                <>
                  <h3 className="text-lg font-semibold">Search Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchLoading ? (
                      <div className="col-span-full text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-4">Searching...</p>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No users found</h3>
                        <p className="text-muted-foreground">Try searching for a different name or username</p>
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
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {user.bio}
                              </p>
                            )}

                            {user.location && (
                              <div className="flex items-center text-xs text-muted-foreground mb-3">
                                <MapPin className="w-3 h-3 mr-1" />
                                {user.location}
                              </div>
                            )}

                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleSendRequest(user.user_id || user.id, user.display_name || user.username)}
                              disabled={actionLoading === (user.user_id || user.id)}
                            >
                              {actionLoading === (user.user_id || user.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Add Friend
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}
              
              {!userSearchQuery.trim() && (
                <div className="text-center py-16">
                  <Search className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-50" />
                  <h3 className="text-xl font-medium mb-3">Discover New Friends</h3>
                  <p className="text-muted-foreground text-lg">
                    Use the search above to find people you'd like to connect with
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Friends;