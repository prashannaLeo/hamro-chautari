import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';
import { useStories } from '@/hooks/useStories';
import { toast } from 'sonner';

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateStoryDialog: React.FC<CreateStoryDialogProps> = ({ open, onOpenChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createStory } = useStories();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      const result = await createStory(selectedFile, caption);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Story created successfully!');
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      toast.error('Failed to create story');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCaption('');
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-sm mx-auto sm:max-w-md md:max-w-lg h-fit max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="p-2 bg-primary/10 rounded-full">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            Create Story
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center bg-muted/5 hover:bg-muted/10 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Add to your story</h3>
              <p className="text-muted-foreground mb-6 text-sm">Share a photo or video that will disappear after 24 hours</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-8 py-2.5 font-medium"
                size="lg"
              >
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground mt-3">Supports images and videos up to 50MB</p>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview */}
              <div className="relative aspect-[9/16] max-w-xs mx-auto bg-muted rounded-2xl overflow-hidden shadow-lg">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={preview!}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={preview!}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                  />
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 h-8 w-8 p-0 bg-black/60 text-white hover:bg-black/80 rounded-full"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Caption */}
              <div className="space-y-3">
                <Label htmlFor="caption" className="text-sm font-medium">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">{caption.length}/200 characters</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="flex-1 font-medium"
                  disabled={isUploading}
                >
                  Change File
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="flex-1 font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sharing...
                    </>
                  ) : (
                    'Share Story'
                  )}
                </Button>
              </div>

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoryDialog;