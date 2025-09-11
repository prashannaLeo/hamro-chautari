import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePostOperations } from '@/hooks/usePostOperations';
import { useImageUpload } from '@/hooks/useImageUpload';
import { 
  Image, 
  Video, 
  MapPin, 
  Smile,
  Globe,
  Users,
  Lock,
  X,
  Upload
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const CreatePost = () => {
  const { user } = useAuth();
  const { createPost, loading } = usePostOperations();
  const { uploadMultiple, loading: uploadLoading } = useImageUpload('posts');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [mood, setMood] = useState('none');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate and limit to 4 files
    const validFiles = files.slice(0, 4);
    setSelectedFiles(validFiles);

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    try {
      let mediaUrls: string[] = [];
      
      // Upload images if any
      if (selectedFiles.length > 0) {
        try {
          const uploadResults = await uploadMultiple(selectedFiles);
          mediaUrls = uploadResults.map(result => result.url);
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload some files. Post will be created without media.",
            variant: "destructive"
          });
        }
      }

      await createPost({
        content,
        visibility,
        mood: mood === 'none' ? undefined : mood,
        location: location || undefined,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });
      
      // Reset form on success
      setContent('');
      setMood('none');
      setLocation('');
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Success",
        description: "Post created successfully!"
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-3 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
          {/* User info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-white shadow-md flex-shrink-0">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm sm:text-base">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="w-auto h-6 sm:h-7 text-xs sm:text-sm bg-gray-100 border-gray-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm">
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <option.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mood && mood !== 'none' && (
                  <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 text-purple-800 font-medium text-xs px-2 py-0.5 sm:px-3 sm:py-1">
                    {moods.find(m => m.value === mood)?.emoji} {moods.find(m => m.value === mood)?.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <Textarea
            placeholder="What's on your mind? Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-20 sm:min-h-24 resize-none border-0 bg-gray-50 rounded-xl p-3 sm:p-4 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:bg-white transition-all"
          />

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Location Input */}
          {location !== undefined && (
            <Input
              placeholder="Add location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-0 bg-gray-50 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl p-2 sm:p-3"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedFiles.length >= 4}
              >
                <Image className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline font-medium">Photo</span>
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl p-2 sm:p-3"
                onClick={() => setLocation(location === '' ? 'current' : '')}
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline font-medium">Location</span>
              </Button>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* Mood selector */}
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="w-auto h-8 sm:h-9 border-0 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors p-2 sm:p-3">
                  <div className="flex items-center">
                    <Smile className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2 text-orange-500" />
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
              disabled={(!content.trim() && selectedFiles.length === 0) || loading || uploadLoading}
              className="px-4 sm:px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
            >
              {(loading || uploadLoading) ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;