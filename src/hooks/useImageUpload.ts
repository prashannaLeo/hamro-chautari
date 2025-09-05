import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface UploadResult {
  url: string;
  path: string;
}

export const useImageUpload = (bucket: 'posts' | 'stories' | 'messages' = 'posts') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  const uploadImage = async (file: File): Promise<UploadResult | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      // Validate file
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        throw new Error('Please select an image or video file');
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        path: fileName
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await uploadImage(file);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  };

  return {
    uploadImage,
    uploadMultiple,
    loading,
    error
  };
};