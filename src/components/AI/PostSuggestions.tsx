import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Sparkles, 
  RefreshCw, 
  Plus,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';

const mockSuggestions = [
  {
    id: '1',
    type: 'weather',
    title: 'Share today\'s beautiful weather',
    content: 'What a gorgeous day in Kathmandu! The clear skies and mountain views are perfect for sharing. How are you enjoying this beautiful weather? ☀️🏔️',
    reason: 'Based on current weather conditions',
    mood: 'happy',
    tags: ['weather', 'kathmandu', 'mountains']
  },
  {
    id: '2',
    type: 'cultural',
    title: 'Cultural moment suggestion',
    content: 'Today is a perfect day to share something about Nepali culture! Maybe a traditional recipe, a festival memory, or local customs that make Nepal special? 🇳🇵',
    reason: 'Based on your interest in cultural content',
    mood: 'grateful',
    tags: ['culture', 'nepal', 'tradition']
  },
  {
    id: '3',
    type: 'adventure',
    title: 'Adventure inspiration',
    content: 'Planning your next trek? Share your dream destination or a memorable hiking experience. The mountains are calling! 🥾🏔️',
    reason: 'Based on your adventurous mood',
    mood: 'adventurous',
    tags: ['trekking', 'adventure', 'himalayas']
  },
  {
    id: '4',
    type: 'community',
    title: 'Community engagement',
    content: 'What\'s one thing you love most about your local community? Share a local business, tradition, or person that makes your area special! 🏘️',
    reason: 'Trending in your area',
    mood: 'grateful',
    tags: ['community', 'local', 'support']
  }
];

const PostSuggestions = () => {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [loading, setLoading] = useState(false);

  const refreshSuggestions = async () => {
    setLoading(true);
    // TODO: Implement AI-powered suggestion refresh
    setTimeout(() => {
      // Simulate new suggestions
      setSuggestions(prev => [...prev.slice(1), {
        id: Date.now().toString(),
        type: 'personal',
        title: 'Personal reflection',
        content: 'What\'s one thing you\'re grateful for today? Sometimes sharing our gratitude can inspire others and brighten their day too! 🙏✨',
        reason: 'Based on your recent activity',
        mood: 'peaceful',
        tags: ['gratitude', 'reflection', 'mindfulness']
      }]);
      setLoading(false);
    }, 1000);
  };

  const useSuggestion = (suggestion: typeof mockSuggestions[0]) => {
    // TODO: Implement using suggestion for new post
    console.log('Using suggestion:', suggestion);
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '😊',
      excited: '🎉',
      grateful: '🙏',
      adventurous: '🏔️',
      peaceful: '🧘',
      creative: '🎨',
    };
    return moodEmojis[mood] || '✨';
  };

  const getTypeIcon = (type: string) => {
    const typeIcons: { [key: string]: any } = {
      weather: Calendar,
      cultural: Sparkles,
      adventure: MapPin,
      community: TrendingUp,
      personal: Brain
    };
    const Icon = typeIcons[type] || Brain;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-gray-100/50 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-pink-50/40 border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">AI Post Suggestions</span>
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
                  Beta
                </Badge>
              </CardTitle>
              <p className="text-xs text-gray-600 mt-0.5">
                Smart content ideas for you
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSuggestions}
            disabled={loading}
            className="rounded-xl hover:bg-blue-50 border-blue-200 h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {suggestions.slice(0, 2).map((suggestion) => (
          <div 
            key={suggestion.id}
            className="group p-4 bg-gradient-to-br from-white to-gray-50/50 rounded-xl hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-300 border border-gray-100 hover:border-blue-200/50 hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="p-1.5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{suggestion.title}</h4>
                  <Badge variant="outline" className="mt-1 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 text-xs">
                    {getMoodEmoji(suggestion.mood)} {suggestion.mood}
                  </Badge>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => useSuggestion(suggestion)}
                className="ml-2 text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 rounded-lg h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2">
              {suggestion.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {suggestion.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-white/60 text-gray-500 border-gray-200 px-2 py-0.5">
                    #{tag}
                  </Badge>
                ))}
                {suggestion.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-white/60 text-gray-400 border-gray-200 px-2 py-0.5">
                    +{suggestion.tags.length - 2}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-400 italic truncate max-w-[120px]">
                {suggestion.reason}
              </span>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-blue-200/50 hover:from-blue-100/80 hover:to-purple-100/80 hover:border-blue-300 text-blue-700 font-medium h-9 mt-3"
          onClick={refreshSuggestions}
          disabled={loading}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'More Ideas'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PostSuggestions;