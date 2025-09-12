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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] flex">
        {/* Chat List - Always visible on desktop, toggleable on mobile */}
        <div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 xl:w-96 flex-col border-r border-border bg-card`}>
          {/* Messages Header */}
          <div className="p-4 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-foreground">Messages</h1>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setNewChatDialogOpen(true)}
                className="w-10 h-10 rounded-full hover:bg-muted transition-colors"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring h-9 text-sm"
              />
            </div>
          </div>
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {chats.length === 0 ? 'No conversations yet' : 'No conversations found'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredChats.map((chat) => {
                  const chatName = getChatName(chat);
                  const otherParticipant = chat.chat_participants?.find((p: any) => p.user_id !== user?.id);
                  const avatarUrl = otherParticipant?.profiles?.avatar_url || '';
                  const lastMessage = getLastMessage(chat);
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleSelectChat(chat)}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-200 ${
                        selectedChat?.id === chat.id ? 'bg-primary/5 border-r-2 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={avatarUrl} alt={chatName} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                              {chatName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-foreground truncate text-sm">
                              {chatName}
                            </h3>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {chat.last_message ? 
                                new Date(chat.last_message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) :
                                new Date(chat.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                              }
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Content - Full screen on mobile, main area on desktop */}
        <div className={`${selectedChat ? 'fixed inset-0 z-50 bg-background lg:relative lg:z-auto lg:flex-1' : 'hidden lg:flex lg:flex-1'} flex flex-col`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <div className="flex items-center justify-between">
                  {/* Back Button for Mobile & Chat Info */}
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedChat(null)}
                      className="w-10 h-10 rounded-full hover:bg-muted transition-colors lg:hidden"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {getChatName(selectedChat).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {getChatName(selectedChat)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedChat.type === 'direct' ? 'Active now' : `${selectedChat.chat_participants?.length || 0} members`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Call Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleVoiceCall} 
                      className="w-10 h-10 rounded-full hover:bg-muted transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleVideoCall} 
                      className="w-10 h-10 rounded-full hover:bg-muted transition-colors"
                    >
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

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {currentMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No messages yet</p>
                      <p className="text-sm">Start the conversation with {getChatName(selectedChat)}</p>
                    </div>
                  ) : (
                    currentMessages.map((message, index) => {
                      const isOwnMessage = message.sender_id === user.id;
                      const showAvatar = !isOwnMessage && (index === 0 || currentMessages[index - 1]?.sender_id !== message.sender_id);
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end space-x-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwnMessage && (
                            <div className="w-8 h-8 flex-shrink-0">
                              {showAvatar && (
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                    {getChatName(selectedChat).charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          )}
                          
                          <div
                            className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted text-foreground rounded-bl-md'
                            }`}
                          >
                            <p className="break-words text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          {isOwnMessage && <div className="w-8 h-8 flex-shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <div className="max-w-4xl mx-auto">
                  <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                    <MessageAttachment onAttachmentSelect={handleAttachmentSelect} />
                    
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[40px] bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring pr-12 resize-none"
                        disabled={sendingMessage}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full hover:bg-muted-foreground/10"
                      >
                        <Smile className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={!newMessage.trim() || sendingMessage}
                      className="w-10 h-10 rounded-full"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="hidden lg:flex flex-1 items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Your messages</h3>
                <p className="text-muted-foreground mb-6">
                  Send private messages to friends, family, or colleagues
                </p>
                <Button onClick={() => setNewChatDialogOpen(true)}>
                  Start new conversation
                </Button>
              </div>
            </div>
          )}
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