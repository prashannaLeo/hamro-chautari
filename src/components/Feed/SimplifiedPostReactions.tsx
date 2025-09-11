import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePostOperations } from '@/hooks/usePostOperations';
import { Heart } from 'lucide-react';

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
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
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

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowReactions(false);
    }, 300); // 300ms delay before hiding
    setHoverTimeout(timeout);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div className="relative">
      {/* Main Reaction Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`space-x-2 hover:bg-red-50 transition-colors ${
          userReaction ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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

      {/* Reaction Picker */}
      {showReactions && (
        <div 
          className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex space-x-3 z-50 backdrop-blur-sm"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))'
          }}
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
              onMouseEnter={handleMouseEnter}
              className={`
                relative flex items-center justify-center
                w-10 h-10 rounded-full
                text-xl hover:scale-125 active:scale-95
                transition-all duration-200 ease-out
                cursor-pointer select-none
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${userReaction === type ? 
                  'scale-110 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400 ring-opacity-70' : 
                  'hover:shadow-lg'
                }
              `}
            >
              <span className="relative z-10">{emoji}</span>
              {reactionCounts[type] && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800 border-2 border-white dark:border-gray-800"
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