import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import io, { Socket } from 'socket.io-client';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  message_type: string | null;
  media_url?: string | null;
  reply_to?: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
}

export interface Chat {
  id: string;
  type: string;
  name?: string | null;
  created_at: string;
  updated_at: string;
  chat_participants: Array<{
    user_id: string;
    role: string;
    profiles: {
      username: string;
      display_name?: string | null;
      avatar_url?: string | null;
    };
  }>;
  last_message?: Message;
}

const BACKEND_URL = 'http://localhost:5000';

export const useMessages = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => ({
        ...prev,
        [message.chat_id]: [...(prev[message.chat_id] || []), message]
      }));
    });

    newSocket.on('user_typing', (data: { chatId: string; userId: string; username: string }) => {
      // Handle typing indicator
      console.log('User typing:', data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Fetch user's chats
  const fetchChats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get chats from Supabase
      const { data: chatParticipants, error } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          chats!inner (
            id,
            type,
            name,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Get chat details with participants
      const chatIds = chatParticipants?.map(cp => cp.chat_id) || [];
      
      if (chatIds.length > 0) {
        const { data: chatsWithParticipants, error: chatsError } = await supabase
          .from('chats')
          .select(`
            *,
            chat_participants!inner (
              user_id,
              role,
              profiles!inner (
                username,
                display_name,
                avatar_url
              )
            )
          `)
          .in('id', chatIds);

        if (chatsError) throw chatsError;

        setChats(chatsWithParticipants as Chat[] || []);
      }
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a specific chat
  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [chatId]: (data as Message[]) || []
      }));

      // Join socket room for this chat
      if (socket) {
        socket.emit('join_chat', chatId);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  }, [socket]);

  // Send message
  const sendMessage = useCallback(async (chatId: string, content: string, messageType: string = 'text') => {
    if (!user || !content.trim()) return;

    try {
      setSendingMessage(true);

      // Insert message into Supabase
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType
        })
        .select(`
          *,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Send via socket for real-time delivery
      if (socket && data) {
        socket.emit('send_message', data);
      }

      // Also send to Express backend for MongoDB sync
      try {
        await fetch(`${BACKEND_URL}/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: data.id,
            senderId: user.id,
            content: content.trim(),
            messageType,
            createdAt: data.created_at
          }),
        });
      } catch (backendError) {
        console.error('Backend sync error:', backendError);
        // Don't throw - Supabase message was successful
      }

      return data as Message;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSendingMessage(false);
    }
  }, [user, socket]);

  // Create new chat
  const createChat = useCallback(async (participantIds: string[], chatType: string = 'direct', chatName?: string) => {
    if (!user) return;

    try {
      // Create chat in Supabase
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: chatType,
          name: chatName,
          created_by: user.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add participants
      const participants = [user.id, ...participantIds].map(userId => ({
        chat_id: chat.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member'
      }));

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      // Refresh chats
      await fetchChats();

      toast({
        title: "Success",
        description: "Chat created successfully"
      });

      return chat;
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive"
      });
      throw error;
    }
  }, [user, fetchChats]);

  // Mark messages as read
  const markAsRead = useCallback(async (chatId: string) => {
    if (!user) return;

    try {
      // Update read status via backend
      await fetch(`${BACKEND_URL}/api/chats/${chatId}/messages/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((chatId: string, isTyping: boolean) => {
    if (!socket || !user) return;

    if (isTyping) {
      socket.emit('typing', {
        chatId,
        userId: user.id,
        username: user.email
      });
    } else {
      socket.emit('stop_typing', {
        chatId,
        userId: user.id
      });
    }
  }, [socket, user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    messages,
    loading,
    sendingMessage,
    fetchMessages,
    sendMessage,
    createChat,
    markAsRead,
    sendTypingIndicator,
    refetchChats: fetchChats
  };
};