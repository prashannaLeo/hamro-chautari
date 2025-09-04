import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Video, 
  MapPin, 
  Smile,
  Globe,
  Users,
  Lock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CreatePost = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'excited', emoji: '🎉', label: 'Excited' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'adventurous', emoji: '🏔️', label: 'Adventurous' },
    { value: 'peaceful', emoji: '🧘', label: 'Peaceful' },
    { value: 'creative', emoji: '🎨', label: 'Creative' },
  ];

  const visibilityOptions = [
    { value: 'public', icon: Globe, label: 'Public' },
    { value: 'friends', icon: Users, label: 'Friends' },
    { value: 'private', icon: Lock, label: 'Private' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    // TODO: Implement post creation
    console.log('Creating post:', { content, visibility, mood });
    
    // Reset form
    setContent('');
    setMood('');
    setLoading(false);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="w-auto h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <option.icon className="w-3 h-3" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mood && (
                  <Badge variant="secondary" className="text-xs">
                    {moods.find(m => m.value === mood)?.emoji} {moods.find(m => m.value === mood)?.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <Textarea
            placeholder="What's on your mind? Share your thoughts with Hamro Chautari..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-20 resize-none border-none p-0 text-base focus-visible:ring-0"
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-2">
              <Button type="button" variant="ghost" size="sm">
                <Image className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Photo</span>
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <Video className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Video</span>
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Location</span>
              </Button>
              
              {/* Mood selector */}
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="w-auto h-8 border-none">
                  <div className="flex items-center">
                    <Smile className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Mood</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <span>No mood</span>
                  </SelectItem>
                  {moods.map((moodOption) => (
                    <SelectItem key={moodOption.value} value={moodOption.value}>
                      <div className="flex items-center space-x-2">
                        <span>{moodOption.emoji}</span>
                        <span>{moodOption.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              disabled={!content.trim() || loading}
              size="sm"
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;