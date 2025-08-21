"use client";

import { useEffect } from 'react';

interface SearchAnalyticsProps {
  searchQuery?: string;
  resultsCount?: number;
  searchTime?: number;
}

export function SearchAnalytics({ 
  searchQuery, 
  resultsCount = 0, 
  searchTime = 0 
}: SearchAnalyticsProps) {
  
  // Track search analytics
  useEffect(() => {
    if (searchQuery && typeof window !== 'undefined') {
      // In a real app, you would send this to your analytics service
      const searchData = {
        query: searchQuery,
        resultsCount,
        searchTime,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Log to console for development (replace with actual analytics)
      console.log('Search Analytics:', searchData);

      // You could send this to Google Analytics, Mixpanel, etc.
      // Example: gtag('event', 'search', searchData);
      
      // Store in localStorage for basic tracking
      const searches = JSON.parse(localStorage.getItem('searchAnalytics') || '[]');
      searches.push(searchData);
      
      // Keep only last 100 searches
      if (searches.length > 100) {
        searches.splice(0, searches.length - 100);
      }
      
      localStorage.setItem('searchAnalytics', JSON.stringify(searches));
    }
  }, [searchQuery, resultsCount, searchTime]);

  // This component doesn't render anything visible
  // It's just for tracking search analytics
  return null;
}




