import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMoodMatcher } from '@/hooks/useMoodMatcher';
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

const MoodMatcher = () => {
  const [selectedMood, setSelectedMood] = useState('adventurous');
  const { matches, loading, findMatches } = useMoodMatcher();

  const handleFindMatches = (mood: string) => {
    setSelectedMood(mood);
    findMatches(mood);
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
          <p className="text-base font-semibold mb-4 text-gray-900">What's your current mood?</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {moodOptions.map((mood) => (
              <Button
                key={mood.value}
                variant={selectedMood === mood.value ? "default" : "outline"}
                size="sm"
                className={`flex flex-col items-center justify-center space-y-1.5 h-auto py-3 px-2 sm:px-4 rounded-xl transition-all duration-200 ${
                  selectedMood === mood.value 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-102'
                }`}
                onClick={() => handleFindMatches(mood.value)}
                disabled={loading}
              >
                <span className="text-xl sm:text-2xl">{mood.emoji}</span>
                <span className="text-xs sm:text-sm font-medium text-center leading-tight">{mood.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Matches */}
        {selectedMood && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  People feeling
                </span>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span className="text-lg">{getMoodData(selectedMood).emoji}</span>
                  <span className="hidden sm:inline font-semibold text-gray-900 text-sm">
                    {getMoodData(selectedMood).label}
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleFindMatches(selectedMood)}
                disabled={loading}
                className="rounded-xl hover:bg-blue-50 h-8 w-8 p-0 flex-shrink-0"
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
                    className="p-3 sm:p-4 bg-gradient-to-r from-white to-blue-50/50 rounded-xl hover:from-blue-50/70 hover:to-purple-50/50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-lg"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-white shadow-md flex-shrink-0">
                        <AvatarImage src={match.avatar} alt={match.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm sm:text-base">
                          {match.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                        {/* Header with name, mood, and match score */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{match.name}</h4>
                                <Badge variant="outline" className={`${getMoodData(match.mood).color} text-xs flex-shrink-0 w-fit`}>
                                  {getMoodData(match.mood).emoji} <span className="hidden sm:inline ml-1">{getMoodData(match.mood).label}</span>
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                @{match.username} • {match.location}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              <span className="text-xs sm:text-sm text-blue-600 font-bold">
                                {match.matchScore}%
                              </span>
                              <span className="hidden sm:inline text-xs text-blue-600 font-medium">match</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bio */}
                        {match.bio && (
                          <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                            "{match.bio}"
                          </p>
                        )}
                        
                        {/* Interests and Actions */}
                        <div className="space-y-3">
                          {/* Interests */}
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {match.mutualInterests.slice(0, 3).map((interest) => (
                              <Badge key={interest} variant="secondary" className="text-xs bg-white/80 text-gray-600 border-gray-200 px-2 py-0.5">
                                {interest}
                              </Badge>
                            ))}
                            {match.mutualInterests.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500 border-gray-200 px-2 py-0.5">
                                +{match.mutualInterests.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => connectWithUser(match.id)}
                              className="flex-1 sm:flex-none rounded-xl hover:bg-blue-50 border-blue-200 text-blue-600 h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Connect
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => startChat(match.id)}
                              className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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