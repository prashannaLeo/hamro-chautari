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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 dark:from-background dark:to-muted/10">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-20 sm:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl text-foreground">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="text-sm font-medium text-foreground">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Your display name"
                    className="bg-background border-border focus:ring-primary"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="your_username"
                    className="bg-background border-border focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell people about yourself..."
                  className="min-h-24 bg-background border-border focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-sm font-medium text-foreground">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Kathmandu, Nepal"
                    className="bg-background border-border focus:ring-primary"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="mood" className="text-sm font-medium text-foreground">Default Mood</Label>
                  <Select value={profileData.mood} onValueChange={(value) => setProfileData(prev => ({ ...prev, mood: value }))}>
                    <SelectTrigger className="bg-background border-border focus:ring-primary">
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

              <div className="pt-4">
                <Button onClick={handleSaveProfile} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 font-medium">
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-accent/5 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl text-foreground">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Shield className="w-5 h-5 text-secondary" />
                </div>
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Who can see your profile</p>
                </div>
                <Select 
                  value={privacySettings.profileVisibility} 
                  onValueChange={(value) => setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))}
                >
                  <SelectTrigger className="w-40 bg-background border-border focus:ring-primary">
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
          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl text-foreground">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
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
          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl text-foreground">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <span>Eco-Friendly Mode</span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Unique Feature</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
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
          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl text-foreground">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <span>AI Features</span>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Unique Feature</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
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
          <Card className="border-border bg-card shadow-soft border-destructive/20">
            <CardHeader className="bg-gradient-to-r from-destructive/5 to-red-500/5 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl text-destructive">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Lock className="w-5 h-5 text-destructive" />
                </div>
                <span>Account Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
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
      </main>
    </div>
  );
};

export default Settings;