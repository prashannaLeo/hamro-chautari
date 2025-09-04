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
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Brain className="w-5 h-5" />
            <span>AI Post Suggestions</span>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSuggestions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered content ideas based on your interests and current trends
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.slice(0, 2).map((suggestion) => (
          <div 
            key={suggestion.id}
            className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getTypeIcon(suggestion.type)}
                <span className="font-medium text-sm">{suggestion.title}</span>
                <Badge variant="outline" className="text-xs">
                  {getMoodEmoji(suggestion.mood)} {suggestion.mood}
                </Badge>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => useSuggestion(suggestion)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              {suggestion.content}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {suggestion.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {suggestion.reason}
              </span>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={refreshSuggestions}
          disabled={loading}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Get More Suggestions'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PostSuggestions;