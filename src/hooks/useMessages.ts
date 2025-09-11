import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

export const useMessages = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch user's chats
  const fetchChats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get chats where user is a participant
      const { data: chatsWithParticipants, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          chat_participants!inner (
            user_id,
            role,
            profiles (
              username,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('chat_participants.user_id', user.id);

      if (chatsError) throw chatsError;

      setChats(chatsWithParticipants as Chat[] || []);
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

  // Set up real-time subscription for new messages and chats
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-messages-${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        const newMessage = payload.new as Message;
        // Only add if this user is part of the chat (RLS should ensure this)
        setMessages(prev => {
          const chatMessages = prev[newMessage.chat_id] || [];
          // Check if message already exists to avoid duplicates
          if (chatMessages.find(m => m.id === newMessage.id)) {
            return prev;
          }
          return {
            ...prev,
            [newMessage.chat_id]: [...chatMessages, newMessage]
          };
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chats'
      }, () => {
        // Refetch chats when new ones are created - use the current fetchChats ref
        fetchChats();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_participants'
      }, (payload) => {
        // When current user is added to a chat, refresh chats
        try {
          const participant = payload.new as { user_id: string };
          if (!participant || participant.user_id === user.id) {
            fetchChats();
          }
        } catch {
          // Fallback: refresh anyway
          fetchChats();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]); // Removed fetchChats from dependency array to avoid circular dependency


  // Fetch messages for a specific chat
  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (
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
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  }, []);

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
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Optimistically append to local state for instant UI feedback
      setMessages(prev => {
        const chatMessages = prev[chatId] || [];
        if (chatMessages.find(m => m.id === (data as any).id)) {
          return prev;
        }
        return {
          ...prev,
          [chatId]: [...chatMessages, data as Message]
        };
      });

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
  }, [user]);

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
    refetchChats: fetchChats
  };
};