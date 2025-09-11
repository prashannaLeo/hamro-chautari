import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Save, X } from 'lucide-react';
import { useProfile, Profile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
}

const moods = [
  { value: 'happy', label: 'Happy 😊' },
  { value: 'excited', label: 'Excited 🎉' },
  { value: 'grateful', label: 'Grateful 🙏' },
  { value: 'adventurous', label: 'Adventurous 🏔️' },
  { value: 'peaceful', label: 'Peaceful 🧘' },
  { value: 'creative', label: 'Creative 🎨' },
  { value: 'neutral', label: 'Neutral' },
];

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onOpenChange, profile }) => {
  const { updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    mood: profile?.mood || 'neutral',
    avatar_url: profile?.avatar_url || ''
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        mood: profile.mood || 'neutral',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        display_name: formData.display_name || null,
        bio: formData.bio || null,
        mood: formData.mood || null,
        avatar_url: formData.avatar_url || null
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar_url} alt="Profile" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {(formData.display_name || profile?.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute bottom-0 right-0 h-8 w-8 p-0 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="w-full">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar_url}
                onChange={(e) => handleInputChange('avatar_url', e.target.value)}
              />
            </div>
          </div>

          {/* Display Name */}
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              placeholder="Your display name"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell people about yourself..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
            />
          </div>

          {/* Mood */}
          <div>
            <Label>Current Mood</Label>
            <Select value={formData.mood} onValueChange={(value) => handleInputChange('mood', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {moods.map((mood) => (
                  <SelectItem key={mood.value} value={mood.value}>
                    {mood.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;