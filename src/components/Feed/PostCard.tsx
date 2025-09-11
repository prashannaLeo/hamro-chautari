import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  MapPin,
  Clock,
  Edit,
  Trash2,
  Bookmark
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { SimplifiedPostReactions } from './SimplifiedPostReactions';
import { SharePostDialog } from './SharePostDialog';

// Lazy load CommentSection to avoid circular dependencies
const CommentSection = React.lazy(() => import('@/components/Comments/CommentSection'));

interface PostCardProps {
  post: {
    id: string;
    user_id?: string;
    user: {
      name: string;
      username: string;
      avatar?: string;
      isVerified?: boolean;
    };
    content: string;
    images?: string[];
    mood?: string;
    location?: string;
    timestamp: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked?: boolean;
  };
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onPostUpdate?: (postId: string, updates: { likes: number; comments: number }) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onDelete, onPostUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user } = useAuth();

  const isOwner = user?.id === post.user_id;

  // Subscribe to comment count changes
  useEffect(() => {
    const setupSubscription = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const subscription = supabase
        .channel(`post-updates:${post.id}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'posts',
            filter: `id=eq.${post.id}`
          }, 
          (payload: any) => {
            if (payload.new.comments_count !== undefined) {
              setCommentsCount(payload.new.comments_count);
              onPostUpdate?.(post.id, { 
                likes: payload.new.likes_count || likesCount, 
                comments: payload.new.comments_count 
              });
            }
            if (payload.new.likes_count !== undefined) {
              setLikesCount(payload.new.likes_count);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    const cleanup = setupSubscription();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [post.id, likesCount, commentsCount, onPostUpdate]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '😊',
      excited: '🎉',
      grateful: '🙏',
      adventurous: '🏔️',
      peaceful: '🧘',
      creative: '🎨',
    };
    return moodEmojis[mood] || '';
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-scale-in">
      <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-white shadow-md flex-shrink-0">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold text-sm sm:text-base">
                {post.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{post.user.name}</h3>
                {post.user.isVerified && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs bg-blue-100 text-blue-800 border-blue-200 flex-shrink-0">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mt-1 flex-wrap">
                <span className="font-medium truncate">@{post.user.username}</span>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{formatTime(post.timestamp)}</span>
                </div>
                {post.location && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="truncate max-w-20 sm:max-w-32 text-green-700 font-medium text-xs sm:text-sm">{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full p-1 sm:p-2 flex-shrink-0">
                <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border shadow-xl">
              {isOwner && (
                <>
                  <DropdownMenuItem 
                    onClick={() => onEdit?.(post.id)}
                    className="hover:bg-blue-50 text-blue-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(post.id)}
                    className="hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem className="hover:bg-blue-50">
                <Bookmark className="w-4 h-4 mr-2" />
                Save post
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-blue-50">Hide post</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-red-50 text-red-600">Report post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mood badge */}
        {post.mood && (
          <div className="flex justify-start">
            <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 text-purple-800 font-medium px-3 py-1">
              {getMoodEmoji(post.mood)} Feeling {post.mood}
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="space-y-3 sm:space-y-4">
          <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{post.content}</p>
          
          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 rounded-lg overflow-hidden">
              {post.images.slice(0, 4).map((image, index) => (
                <div 
                  key={index} 
                  className={`relative aspect-square ${
                    post.images!.length === 1 ? 'sm:col-span-2' : ''
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {post.images!.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm sm:text-base">
                        +{post.images!.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 sm:pt-5 border-t border-gray-100">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <SimplifiedPostReactions 
              postId={post.id}
              initialLikes={likesCount}
              initialIsLiked={isLiked}
            />
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className={`space-x-1 sm:space-x-2 transition-colors p-1 sm:p-2 ${
                showComments ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-xs sm:text-sm">{commentsCount}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="space-x-1 sm:space-x-2 text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors p-1 sm:p-2"
              onClick={() => setShowShareDialog(true)}
            >
              <Share className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-xs sm:text-sm">{post.shares}</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <React.Suspense fallback={<div className="p-4 text-center text-gray-500">Loading comments...</div>}>
          <CommentSection postId={post.id} isVisible={showComments} />
        </React.Suspense>

        {/* Share Dialog */}
        <SharePostDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          post={{
            id: post.id,
            user: post.user,
            content: post.content,
            images: post.images,
            timestamp: post.timestamp
          }}
        />
      </CardContent>
    </Card>
  );
};

export default PostCard;