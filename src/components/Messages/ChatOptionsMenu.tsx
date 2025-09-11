import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, User, BellOff, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ChatOptionsMenuProps {
  chatId: string;
  chatName: string;
  onViewProfile?: () => void;
  onMuteToggle?: () => void;
  onDeleteChat?: (chatId: string) => void;
  isMuted?: boolean;
}

const ChatOptionsMenu: React.FC<ChatOptionsMenuProps> = ({
  chatId,
  chatName,
  onViewProfile,
  onMuteToggle,
  onDeleteChat,
  isMuted = false
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = () => {
    onDeleteChat?.(chatId);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onViewProfile} className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMuteToggle} className="flex items-center">
            <BellOff className="w-4 h-4 mr-2" />
            {isMuted ? 'Unmute' : 'Mute'} notifications
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            className="flex items-center text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation with {chatName}? 
              This action cannot be undone and all messages will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatOptionsMenu;