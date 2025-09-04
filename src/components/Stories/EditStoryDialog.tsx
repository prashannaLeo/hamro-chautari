import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EditStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyId: string;
  initialCaption?: string;
  onStoryUpdated?: () => void;
}

const EditStoryDialog: React.FC<EditStoryDialogProps> = ({
  open,
  onOpenChange,
  storyId,
  initialCaption,
  onStoryUpdated
}) => {
  const [caption, setCaption] = useState(initialCaption || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setCaption(initialCaption || '');
  }, [initialCaption, open]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to edit stories');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('stories')
        .update({
          caption: caption.trim() || null,
        })
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Story updated successfully!');
      onStoryUpdated?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating story:', error);
      toast.error('Failed to update story');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Edit3 className="w-4 h-4 text-primary" />
            </div>
            Edit Story Caption
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              maxLength={200}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{caption.length}/200 characters</p>
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
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Caption'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditStoryDialog;