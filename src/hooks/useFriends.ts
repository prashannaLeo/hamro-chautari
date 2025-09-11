import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  connection_type: string;
  created_at: string;
}

export interface FriendWithProfile extends Connection {
  profiles: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    mood: string | null;
    location?: string;
  };
}

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConnections();
      
      // Set up real-time subscription for connections
      const channel = supabase
        .channel(`connections-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchConnections();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `connected_user_id=eq.${user.id}`
        }, () => {
          fetchConnections();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch accepted friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_connected_user_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Fetch incoming friend requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_user_id_fkey(*)
        `)
        .eq('connected_user_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Fetch sent requests
      const { data: sentData, error: sentError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_connected_user_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      setFriends(friendsData as FriendWithProfile[] || []);
      setFriendRequests(requestsData as FriendWithProfile[] || []);
      setSentRequests(sentData as FriendWithProfile[] || []);

    } catch (err: any) {
      console.error('Error fetching connections:', err);
      toast({
        title: "Error",
        description: "Failed to fetch connections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return;

    try {
      // Check if connection already exists
      const { data: existing } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user_id.eq.${user.id},connected_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},connected_user_id.eq.${user.id})`)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Info",
          description: "Connection already exists",
          variant: "default"
        });
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: targetUserId,
          status: 'pending',
          connection_type: 'friend'
        });

      if (error) throw error;

      // Get sender profile for notification
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('user_id', user.id)
        .single();

      // Create notification for the target user
      await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type: 'friend_request',
          title: 'New Friend Request',
          message: `${senderProfile?.display_name || senderProfile?.username || 'Someone'} sent you a friend request`,
          data: { from_user_id: user.id, from_username: senderProfile?.username }
        });

      toast({
        title: "Success",
        description: "Friend request sent!"
      });

      fetchConnections();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend request accepted!"
      });

      fetchConnections();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive"
      });
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend request declined"
      });

      fetchConnections();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive"
      });
    }
  };

  const removeFriend = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend removed"
      });

      fetchConnections();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive"
      });
    }
  };

  return {
    friends,
    friendRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refetch: fetchConnections
  };
};