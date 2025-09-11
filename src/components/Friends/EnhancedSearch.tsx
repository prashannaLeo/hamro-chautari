import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, CornerDownLeft, User, FileText, Clock, UserPlus } from 'lucide-react';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';
import { cn } from '@/lib/utils';

interface EnhancedSearchProps {
  onUserSelect?: (user: any) => void;
  onPostSelect?: (post: any) => void;
  placeholder?: string;
  className?: string;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onUserSelect,
  onPostSelect,
  placeholder = "Search friends, posts, or initials...",
  className
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    userSuggestions, 
    postSuggestions, 
    recentSearches,
    loading, 
    search, 
    addRecentSearch 
  } = useEnhancedSearch();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query.trim());
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalSuggestions = userSuggestions.length + postSuggestions.length + (query.trim() === '' ? recentSearches.length : 0);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalSuggestions);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev <= 0 ? totalSuggestions - 1 : prev - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleEnterPress();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleEnterPress = () => {
    if (selectedIndex >= 0) {
      // Handle selected suggestion
      const totalUsers = userSuggestions.length;
      const totalPosts = postSuggestions.length;
      
      if (selectedIndex < totalUsers) {
        // Selected user
        const user = userSuggestions[selectedIndex];
        handleUserSelect(user);
      } else if (selectedIndex < totalUsers + totalPosts) {
        // Selected post
        const post = postSuggestions[selectedIndex - totalUsers];
        handlePostSelect(post);
      } else {
        // Selected recent search
        const recentIndex = selectedIndex - totalUsers - totalPosts;
        const recentSearch = recentSearches[recentIndex];
        setQuery(recentSearch.query);
        search(recentSearch.query);
      }
    } else if (query.trim()) {
      // Manual search
      search(query.trim());
      addRecentSearch(query.trim());
    }
  };

  const handleUserSelect = (user: any) => {
    addRecentSearch(user.display_name || user.username);
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onUserSelect?.(user);
  };

  const handlePostSelect = (post: any) => {
    addRecentSearch(post.content.substring(0, 30));
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onPostSelect?.(post);
  };

  const handleRecentSearchSelect = (recentSearch: any) => {
    setQuery(recentSearch.query);
    search(recentSearch.query);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="pl-12 pr-12 h-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
        <Button
          onClick={(e) => { e.preventDefault(); handleEnterPress(); }}
          size="sm"
          variant="ghost"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-primary hover:text-white rounded-lg"
          type="button"
        >
          <CornerDownLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-0">
            {/* Loading State */}
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Searching...</p>
              </div>
            )}

            {/* Recent Searches (when no query) */}
            {!query.trim() && recentSearches.length > 0 && (
              <div className="border-b border-gray-100 last:border-b-0">
                <div className="p-3 bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Recent Searches
                </div>
                {recentSearches.map((recent, index) => (
                  <div
                    key={recent.id}
                    onClick={() => handleRecentSearchSelect(recent)}
                    className={cn(
                      "flex items-center space-x-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors",
                      selectedIndex === userSuggestions.length + postSuggestions.length + index && "bg-blue-50"
                    )}
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{recent.query}</span>
                  </div>
                ))}
              </div>
            )}

            {/* User Suggestions */}
            {userSuggestions.length > 0 && (
              <div className="border-b border-gray-100 last:border-b-0">
                <div className="p-3 bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  People
                </div>
                {userSuggestions.map((user, index) => (
                  <div
                    key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={cn(
                    "flex items-center space-x-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors",
                    selectedIndex === index && "bg-blue-50"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUserSelect(user); }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || ''} alt={user.display_name || user.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {(user.display_name || user.username).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.display_name || user.username}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUserSelect(user); }}
                      aria-label="Add friend"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Post Suggestions */}
            {postSuggestions.length > 0 && (
              <div className="border-b border-gray-100 last:border-b-0">
                <div className="p-3 bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Posts
                </div>
                {postSuggestions.map((post, index) => (
                  <div
                    key={post.id}
                    onClick={() => handlePostSelect(post)}
                    className={cn(
                      "flex items-center space-x-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors",
                      selectedIndex === userSuggestions.length + index && "bg-blue-50"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.profiles?.avatar_url || ''} alt={post.profiles?.display_name || post.profiles?.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {(post.profiles?.display_name || post.profiles?.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        {post.profiles?.display_name || post.profiles?.username}
                      </p>
                      <p className="text-sm line-clamp-2">{post.content}</p>
                    </div>
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {query.trim() && !loading && userSuggestions.length === 0 && postSuggestions.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs">Try searching for a different name or keyword</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSearch;