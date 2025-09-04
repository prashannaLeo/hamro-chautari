import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  File,
  Camera,
  Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'file';
  uploadProgress: number;
  uploaded: boolean;
}

interface MediaUploadProps {
  onFilesSelected: (files: MediaFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onFilesSelected,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*'],
  maxSize = 50 * 1024 * 1024, // 50MB
  className = ''
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const getFileType = (file: File): 'image' | 'video' | 'file' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'file';
  };

  const getFileIcon = (type: 'image' | 'video' | 'file') => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      default: return File;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const { file, errors } = rejection;
      errors.forEach((error: any) => {
        toast({
          title: "Upload Error",
          description: `${file.name}: ${error.message}`,
          variant: "destructive"
        });
      });
    });

    // Process accepted files
    const newFiles: MediaFile[] = acceptedFiles.slice(0, maxFiles - files.length).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      type: getFileType(file),
      uploadProgress: 0,
      uploaded: false
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);

    // Simulate upload progress
    newFiles.forEach((mediaFile, index) => {
      simulateUpload(mediaFile.id, index * 500);
    });
  }, [files, maxFiles, onFilesSelected]);

  const simulateUpload = (fileId: string, delay: number) => {
    setTimeout(() => {
      setUploading(true);
      const interval = setInterval(() => {
        setFiles(prev => prev.map(file => {
          if (file.id === fileId && !file.uploaded) {
            const newProgress = Math.min(file.uploadProgress + Math.random() * 30, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                setFiles(prev => prev.map(f => 
                  f.id === fileId ? { ...f, uploaded: true } : f
                ));
                setUploading(false);
              }, 200);
              return { ...file, uploadProgress: 100 };
            }
            return { ...file, uploadProgress: newProgress };
          }
          return file;
        }));
      }, 100);
    }, delay);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({
      ...acc,
      [type]: []
    }), {}),
    maxSize,
    maxFiles: maxFiles - files.length,
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <motion.div
            animate={{ 
              rotate: isDragActive ? 180 : 0,
              scale: isDragActive ? 1.2 : 1 
            }}
            transition={{ duration: 0.3 }}
            className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
          >
            {isDragActive ? (
              <Upload className="w-8 h-8 text-primary" />
            ) : (
              <Camera className="w-8 h-8 text-primary" />
            )}
          </motion.div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Media'}
            </h3>
            <p className="text-muted-foreground">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Max {maxFiles} files, up to {Math.round(maxSize / (1024 * 1024))}MB each
            </p>
          </div>
        </motion.div>
      </div>

      {/* File Preview Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {files.map((mediaFile) => {
              const Icon = getFileIcon(mediaFile.type);
              
              return (
                <motion.div
                  key={mediaFile.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative group aspect-square bg-muted rounded-lg overflow-hidden"
                >
                  {/* File Preview */}
                  {mediaFile.type === 'image' && mediaFile.preview ? (
                    <img
                      src={mediaFile.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Icon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Upload Status Overlay */}
                  {!mediaFile.uploaded && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                    </div>
                  )}

                  {/* Success Overlay */}
                  {mediaFile.uploaded && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-secondary-foreground" />
                    </motion.div>
                  )}

                  {/* Remove Button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute top-2 left-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(mediaFile.id)}
                  >
                    <X className="w-4 h-4 text-destructive-foreground" />
                  </motion.button>

                  {/* File Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-white text-xs truncate">
                      {mediaFile.file.name}
                    </div>
                    {!mediaFile.uploaded && (
                      <Progress 
                        value={mediaFile.uploadProgress} 
                        className="mt-1 h-1"
                      />
                    )}
                  </div>

                  {/* File Type Badge */}
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-8 text-xs"
                  >
                    {mediaFile.type}
                  </Badge>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Summary */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {files.filter(f => f.uploaded).length} / {files.length} uploaded
            </Badge>
            {uploading && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFiles([]);
              onFilesSelected([]);
            }}
          >
            Clear All
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default MediaUpload;