"use client";

import { Search, TrendingUp, Clock, Tag } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';

interface SearchSuggestionsProps {
  className?: string;
  showPopular?: boolean;
  showRecent?: boolean;
  maxSuggestions?: number;
}

export function SearchSuggestions({ 
  className = '', 
  showPopular = true, 
  showRecent = true,
  maxSuggestions = 5 
}: SearchSuggestionsProps) {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Mock popular searches - in a real app, these would come from analytics
  const popularSearches = [
    'electronics',
    'clothing',
    'home decor',
    'books',
    'sports',
    'beauty',
    'toys',
    'garden'
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const recent = localStorage.getItem('recentSearches');
      if (recent) {
        try {
          const parsed = JSON.parse(recent);
          setRecentSearches(Array.isArray(parsed) ? parsed.slice(0, maxSuggestions) : []);
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, [maxSuggestions]);

  // Save search to recent searches
  const saveSearch = (query: string) => {
    if (typeof window !== 'undefined') {
      const recent = localStorage.getItem('recentSearches');
      let searches = recent ? JSON.parse(recent) : [];
      
      // Remove if already exists and add to front
      searches = searches.filter((s: string) => s !== query);
      searches.unshift(query);
      
      // Keep only the last 10 searches
      searches = searches.slice(0, 10);
      
      localStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches.slice(0, maxSuggestions));
    }
  };

  // Handle search suggestion click
  const handleSuggestionClick = (query: string) => {
    saveSearch(query);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', query);
    params.delete('page');
    
    router.push(`/${locale}/products?${params.toString()}`);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentSearches');
      setRecentSearches([]);
    }
  };

  if (!showPopular && !showRecent) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Popular Searches */}
      {showPopular && popularSearches.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Popular Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.slice(0, maxSuggestions).map((search) => (
              <button
                key={search}
                onClick={() => handleSuggestionClick(search)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
              >
                <Search className="h-3 w-3" />
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {showRecent && recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Searches
            </h3>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <button
                key={search}
                onClick={() => handleSuggestionClick(search)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
              >
                <Search className="h-3 w-3" />
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Categories */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          Quick Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books'].map((category) => (
            <button
              key={category}
              onClick={() => router.push(`/${locale}/products?category=${category.toLowerCase().replace(/\s+/g, '-')}`)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}




