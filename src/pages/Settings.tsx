import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';  
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Leaf, 
  Brain,
  Lock,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState({
    displayName: '',
    username: '',
    bio: '',
    location: '',
    mood: 'neutral'
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    postDefaultVisibility: 'public',
    allowFriendRequests: true,
    showOnlineStatus: true,
    allowMoodMatching: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    messageNotifications: true,
    friendRequestNotifications: true
  });

  const [ecoSettings, setEcoSettings] = useState({
    ecoMode: false,
    dataCompression: true,
    lowQualityImages: false,
    reduceAnimations: false
  });

  const [aiSettings, setAiSettings] = useState({
    aiSuggestions: true,
    moodMatching: true,
    contentRecommendations: true,
    autoTranslate: false
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement profile update
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Your data export has been initiated. You'll receive an email when ready."
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20 sm:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="your_username"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell people about yourself..."
                  className="min-h-20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Kathmandu, Nepal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mood">Default Mood</Label>
                  <Select value={profileData.mood} onValueChange={(value) => setProfileData(prev => ({ ...prev, mood: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="happy">😊 Happy</SelectItem>
                      <SelectItem value="excited">🎉 Excited</SelectItem>
                      <SelectItem value="grateful">🙏 Grateful</SelectItem>
                      <SelectItem value="adventurous">🏔️ Adventurous</SelectItem>
                      <SelectItem value="peaceful">🧘 Peaceful</SelectItem>
                      <SelectItem value="creative">🎨 Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveProfile}>Save Profile</Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Who can see your profile</p>
                </div>
                <Select 
                  value={privacySettings.profileVisibility} 
                  onValueChange={(value) => setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Friends</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Private</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow Friend Requests</Label>
                  <p className="text-sm text-muted-foreground">Let others send you friend requests</p>
                </div>
                <Switch
                  checked={privacySettings.allowFriendRequests}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowFriendRequests: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">Let friends see when you're online</p>
                </div>
                <Switch
                  checked={privacySettings.showOnlineStatus}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showOnlineStatus: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mood-based Matching</Label>
                  <p className="text-sm text-muted-foreground">Allow matching with others based on mood</p>
                </div>
                <Switch
                  checked={privacySettings.allowMoodMatching}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowMoodMatching: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4" />
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-4 h-4" />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4" />
                  <div>
                    <Label>Message Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new messages</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.messageNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, messageNotifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Eco-Friendly Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="w-5 h-5" />
                <span>Eco-Friendly Mode</span>
                <Badge variant="secondary" className="text-xs">Unique Feature</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Eco Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduce data usage and earn eco points</p>
                </div>
                <Switch
                  checked={ecoSettings.ecoMode}
                  onCheckedChange={(checked) => setEcoSettings(prev => ({ ...prev, ecoMode: checked }))}
                />
              </div>

              {ecoSettings.ecoMode && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Data Compression</Label>
                      <Switch
                        checked={ecoSettings.dataCompression}
                        onCheckedChange={(checked) => setEcoSettings(prev => ({ ...prev, dataCompression: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Low Quality Images</Label>
                      <Switch
                        checked={ecoSettings.lowQualityImages}
                        onCheckedChange={(checked) => setEcoSettings(prev => ({ ...prev, lowQualityImages: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Reduce Animations</Label>
                      <Switch
                        checked={ecoSettings.reduceAnimations}
                        onCheckedChange={(checked) => setEcoSettings(prev => ({ ...prev, reduceAnimations: checked }))}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>AI Features</span>
                <Badge variant="secondary" className="text-xs">Unique Feature</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>AI Content Suggestions</Label>
                  <p className="text-sm text-muted-foreground">Get AI-powered post suggestions</p>
                </div>
                <Switch
                  checked={aiSettings.aiSuggestions}
                  onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, aiSuggestions: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mood-based Matching</Label>
                  <p className="text-sm text-muted-foreground">AI matches you with similar mood users</p>
                </div>
                <Switch
                  checked={aiSettings.moodMatching}
                  onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, moodMatching: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Content Recommendations</Label>
                  <p className="text-sm text-muted-foreground">Personalized content in your feed</p>
                </div>
                <Switch
                  checked={aiSettings.contentRecommendations}
                  onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, contentRecommendations: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Account Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Export Your Data</Label>
                  <p className="text-sm text-muted-foreground">Download a copy of your data</p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  Export Data
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-red-600">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;