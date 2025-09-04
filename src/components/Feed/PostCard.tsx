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
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-scale-in">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                {post.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-gray-900">{post.user.name}</h3>
                {post.user.isVerified && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs bg-blue-100 text-blue-800 border-blue-200">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                <span className="font-medium">@{post.user.username}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(post.timestamp)}</span>
                </div>
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="truncate max-w-32 text-green-700 font-medium">{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border shadow-xl">
              <DropdownMenuItem className="hover:bg-blue-50">Save post</DropdownMenuItem>
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
        <div className="space-y-4">
          <p className="text-gray-800 leading-relaxed text-base">{post.content}</p>
          
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
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <div className="flex items-center space-x-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`space-x-2 hover:bg-red-50 transition-colors ${
                isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
              <span className="font-semibold">{likesCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="space-x-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{post.comments}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="space-x-2 text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors">
              <Share className="w-5 h-5" />
              <span className="font-semibold">{post.shares}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;