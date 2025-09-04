import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: {
    id: string;
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
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    // TODO: Implement like functionality
  };

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
    <Card className="mb-4">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm">{post.user.name}</h3>
                {post.user.isVerified && (
                  <Badge variant="secondary" className="h-4 px-1 text-xs">✓</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>@{post.user.username}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(post.timestamp)}</span>
                </div>
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-20">{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Save post</DropdownMenuItem>
              <DropdownMenuItem>Hide post</DropdownMenuItem>
              <DropdownMenuItem>Report post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mood badge */}
        {post.mood && (
          <Badge variant="outline" className="w-fit">
            {getMoodEmoji(post.mood)} Feeling {post.mood}
          </Badge>
        )}

        {/* Content */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">{post.content}</p>
          
          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg overflow-hidden">
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
                      <span className="text-white font-semibold">
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
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`space-x-2 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{likesCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{post.comments}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="space-x-2">
              <Share className="w-4 h-4" />
              <span className="text-xs">{post.shares}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;