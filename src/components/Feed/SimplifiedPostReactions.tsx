import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePostOperations } from '@/hooks/usePostOperations';
import { Heart, ThumbsUp, Laugh, Angry, Frown } from 'lucide-react';

interface SimplifiedPostReactionsProps {
  postId: string;
  initialLikes?: number;
  initialIsLiked?: boolean;
}

const reactions = [
  { type: 'like', emoji: '❤️' },
  { type: 'love', emoji: '👍' },
  { type: 'laugh', emoji: '😂' },
  { type: 'angry', emoji: '😠' },
  { type: 'sad', emoji: '😢' },
];

export const SimplifiedPostReactions: React.FC<SimplifiedPostReactionsProps> = ({ 
  postId, 
  initialLikes = 0,
  initialIsLiked = false 
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [showReactions, setShowReactions] = useState(false);
  const { user } = useAuth();
  const { likePost, loading } = usePostOperations();

  const handleLike = async () => {
    if (!user || loading) return;
    
    try {
      const wasLiked = await likePost(postId);
      setIsLiked(wasLiked ?? false);
      
      const newLikesCount = wasLiked ? likesCount + 1 : likesCount - 1;
      setLikesCount(newLikesCount);
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  return (
    <div className="relative">
      {/* Main Like Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`space-x-2 hover:bg-red-50 transition-colors ${
          isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
        }`}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
        onClick={handleLike}
        disabled={loading}
      >
        <Heart className={`w-5 h-5 transition-all ${
          isLiked ? 'fill-current scale-110' : ''
        }`} />
        <span className="font-semibold">{likesCount}</span>
      </Button>

      {/* Reaction Picker (Simple hover menu) */}
      {showReactions && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border px-3 py-2 flex space-x-2 z-10"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {reactions.map(({ type, emoji }) => (
            <button
              key={type}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLike(); // For now, all reactions just toggle like
                setShowReactions(false);
              }}
              onMouseDown={(e) => e.preventDefault()}
              className="text-xl hover:scale-125 transition-transform cursor-pointer select-none"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};