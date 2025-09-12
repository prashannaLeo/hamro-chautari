import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/hooks/useMessages';
import { useCallingContext } from '@/contexts/CallingContext';
import NewChatDialog from '@/components/Messages/NewChatDialog';
import MessageAttachment from '@/components/Messages/MessageAttachment';
import ChatOptionsMenu from '@/components/Messages/ChatOptionsMenu';
import { 
  Search, 
  Phone, 
  Video, 
  Send,
  Smile,
  Plus,
  MessageCircle
} from 'lucide-react';

// Removed mock data - using real data from useMessages hook

const Messages = () => {
  const { user, loading } = useAuth();
  const { 
    chats, 
    messages, 
    loading: messagesLoading,
    sendMessage,
    fetchMessages,
    sendingMessage,
    refetchChats
  } = useMessages();
  const { initiateCall } = useCallingContext();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);

  if (loading || messagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      await sendMessage(selectedChat.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const handleAttachmentSelect = async (files: any[]) => {
    if (!selectedChat) return;
    
    // Send each file as a separate message
    for (const file of files) {
      try {
        const attachmentMessage = `📎 ${file.file.name} (${(file.file.size / 1024 / 1024).toFixed(2)}MB)`;
        await sendMessage(selectedChat.id, attachmentMessage, 'attachment');
      } catch (error) {
        console.error('Error sending attachment:', error);
      }
    }
  };

  const handleVoiceCall = () => {
    if (selectedChat && user) {
      const otherParticipant = selectedChat.chat_participants?.find((p: any) => p.user_id !== user.id);
      if (otherParticipant) {
        initiateCall(
          otherParticipant.user_id,
          otherParticipant.profiles?.display_name || otherParticipant.profiles?.username || 'Unknown',
          'voice',
          otherParticipant.profiles?.avatar_url
        );
      }
    }
  };

  const handleVideoCall = () => {
    if (selectedChat && user) {
      const otherParticipant = selectedChat.chat_participants?.find((p: any) => p.user_id !== user.id);
      if (otherParticipant) {
        initiateCall(
          otherParticipant.user_id,
          otherParticipant.profiles?.display_name || otherParticipant.profiles?.username || 'Unknown',
          'video',
          otherParticipant.profiles?.avatar_url
        );
      }
    }
  };

  const handleDeleteChat = (chatId: string) => {
    // Implement chat deletion logic
    console.log('Delete chat:', chatId);
  };

  const filteredChats = chats.filter(chat => {
    const chatName = chat.name || 
      chat.chat_participants
        ?.filter((p: any) => p.user_id !== user?.id)
        ?.map((p: any) => p.profiles?.display_name || p.profiles?.username)
        ?.join(', ') || 'Unknown';
    
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const currentMessages = selectedChat ? messages[selectedChat.id] || [] : [];

  // Get chat name for display
  const getChatName = (chat: any) => {
    if (chat.name) return chat.name;
    const otherParticipants = chat.chat_participants?.filter((p: any) => p.user_id !== user?.id);
    return otherParticipants?.map((p: any) => p.profiles?.display_name || p.profiles?.username)?.join(', ') || 'Unknown';
  };

  // Get last message for chat
  const getLastMessage = (chat: any) => {
    if (chat.last_message) {
      return chat.last_message.content || 'Media';
    }
    return 'No messages yet';
  };

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="chat-mobile-layout container-mobile pb-safe-bottom pt-4">
        {/* Chat List - Always visible on desktop, toggleable on mobile */}
        <div className={`chat-list-mobile ${selectedChat ? 'hidden lg:block' : 'block'}`}>
          <div className="card-mobile h-full flex flex-col">
            <div className="card-content-mobile pb-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-mobile-h2">Messages</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setNewChatDialogOpen(true)}
                  className="btn-ghost-mobile"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="search-mobile">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-mobile"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1">
                {filteredChats.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {chats.length === 0 ? 'No conversations yet' : 'No conversations found'}
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const chatName = getChatName(chat);
                    const otherParticipant = chat.chat_participants?.find((p: any) => p.user_id !== user?.id);
                    const avatarUrl = otherParticipant?.profiles?.avatar_url || '';
                    const lastMessage = getLastMessage(chat);
                    
                    return (
                      <div
                        key={chat.id}
                        onClick={() => handleSelectChat(chat)}
                        className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors press-effect ${
                          selectedChat?.id === chat.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="avatar-mobile-md">
                              <AvatarImage src={avatarUrl} alt={chatName} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {chatName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-mobile-body truncate">{chatName}</h3>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {chat.last_message ? 
                                  new Date(chat.last_message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                                  new Date(chat.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                }
                              </span>
                            </div>
                            
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Content - Full screen on mobile, sidebar on desktop */}
        <div className={`${selectedChat ? 'chat-content-fullscreen lg:chat-content-mobile' : 'chat-content-mobile'}`}>
          <div className="card-mobile h-full flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="card-content-mobile pb-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    {/* Back Button for Mobile */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedChat(null)}
                        className="btn-ghost-mobile lg:hidden"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                      <Avatar className="avatar-mobile-md flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {(selectedChat.name || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-mobile-body truncate">
                          {selectedChat.name || 
                            selectedChat.chat_participants
                              ?.filter((p: any) => p.user_id !== user.id)
                              ?.map((p: any) => p.profiles?.display_name || p.profiles?.username)
                              ?.join(', ') || 'Unknown'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedChat.type === 'direct' ? 'Direct message' : 'Group chat'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={handleVoiceCall} className="btn-ghost-mobile">
                        <Phone className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleVideoCall} className="btn-ghost-mobile">
                        <Video className="w-5 h-5" />
                      </Button>
                      <ChatOptionsMenu
                        chatId={selectedChat.id}
                        chatName={getChatName(selectedChat)}
                        onDeleteChat={handleDeleteChat}
                      />
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto scroll-smooth">
                  <div className="space-y-3 sm:space-y-4">
                    {currentMessages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`${
                              message.sender_id === user.id
                                ? 'message-bubble-sent'
                                : 'message-bubble-received'
                            }`}
                          >
                            <p className="break-words text-sm sm:text-base">{message.content}</p>
                            <p className={`text-xs mt-1 opacity-70`}>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-3 sm:p-4 border-t border-gray-100 safe-area-pb">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
                    <MessageAttachment onAttachmentSelect={handleAttachmentSelect} />
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="input-mobile pr-12 focus:ring-2 focus:ring-primary"
                        disabled={sendingMessage}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-ghost-mobile"
                      >
                        <Smile className="w-5 h-5 text-gray-600" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={!newMessage.trim() || sendingMessage}
                      className="btn-primary"
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2 text-mobile-body">No conversation selected</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Chat Dialog */}
      <NewChatDialog 
        open={newChatDialogOpen} 
        onOpenChange={setNewChatDialogOpen} 
      />
    </div>
  );
};

export default Messages;