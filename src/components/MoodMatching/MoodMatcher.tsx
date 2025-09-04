import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Users, 
  MessageCircle, 
  RefreshCw,
  Sparkles,
  UserPlus
} from 'lucide-react';

const moodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'excited', emoji: '🎉', label: 'Excited', color: 'bg-orange-100 text-orange-800' },
  { value: 'grateful', emoji: '🙏', label: 'Grateful', color: 'bg-green-100 text-green-800' },
  { value: 'adventurous', emoji: '🏔️', label: 'Adventurous', color: 'bg-blue-100 text-blue-800' },
  { value: 'peaceful', emoji: '🧘', label: 'Peaceful', color: 'bg-purple-100 text-purple-800' },
  { value: 'creative', emoji: '🎨', label: 'Creative', color: 'bg-pink-100 text-pink-800' },
];

const mockMatches = [
  {
    id: '1',
    name: 'Amit Shrestha',
    username: 'amit_shrestha',
    avatar: '',
    mood: 'adventurous',
    location: 'Pokhara, Nepal',
    recentActivity: 'Just completed Poon Hill trek!',
    matchScore: 95,
    mutualInterests: ['trekking', 'photography', 'mountains']
  },
  {
    id: '2',
    name: 'Rashika Maharjan',
    username: 'rashika_m',
    avatar: '',
    mood: 'adventurous',
    location: 'Kathmandu, Nepal',
    recentActivity: 'Planning next weekend adventure',
    matchScore: 88,
    mutualInterests: ['hiking', 'nature', 'adventure']
  },
  {
    id: '3',
    name: 'Suresh Tamang',
    username: 'suresh_tamang',
    avatar: '',
    mood: 'adventurous',
    location: 'Langtang, Nepal',
    recentActivity: 'Mountain guide sharing trail tips',
    matchScore: 92,
    mutualInterests: ['mountaineering', 'guiding', 'culture']
  }
];

const MoodMatcher = () => {
  const [selectedMood, setSelectedMood] = useState('adventurous');
  const [matches, setMatches] = useState(mockMatches);
  const [loading, setLoading] = useState(false);

  const findMatches = async (mood: string) => {
    setLoading(true);
    setSelectedMood(mood);
    
    // TODO: Implement AI-powered mood matching
    setTimeout(() => {
      // Filter matches based on selected mood
      const filteredMatches = mockMatches.map(match => ({
        ...match,
        mood,
        matchScore: Math.floor(Math.random() * 20) + 80 // Random score between 80-100
      }));
      setMatches(filteredMatches);
      setLoading(false);
    }, 1000);
  };

  const getMoodData = (moodValue: string) => {
    return moodOptions.find(mood => mood.value === moodValue) || moodOptions[0];
  };

  const connectWithUser = (userId: string) => {
    // TODO: Implement connection request
    console.log('Connecting with user:', userId);
  };

  const startChat = (userId: string) => {
    // TODO: Implement chat initiation
    console.log('Starting chat with user:', userId);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5" />
          <span>Mood-based Matching</span>
          <Badge variant="secondary" className="text-xs">Unique Feature</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Find people who share your current mood and vibe
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selection */}
        <div>
          <p className="text-sm font-medium mb-3">What's your current mood?</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {moodOptions.map((mood) => (
              <Button
                key={mood.value}
                variant={selectedMood === mood.value ? "default" : "outline"}
                size="sm"
                className="flex flex-col items-center space-y-1 h-auto py-2"
                onClick={() => findMatches(mood.value)}
                disabled={loading}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span className="text-xs">{mood.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Matches */}
        {selectedMood && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  People feeling {getMoodData(selectedMood).emoji} {getMoodData(selectedMood).label}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => findMatches(selectedMood)}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                matches.map((match) => (
                  <div 
                    key={match.id}
                    className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={match.avatar} alt={match.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {match.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{match.name}</h4>
                          <Badge variant="outline" className={getMoodData(match.mood).color}>
                            {getMoodData(match.mood).emoji} {getMoodData(match.mood).label}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-primary" />
                            <span className="text-xs text-primary font-medium">
                              {match.matchScore}% match
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-1">
                          @{match.username} • {match.location}
                        </p>
                        
                        <p className="text-sm mb-2">"{match.recentActivity}"</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {match.mutualInterests.slice(0, 3).map((interest) => (
                              <Badge key={interest} variant="secondary" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => connectWithUser(match.id)}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Connect
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => startChat(match.id)}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodMatcher;