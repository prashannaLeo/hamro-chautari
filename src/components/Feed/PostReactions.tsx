import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, ThumbsUp, Laugh, Angry, Sad } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Reaction {
  type: string;
  count: number;
  userReacted: boolean;
}

interface PostReactionsProps {
  postId: string;
  initialLikes?: number;
}

const reactions = [
  { type: 'like', icon: Heart, emoji: '❤️', color: 'text-red-500' },
  { type: 'love', icon: ThumbsUp, emoji: '👍', color: 'text-blue-500' },
  { type: 'laugh', icon: Laugh, emoji: '😂', color: 'text-yellow-500' },
  { type: 'angry', icon: Angry, emoji: '😠', color: 'text-red-700' },
  { type: 'sad', icon: Sad, emoji: '😢', color: 'text-blue-700' },
];

export const PostReactions: React.FC<PostReactionsProps> = ({ postId, initialLikes = 0 }) => {
  const [userReactions, setUserReactions] = useState<{ [key: string]: boolean }>({});
  const [reactionCounts, setReactionCounts] = useState<{ [key: string]: number }>({ like: initialLikes });
  const [showReactions, setShowReactions] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Fetch user's reactions for this post
    const fetchUserReactions = async () => {
      try {
        const { data } = await supabase
          .from('reactions')
          .select('reaction_type')
          .eq('post_id', postId)
          .eq('user_id', user.id);

        const userReacted: { [key: string]: boolean } = {};
        data?.forEach(reaction => {
          userReacted[reaction.reaction_type] = true;
        });
        setUserReactions(userReacted);
      } catch (error) {
        console.error('Error fetching user reactions:', error);
      }
    };

    // Fetch reaction counts
    const fetchReactionCounts = async () => {
      try {
        const { data } = await supabase
          .from('reactions')
          .select('reaction_type')
          .eq('post_id', postId);

        const counts: { [key: string]: number } = {};
        data?.forEach(reaction => {
          counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1;
        });
        
        // Include likes from the likes table for backward compatibility
        const { data: likesData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId);
        
        counts.like = (counts.like || 0) + (likesData?.length || 0);
        setReactionCounts(counts);
      } catch (error) {
        console.error('Error fetching reaction counts:', error);
      }
    };

    fetchUserReactions();
    fetchReactionCounts();
  }, [postId, user]);

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to react to posts",
        variant: "destructive"
      });
      return;
    }

    try {
      if (userReactions[reactionType]) {
        // Remove reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);

        setUserReactions(prev => ({ ...prev, [reactionType]: false }));
        setReactionCounts(prev => ({ 
          ...prev, 
          [reactionType]: Math.max((prev[reactionType] || 0) - 1, 0)
        }));
      } else {
        // Add reaction
        await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });

        setUserReactions(prev => ({ ...prev, [reactionType]: true }));
        setReactionCounts(prev => ({ 
          ...prev, 
          [reactionType]: (prev[reactionType] || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  const topReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="relative">
      {/* Reaction Button */}
      <Button
        variant="ghost"
        size="sm"
        className="space-x-2 hover:bg-red-50 transition-colors text-gray-600 hover:text-red-600"
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
        onClick={() => handleReaction('like')}
      >
        <Heart className={`w-5 h-5 transition-all ${
          userReactions.like ? 'fill-current text-red-600 scale-110' : ''
        }`} />
        <span className="font-semibold">{totalReactions}</span>
      </Button>

      {/* Reaction Picker */}
      {showReactions && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border px-3 py-2 flex space-x-2 z-10"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {reactions.map(({ type, emoji }) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className={`text-xl hover:scale-125 transition-transform ${
                userReactions[type] ? 'scale-125' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Reaction Summary */}
      {topReactions.length > 0 && (
        <div className="flex items-center space-x-2 mt-1">
          {topReactions.map(([type, count]) => {
            const reaction = reactions.find(r => r.type === type);
            return (
              <Badge key={type} variant="outline" className="text-xs">
                {reaction?.emoji} {count}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};