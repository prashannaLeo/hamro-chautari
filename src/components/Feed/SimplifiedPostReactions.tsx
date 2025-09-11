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
  { type: 'thumbs_up', emoji: '👍' },
  { type: 'laugh', emoji: '😂' },
  { type: 'angry', emoji: '😠' },
  { type: 'sad', emoji: '😢' },
];

export const SimplifiedPostReactions: React.FC<SimplifiedPostReactionsProps> = ({ 
  postId, 
  initialLikes = 0,
  initialIsLiked = false 
}) => {
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [showReactions, setShowReactions] = useState(false);
  const [totalReactions, setTotalReactions] = useState(initialLikes);
  const { user } = useAuth();
  const { reactToPost, getUserReaction, getReactionCounts, loading } = usePostOperations();

  useEffect(() => {
    const fetchUserReaction = async () => {
      if (user) {
        const reaction = await getUserReaction(postId);
        setUserReaction(reaction);
      }
    };

    const fetchReactionCounts = async () => {
      const counts = await getReactionCounts(postId);
      setReactionCounts(counts);
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setTotalReactions(total);
    };

    fetchUserReaction();
    fetchReactionCounts();
  }, [postId, user, getUserReaction, getReactionCounts]);

  const handleReaction = async (reactionType: string) => {
    if (!user || loading) return;
    
    try {
      const newReaction = await reactToPost(postId, reactionType);
      setUserReaction(newReaction);
      
      // Refresh reaction counts
      const counts = await getReactionCounts(postId);
      setReactionCounts(counts);
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setTotalReactions(total);
      
      setShowReactions(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const getCurrentReactionEmoji = () => {
    if (!userReaction) return null;
    const reaction = reactions.find(r => r.type === userReaction);
    return reaction ? reaction.emoji : null;
  };

  return (
    <div className="relative">
      {/* Main Reaction Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`space-x-2 hover:bg-red-50 transition-colors ${
          userReaction ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
        }`}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
        onClick={() => handleReaction('like')}
        disabled={loading}
      >
        {userReaction ? (
          <span className="text-lg">{getCurrentReactionEmoji()}</span>
        ) : (
          <Heart className="w-5 h-5" />
        )}
        <span className="font-semibold">{totalReactions}</span>
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
                handleReaction(type);
              }}
              onMouseDown={(e) => e.preventDefault()}
              className={`text-xl hover:scale-125 transition-transform cursor-pointer select-none relative ${
                userReaction === type ? 'scale-110 ring-2 ring-blue-400 ring-opacity-50 rounded-full' : ''
              }`}
            >
              {emoji}
              {reactionCounts[type] && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {reactionCounts[type]}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};