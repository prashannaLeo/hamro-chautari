import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewChatDialog: React.FC<NewChatDialogProps> = ({ open, onOpenChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);
  const { searchResults, loading, searchUsers } = useUserSearch();
  const { createChat } = useMessages();
  const { user } = useAuth();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      await searchUsers(query.trim());
    }
  };

  const handleCreateChat = async (targetUserId: string, targetUserName: string) => {
    if (!user) return;
    
    setCreatingChat(true);
    try {
      const chat = await createChat([targetUserId], 'direct');
      if (chat) {
        toast.success(`Chat started with ${targetUserName}`);
        onOpenChange(false);
        setSearchQuery('');
        // Navigate to messages to see the new chat
        window.location.reload(); // Refresh to load new chat
      }
    } catch (error: any) {
      console.error('Failed to create chat:', error);
      toast.error(error.message || 'Failed to start chat');
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            New Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for users by username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {searchQuery.length > 2 && !loading && searchResults.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>No users found</p>
                <p className="text-sm">Try searching with a different name</p>
              </div>
            )}

            {searchResults.map((searchUser) => (
              <div
                key={searchUser.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={searchUser.avatar_url || ''} alt={searchUser.display_name || searchUser.username} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(searchUser.display_name || searchUser.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{searchUser.display_name || searchUser.username}</p>
                    <p className="text-xs text-gray-500">@{searchUser.username}</p>
                    {searchUser.bio && (
                      <p className="text-xs text-gray-400 truncate max-w-48">{searchUser.bio}</p>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleCreateChat(searchUser.user_id, searchUser.display_name || searchUser.username)}
                  disabled={creatingChat}
                  className="shrink-0"
                >
                  {creatingChat ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Chat'
                  )}
                </Button>
              </div>
            ))}
          </div>

          {searchQuery.length <= 2 && (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">Start a new conversation</p>
              <p className="text-sm">Search for users to start chatting with them</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;