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
import NewChatDialog from '@/components/Messages/NewChatDialog';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Send,
  Smile,
  Paperclip,
  Plus,
  MessageCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Removed mock data - using real data from useMessages hook

const Messages = () => {
  const { user, loading } = useAuth();
  const { 
    chats, 
    messages, 
    loading: messagesLoading,
    sendMessage,
    fetchMessages,
    sendingMessage 
  } = useMessages();
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
  const getLastMessage = (chatId: string) => {
    const chatMessages = messages[chatId] || [];
    if (chatMessages.length === 0) return 'No messages yet';
    const lastMessage = chatMessages[chatMessages.length - 1];
    return lastMessage.content || 'Media';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-10rem)]">
          {/* Chat List */}
          <Card className="lg:col-span-1 shadow-lg bg-white/90 backdrop-blur-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Messages</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setNewChatDialogOpen(true)}
                  className="hover:bg-primary/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
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
                    const lastMessage = getLastMessage(chat.id);
                    
                    return (
                      <div
                        key={chat.id}
                        onClick={() => handleSelectChat(chat)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
                          selectedChat?.id === chat.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={avatarUrl} alt={chatName} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {chatName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-sm truncate">{chatName}</h3>
                              <span className="text-xs text-muted-foreground">
                                {new Date(chat.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground truncate">
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
          <Card className="lg:col-span-2 flex flex-col shadow-lg bg-white/90 backdrop-blur-sm border-0">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {(selectedChat.name || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
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
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                          <DropdownMenuItem>Delete conversation</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
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
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
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
                <div className="p-6 border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <Button type="button" variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-blue-50">
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="pr-14 h-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        disabled={sendingMessage}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-xl hover:bg-gray-100"
                      >
                        <Smile className="w-5 h-5 text-gray-600" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No conversation selected</h3>
                  <p className="text-sm text-muted-foreground">
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