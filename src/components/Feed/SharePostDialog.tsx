import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Share, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePostOperations } from '@/hooks/usePostOperations';
import { toast } from '@/hooks/use-toast';

interface SharePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: string;
    user: {
      name: string;
      username: string;
      avatar?: string;
    };
    content: string;
    images?: string[];
    timestamp: string;
  };
}

export const SharePostDialog: React.FC<SharePostDialogProps> = ({ 
  open, 
  onOpenChange, 
  post 
}) => {
  const [shareText, setShareText] = useState('');
  const [shareType, setShareType] = useState<'quote' | 'repost'>('quote');
  const { user } = useAuth();
  const { createPost, loading } = usePostOperations();

  const handleShare = async () => {
    try {
      if (shareType === 'quote' && !shareText.trim()) {
        toast({
          title: "Add a comment",
          description: "Please add your thoughts when quote sharing",
          variant: "destructive"
        });
        return;
      }

      await createPost({
        content: shareType === 'quote' ? shareText : `Shared ${post.user.name}'s post`,
        visibility: 'public',
        shared_post_id: post.id
      });

      toast({
        title: "Post shared!",
        description: "Your shared post has been published"
      });

      onOpenChange(false);
      setShareText('');
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share Type Selection */}
          <div className="flex space-x-2">
            <Button
              variant={shareType === 'quote' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShareType('quote')}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Quote Share
            </Button>
            <Button
              variant={shareType === 'repost' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShareType('repost')}
              className="flex-1"
            >
              <Share className="w-4 h-4 mr-2" />
              Repost
            </Button>
          </div>

          {/* Quote Share Text */}
          {shareType === 'quote' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user?.email}</p>
                </div>
              </div>
              <Textarea
                placeholder="Add your thoughts..."
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                className="min-h-20 resize-none"
                maxLength={280}
              />
              <p className="text-xs text-muted-foreground text-right">
                {shareText.length}/280
              </p>
            </div>
          )}

          {/* Original Post Preview */}
          <Card className="border-l-4 border-primary">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.user.avatar} alt={post.user.name} />
                  <AvatarFallback>
                    {post.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{post.user.name}</p>
                  <p className="text-xs text-muted-foreground">@{post.user.username}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{post.content}</p>
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {post.images.slice(0, 2).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};