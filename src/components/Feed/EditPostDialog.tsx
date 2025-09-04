import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, MapPin, Smile } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  initialContent: string;
  initialMood?: string;
  initialLocation?: string;
  onPostUpdated?: () => void;
}

const EditPostDialog: React.FC<EditPostDialogProps> = ({
  open,
  onOpenChange,
  postId,
  initialContent,
  initialMood,
  initialLocation,
  onPostUpdated
}) => {
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState(initialMood || '');
  const [location, setLocation] = useState(initialLocation || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setContent(initialContent);
    setMood(initialMood || '');
    setLocation(initialLocation || '');
  }, [initialContent, initialMood, initialLocation, open]);

  const handleSubmit = async () => {
    if (!user || !content.trim()) {
      toast.error('Content is required');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          content: content.trim(),
          mood_tag: mood || null,
          location: location || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Post updated successfully!');
      onPostUpdated?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Edit3 className="w-4 h-4 text-primary" />
            </div>
            Edit Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{content.length}/500 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mood" className="flex items-center gap-1">
                <Smile className="w-4 h-4" />
                Mood
              </Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No mood</SelectItem>
                  <SelectItem value="happy">😊 Happy</SelectItem>
                  <SelectItem value="excited">🎉 Excited</SelectItem>
                  <SelectItem value="grateful">🙏 Grateful</SelectItem>
                  <SelectItem value="adventurous">🏔️ Adventurous</SelectItem>
                  <SelectItem value="peaceful">🧘 Peaceful</SelectItem>
                  <SelectItem value="creative">🎨 Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isUpdating || !content.trim()}
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Post'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;