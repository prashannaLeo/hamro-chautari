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
  const [mood, setMood] = useState('none');
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
    setMood('none');
    setLoading(false);
  };

  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{user?.email}</p>
              <div className="flex items-center space-x-3 mt-1">
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="w-auto h-7 text-sm bg-gray-100 border-gray-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm">
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mood && mood !== 'none' && (
                  <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 text-purple-800 font-medium">
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
            className="min-h-24 resize-none border-0 bg-gray-50 rounded-xl p-4 text-base focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:bg-white transition-all"
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <Button type="button" variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                <Image className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline font-medium">Photo</span>
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl">
                <Video className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline font-medium">Video</span>
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline font-medium">Location</span>
              </Button>
              
              {/* Mood selector */}
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="w-auto h-9 border-0 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <div className="flex items-center">
                    <Smile className="w-5 h-5 mr-2 text-orange-500" />
                    <span className="hidden sm:inline font-medium text-gray-700">Mood</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm">
                  <SelectItem value="none">
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
              className="px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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