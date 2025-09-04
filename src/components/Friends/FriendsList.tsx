import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useFriends } from '@/hooks/useFriends';
import { useCalling } from '@/hooks/useCalling';
import { 
  UserPlus, 
  UserMinus, 
  MessageCircle, 
  Video, 
  Phone,
  Check,
  X,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const FriendsList: React.FC = () => {
  const { 
    friends, 
    friendRequests, 
    sentRequests, 
    loading,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend
  } = useFriends();
  
  const { initiateCall, simulateIncomingCall } = useCalling();

  const handleVideoCall = (friend: any) => {
    initiateCall(
      friend.profiles.id,
      friend.profiles.display_name || friend.profiles.username,
      'video',
      friend.profiles.avatar_url
    );
  };

  const handleVoiceCall = (friend: any) => {
    initiateCall(
      friend.profiles.id,
      friend.profiles.display_name || friend.profiles.username,
      'voice',
      friend.profiles.avatar_url
    );
  };

  const handleMessage = (friend: any) => {
    toast({
      title: "Message",
      description: `Opening chat with ${friend.profiles.display_name || friend.profiles.username}`
    });
    // In a real app, this would navigate to the messages page
  };

  const handleRemoveFriend = async (connectionId: string, friendName: string) => {
    if (window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      await removeFriend(connectionId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Card className="border-border bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Friend Requests ({friendRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.profiles.avatar_url || ''} />
                    <AvatarFallback>
                      {(request.profiles.display_name || request.profiles.username).split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.profiles.display_name || request.profiles.username}</p>
                    <p className="text-sm text-muted-foreground">@{request.profiles.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptFriendRequest(request.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineFriendRequest(request.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card className="border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No friends yet</p>
              <p className="text-sm text-muted-foreground">Start connecting with people!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend.profiles.avatar_url || ''} />
                      <AvatarFallback>
                        {(friend.profiles.display_name || friend.profiles.username).split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.profiles.display_name || friend.profiles.username}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">@{friend.profiles.username}</p>
                        {friend.profiles.mood && (
                          <Badge variant="secondary" className="text-xs">
                            {friend.profiles.mood}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMessage(friend)}
                      className="hover:bg-primary hover:text-primary-foreground"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVoiceCall(friend)}
                      className="hover:bg-green-500 hover:text-white"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVideoCall(friend)}
                      className="hover:bg-blue-500 hover:text-white"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFriend(friend.id, friend.profiles.display_name || friend.profiles.username)}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Card className="border-border bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Sent Requests ({sentRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.profiles.avatar_url || ''} />
                    <AvatarFallback>
                      {(request.profiles.display_name || request.profiles.username).split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.profiles.display_name || request.profiles.username}</p>
                    <p className="text-sm text-muted-foreground">@{request.profiles.username}</p>
                  </div>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FriendsList;