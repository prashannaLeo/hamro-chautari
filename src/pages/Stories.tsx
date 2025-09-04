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
  Clock,
  Trash2,
  Edit
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useStories, Story } from '@/hooks/useStories';
import CreateStoryDialog from '@/components/Stories/CreateStoryDialog';
import EditStoryDialog from '@/components/Stories/EditStoryDialog';
import { toast } from 'sonner';

const Stories = () => {
  const { user, loading } = useAuth();
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const { stories, loading: storiesLoading, deleteStory, incrementViews, refetch } = useStories();

  if (loading || storiesLoading) {
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

  interface CreateStoryPlaceholder {
    id: string;
    isEmpty: true;
    user: {
      name: string;
      username: string;
      avatar: string;
      isOwn: boolean;
    };
  }

  interface StoryWithUser extends Story {
    isEmpty?: false;
    user: {
      name: string;
      username: string;
      avatar: string;
      isOwn: boolean;
    };
  }

  type DisplayStory = CreateStoryPlaceholder | StoryWithUser;

  const handleStoryClick = (story: DisplayStory) => {
    if (story.isEmpty) return;
    
    setSelectedStory(story);
    if ('user_id' in story && story.user_id !== user?.id) {
      incrementViews(story.id);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    const result = await deleteStory(storyId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Story deleted successfully');
      setSelectedStory(null);
      setDeletingStoryId(null);
      refetch();
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
  };

  // Create a "your story" placeholder and combine with existing stories
  const myStories = stories.filter(story => story.user_id === user?.id);
  const otherStories = stories.filter(story => story.user_id !== user?.id);
  
  const displayStories: DisplayStory[] = [
    // Add story placeholder
    {
      id: 'create',
      isEmpty: true,
      user: {
        name: 'Your Story',
        username: 'you',
        avatar: '',
        isOwn: true,
      },
    } as CreateStoryPlaceholder,
    ...myStories.map(story => ({
      ...story,
      isEmpty: false,
      user: {
        name: story.profiles?.display_name || story.profiles?.username || 'You',
        username: story.profiles?.username || 'you',
        avatar: story.profiles?.avatar_url || '',
        isOwn: true,
      },
    } as StoryWithUser)),
    ...otherStories.map(story => ({
      ...story,
      isEmpty: false,
      user: {
        name: story.profiles?.display_name || story.profiles?.username || 'User',
        username: story.profiles?.username || 'user',
        avatar: story.profiles?.avatar_url || '',
        isOwn: false,
      },
    } as StoryWithUser))
  ];

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
          {displayStories.map((story) => (
            <div key={story.id}>
              {story.isEmpty ? (
                <Card 
                  className="relative aspect-[3/4] overflow-hidden cursor-pointer group hover:scale-105 transition-all duration-300 shadow-lg bg-white/90 backdrop-blur-sm border-0"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <CardContent className="p-0 h-full">
                    <div className="h-full bg-gradient-to-br from-primary/20 to-primary/10 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
                        <Plus className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-medium">Add Story</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Card 
                      className="relative aspect-[3/4] overflow-hidden cursor-pointer group hover:scale-105 transition-all duration-300 shadow-lg bg-white/90 backdrop-blur-sm border-0"
                      onClick={() => handleStoryClick(story)}
                    >
                      <CardContent className="p-0 h-full">
                        {'media_type' in story && story.media_type === 'image' ? (
                          <img 
                            src={story.media_url} 
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
                            {'created_at' in story ? formatTime(story.created_at) : 'Now'}
                          </p>
                        </div>

                        {/* Views count */}
                        {story.user.isOwn && 'views_count' in story && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              {story.views_count}
                            </Badge>
                          </div>
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
                              <p className="text-white/80 text-xs">
                                {'created_at' in story ? formatTime(story.created_at) : 'Now'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {story.user.isOwn && 'id' in story && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-white hover:bg-white/20"
                                onClick={() => handleDeleteStory(story.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Media */}
                        {'media_type' in story && story.media_type === 'image' ? (
                          <img 
                            src={'media_url' in story ? story.media_url : ''} 
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
                              <source src={'media_url' in story ? story.media_url : ''} type="video/mp4" />
                            </video>
                          </div>
                        )}

                        {/* Caption */}
                        {'caption' in story && story.caption && (
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
                          {'isOwn' in selectedStory && selectedStory.isOwn && (
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-white hover:bg-white/20"
                                onClick={() => handleEditStory(selectedStory as Story)}
                              >
                                <Edit className="w-5 h-5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-400 hover:bg-red-500/20"
                                onClick={() => setDeletingStoryId(selectedStory.id)}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 text-white/80 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeRemaining('expires_at' in story ? story.expires_at : '')}</span>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              )}
            </div>
          ))}
        </div>

        {/* Discover Stories */}
        {otherStories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Discover</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {otherStories.slice(0, 12).map((story) => (
                <Card key={`discover-${story.id}`} className="aspect-square overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg bg-white/90 backdrop-blur-sm border-0">
                  <CardContent className="p-0 h-full relative">
                    <img 
                      src={story.media_url} 
                      alt="Discover story"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-medium truncate">
                        {story.profiles?.display_name || story.profiles?.username}
                      </p>
                      <div className="flex items-center space-x-1 text-white/80 text-xs">
                        <Eye className="w-3 h-3" />
                        <span>{story.views_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <CreateStoryDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen} 
        />

        <EditStoryDialog
          open={!!editingStory}
          onOpenChange={(open) => !open && setEditingStory(null)}
          storyId={editingStory?.id || ''}
          initialCaption={editingStory?.caption || ''}
          onStoryUpdated={() => {
            refetch();
            setEditingStory(null);
          }}
        />

        <AlertDialog open={!!deletingStoryId} onOpenChange={(open) => !open && setDeletingStoryId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Story</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this story? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingStoryId && handleDeleteStory(deletingStoryId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Stories;