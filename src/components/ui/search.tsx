"use client";

import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface SearchProps {
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'header' | 'hero';
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export function Search({ 
  placeholder, 
  className = '', 
  variant = 'default',
  showSuggestions = true,
  autoFocus = false 
}: SearchProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Handle search submission
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', searchQuery.trim());
    params.delete('page'); // Reset to first page when searching
    
    const path = variant === 'hero' ? `/${locale}/products` : `/${locale}/products`;
    router.push(`${path}?${params.toString()}`);
  }, [router, searchParams, locale, variant]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
    setShowSuggestionsList(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
    setShowSuggestionsList(false);
    inputRef.current?.blur();
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestionsList(false);
    
    if (variant === 'hero') {
      router.push(`/${locale}/products`);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      params.delete('page');
      router.push(`/${locale}/products?${params.toString()}`);
    }
  };

  // Generate search suggestions based on query
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestionsList(false);
      return;
    }

    // Generate some basic suggestions (in a real app, these would come from an API)
    const mockSuggestions = [
      `${debouncedQuery} products`,
      `${debouncedQuery} collection`,
      `${debouncedQuery} items`,
      `Best ${debouncedQuery}`,
      `${debouncedQuery} deals`
    ];
    
    setSuggestions(mockSuggestions);
    setShowSuggestionsList(true);
  }, [debouncedQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  const baseClasses = "relative w-full";
  const inputClasses = {
    default: "w-full pl-10 pr-10 py-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
    header: "w-full pl-10 pr-10 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
    hero: "w-full pl-12 pr-12 py-4 text-base bg-background border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-lg"
  };

  const buttonClasses = {
    default: "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors",
    header: "absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors",
    hero: "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
  };

  const iconClasses = {
    default: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground",
    header: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground",
    hero: "absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground"
  };

  return (
    <div className={`${baseClasses} ${className}`} ref={suggestionsRef}>
      <form onSubmit={handleSubmit} className="relative">
        <SearchIcon className={iconClasses[variant]} />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('searchPlaceholder')}
          className={inputClasses[variant]}
          autoFocus={autoFocus}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={buttonClasses[variant]}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {isSearching && (
          <div className={buttonClasses[variant]}>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </form>

      {/* Search Suggestions */}
      {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center gap-3">
                <SearchIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}






