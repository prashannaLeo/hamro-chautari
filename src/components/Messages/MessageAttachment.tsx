import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import MediaUpload from '@/components/Media/MediaUpload';
import { Paperclip } from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'file';
  uploadProgress: number;
  uploaded: boolean;
}

interface MessageAttachmentProps {
  onAttachmentSelect: (files: MediaFile[]) => void;
}

const MessageAttachment: React.FC<MessageAttachmentProps> = ({ onAttachmentSelect }) => {
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);

  const handleFilesSelected = (files: MediaFile[]) => {
    setSelectedFiles(files);
  };

  const handleSend = () => {
    const uploadedFiles = selectedFiles.filter(file => file.uploaded);
    if (uploadedFiles.length > 0) {
      onAttachmentSelect(uploadedFiles);
      setSelectedFiles([]);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="p-3 rounded-xl hover:bg-blue-50">
          <Paperclip className="w-5 h-5 text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Attachment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <MediaUpload 
            onFilesSelected={handleFilesSelected}
            maxFiles={3}
            acceptedTypes={['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*']}
          />
          
          {selectedFiles.length > 0 && (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSend}
                disabled={selectedFiles.filter(f => f.uploaded).length === 0}
              >
                Send ({selectedFiles.filter(f => f.uploaded).length})
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageAttachment;