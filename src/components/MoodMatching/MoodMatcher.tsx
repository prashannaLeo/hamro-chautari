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
  { value: 'happy', emoji: '😊', label: 'Happy', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'excited', emoji: '🎉', label: 'Excited', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'grateful', emoji: '🙏', label: 'Grateful', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'adventurous', emoji: '🏔️', label: 'Adventurous', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'peaceful', emoji: '🧘', label: 'Peaceful', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'creative', emoji: '🎨', label: 'Creative', color: 'bg-pink-50 text-pink-700 border-pink-200' },
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
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-0">
      <CardHeader className="pb-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-t-xl">
        <CardTitle className="flex items-center space-x-3">
          <Heart className="w-6 h-6 text-red-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Mood-based Matching</span>
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">Unique Feature</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Find people who share your current mood and vibe
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Mood Selection */}
        <div>
          <p className="text-sm font-semibold mb-4 text-gray-800">What's your current mood?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {moodOptions.map((mood) => (
              <Button
                key={mood.value}
                variant={selectedMood === mood.value ? "default" : "outline"}
                size="sm"
                className={`flex flex-col items-center space-y-2 h-auto py-3 px-4 rounded-xl transition-all duration-200 ${
                  selectedMood === mood.value 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => findMatches(mood.value)}
                disabled={loading}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Matches */}
        {selectedMood && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-800">
                  People feeling {getMoodData(selectedMood).emoji} {getMoodData(selectedMood).label}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => findMatches(selectedMood)}
                disabled={loading}
                className="rounded-xl hover:bg-blue-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                matches.map((match) => (
                  <div 
                    key={match.id}
                    className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-14 w-14 ring-2 ring-white shadow-md">
                        <AvatarImage src={match.avatar} alt={match.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                          {match.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-800">{match.name}</h4>
                          <Badge variant="outline" className={getMoodData(match.mood).color}>
                            {getMoodData(match.mood).emoji} {getMoodData(match.mood).label}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-600 font-semibold">
                              {match.matchScore}% match
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          @{match.username} • {match.location}
                        </p>
                        
                        <p className="text-sm mb-3 text-gray-700 italic">"{match.recentActivity}"</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {match.mutualInterests.slice(0, 3).map((interest) => (
                              <Badge key={interest} variant="secondary" className="text-xs bg-white/80 text-gray-600 border-gray-200">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => connectWithUser(match.id)}
                              className="rounded-xl hover:bg-blue-50 border-blue-200 text-blue-600"
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Connect
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => startChat(match.id)}
                              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
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