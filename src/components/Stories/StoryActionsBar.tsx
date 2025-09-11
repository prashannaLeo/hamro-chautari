import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share, Send } from 'lucide-react';
import { useStoryInteractions } from '@/hooks/useStoryInteractions';

interface StoryActionsBarProps {
  storyId: string;
}

const StoryActionsBar: React.FC<StoryActionsBarProps> = ({ storyId }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const { reactToStory, commentOnStory, shareStory, loading } = useStoryInteractions();

  const handleLike = async () => {
    const result = await reactToStory(storyId, 'like');
    if (result !== undefined) {
      setIsLiked(result);
    }
  };

  const handleComment = () => {
    setShowCommentInput(!showCommentInput);
  };

  const handleSendComment = async () => {
    if (comment.trim()) {
      await commentOnStory(storyId, comment);
      setComment('');
      setShowCommentInput(false);
    }
  };

  const handleShare = async () => {
    await shareStory(storyId);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-white hover:bg-white/20 ${isLiked ? 'text-red-400' : ''}`}
          onClick={handleLike}
          disabled={loading}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-white/20"
          onClick={handleComment}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-white/20"
          onClick={handleShare}
          disabled={loading}
        >
          <Share className="w-5 h-5" />
        </Button>
      </div>
      
      {showCommentInput && (
        <div className="flex items-center space-x-2 mt-2">
          <Input
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 bg-white/20 border-white/30 text-white placeholder-white/70"
            onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
          />
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handleSendComment}
            disabled={!comment.trim() || loading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryActionsBar;