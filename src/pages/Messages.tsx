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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)]">
          {/* Chat List */}
          <Card className="lg:col-span-1 shadow-lg bg-white/90 backdrop-blur-sm border-0 h-full flex flex-col">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold">Messages</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setNewChatDialogOpen(true)}
                  className="hover:bg-primary/10 p-1 sm:p-2"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 h-10 sm:h-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
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
                        className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
                          selectedChat?.id === chat.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                              <AvatarImage src={avatarUrl} alt={chatName} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                                {chatName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-sm sm:text-base truncate">{chatName}</h3>
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
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col shadow-lg bg-white/90 backdrop-blur-sm border-0 h-full">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b border-border px-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                          {(selectedChat.name || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">
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
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={handleVoiceCall} className="p-1 sm:p-2">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleVideoCall} className="p-1 sm:p-2">
                        <Video className="w-4 h-4" />
                      </Button>
                      <ChatOptionsMenu
                        chatId={selectedChat.id}
                        chatName={getChatName(selectedChat)}
                        onDeleteChat={handleDeleteChat}
                      />
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-3 sm:p-4 overflow-y-auto">
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
                            className={`max-w-xs sm:max-w-md lg:max-w-lg px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                              message.sender_id === user.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_id === user.id 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
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
                </CardContent>

                {/* Message Input */}
                <div className="p-3 sm:p-6 border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
                    <MessageAttachment onAttachmentSelect={handleAttachmentSelect} />
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="pr-12 sm:pr-14 h-10 sm:h-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                        disabled={sendingMessage}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 rounded-xl hover:bg-gray-100"
                      >
                        <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">No conversation selected</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* New Chat Dialog */}
        <NewChatDialog 
          open={newChatDialogOpen} 
          onOpenChange={setNewChatDialogOpen} 
        />
      </main>
    </div>
  );
};

export default Messages;