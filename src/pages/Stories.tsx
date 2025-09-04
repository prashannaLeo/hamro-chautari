import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Play, 
  Eye, 
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

const mockStories = [
  {
    id: '1',
    user: {
      name: 'Your Story',
      username: 'you',
      avatar: '',
      isOwn: true,
    },
    mediaUrl: '',
    mediaType: 'image',
    caption: '',
    timestamp: new Date().toISOString(),
    views: 0,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isEmpty: true,
  },
  {
    id: '2',
    user: {
      name: 'Priya Sharma',
      username: 'priya_sharma',
      avatar: '',
      isOwn: false,
    },
    mediaUrl: '/api/placeholder/400/600',
    mediaType: 'image',
    caption: 'Beautiful morning in Kathmandu! ☀️',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    views: 24,
    expiresAt: new Date(Date.now() + 23.5 * 60 * 60 * 1000).toISOString(),
    filter: 'vintage',
  },
  {
    id: '3',
    user: {
      name: 'Arjun Thapa',
      username: 'arjun_thapa',
      avatar: '',
      isOwn: false,
    },
    mediaUrl: '/api/placeholder/400/600',
    mediaType: 'video',
    caption: 'Trek life! 🏔️',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    views: 45,
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    user: {
      name: 'Sita Rai',
      username: 'sita_rai',
      avatar: '',
      isOwn: false,
    },
    mediaUrl: '/api/placeholder/400/600',
    mediaType: 'image',
    caption: 'Traditional dance practice 💃',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    views: 18,
    expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
  },
];

const Stories = () => {
  const { user, loading } = useAuth();
  const [selectedStory, setSelectedStory] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return '1d ago';
  };

  const getTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Stories</h1>
          <p className="text-gray-600 text-lg">Share moments that disappear in 24 hours</p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
          {mockStories.map((story) => (
            <Dialog key={story.id}>
              <DialogTrigger asChild>
                <Card 
                  className="relative aspect-[3/4] overflow-hidden cursor-pointer group hover:scale-105 transition-all duration-300 shadow-lg bg-white/90 backdrop-blur-sm border-0"
                  onClick={() => setSelectedStory(story)}
                >
                  <CardContent className="p-0 h-full">
                    {story.isEmpty ? (
                      <div className="h-full bg-gradient-to-br from-primary/20 to-primary/10 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
                          <Plus className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium">Add Story</span>
                      </div>
                    ) : (
                      <>
                        {story.mediaType === 'image' ? (
                          <img 
                            src={story.mediaUrl} 
                            alt="Story"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-black flex items-center justify-center">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* User info */}
                        <div className="absolute top-3 left-3 flex items-center space-x-2">
                          <Avatar className="h-8 w-8 ring-2 ring-white">
                            <AvatarImage src={story.user.avatar} alt={story.user.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {story.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Story info */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white text-sm font-medium truncate">
                            {story.user.name}
                          </p>
                          <p className="text-white/80 text-xs">
                            {formatTime(story.timestamp)}
                          </p>
                        </div>

                        {/* Views count */}
                        {story.user.isOwn && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              {story.views}
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </DialogTrigger>

              {!story.isEmpty && (
                <DialogContent className="max-w-md p-0 bg-black">
                  <div className="relative aspect-[3/4]">
                    {/* Progress bar */}
                    <div className="absolute top-4 left-4 right-4 z-10">
                      <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-300"
                          style={{ width: '30%' }}
                        />
                      </div>
                    </div>

                    {/* User info */}
                    <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={story.user.avatar} alt={story.user.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {story.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white text-sm font-medium">{story.user.name}</p>
                          <p className="text-white/80 text-xs">{formatTime(story.timestamp)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Media */}
                    {story.mediaType === 'image' ? (
                      <img 
                        src={story.mediaUrl} 
                        alt="Story"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <video 
                          className="w-full h-full object-cover" 
                          autoPlay 
                          muted 
                          loop
                        >
                          <source src={story.mediaUrl} type="video/mp4" />
                        </video>
                      </div>
                    )}

                    {/* Caption */}
                    {story.caption && (
                      <div className="absolute bottom-20 left-4 right-4">
                        <p className="text-white text-sm">{story.caption}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Heart className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Share className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-1 text-white/80 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeRemaining(story.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          ))}
        </div>

        {/* Discover Stories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Discover</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {mockStories.slice(1).map((story) => (
              <Card key={`discover-${story.id}`} className="aspect-square overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg bg-white/90 backdrop-blur-sm border-0">
                <CardContent className="p-0 h-full relative">
                  <img 
                    src={story.mediaUrl} 
                    alt="Discover story"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium truncate">
                      {story.user.name}
                    </p>
                    <div className="flex items-center space-x-1 text-white/80 text-xs">
                      <Eye className="w-3 h-3" />
                      <span>{story.views}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Stories;