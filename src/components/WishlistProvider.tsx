'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { WishlistContext, type WishlistContextType, type WishlistItem } from '@/lib/hooks/use-wishlist';

// Wishlist storage utilities
const WISHLIST_STORAGE_KEY = 'aurora_wishlist';

function getWishlistFromStorage(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlistToStorage(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save wishlist to localStorage:', error);
  }
}

// Generate unique ID for wishlist items
function generateItemId(): string {
  return `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsRef = useRef<WishlistItem[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const refreshWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedItems = getWishlistFromStorage();
      setItems(storedItems);
    } catch (error) {
      console.error('Failed to refresh wishlist:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId: string) => {
    try {
      // Check if already in wishlist
      const existingItem = itemsRef.current.find(item => item.product_id === productId);
      if (existingItem) {
        toast.info('Product is already in your wishlist');
        return;
      }

      // Fetch product details to get title and image
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const product = await response.json();
      
      const newItem: WishlistItem = {
        id: generateItemId(),
        product_id: productId,
        title: product.title || 'Unknown Product',
        image: product.images?.[0] || null,
        price_cents: product.price_cents || 0,
        created_at: new Date().toISOString()
      };

      // Use functional update to avoid dependency on items
      setItems(prevItems => {
        const updatedItems = [...prevItems, newItem];
        saveWishlistToStorage(updatedItems);
        return updatedItems;
      });

      // Try to sync with server if user is authenticated
      try {
        const wishlistResponse = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        if (!wishlistResponse.ok) {
          console.warn('Failed to sync wishlist with server, but item added locally');
        }
      } catch (error) {
        console.warn('Failed to sync wishlist with server, but item added locally:', error);
      }

      toast.success('Added to wishlist successfully!');
    } catch (error) {
      console.error('Add to wishlist error:', error);
      toast.error('Failed to add to wishlist');
    }
  }, []); // No dependencies needed

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      setItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.product_id !== productId);
        saveWishlistToStorage(updatedItems);
        return updatedItems;
      });

      // Try to sync with server if user is authenticated
      try {
        const wishlistResponse = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });

        if (!wishlistResponse.ok) {
          console.warn('Failed to sync wishlist removal with server, but item removed locally');
        }
      } catch (error) {
        console.warn('Failed to sync wishlist removal with server, but item removed locally:', error);
      }
      
      toast.success('Removed from wishlist successfully');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Failed to remove from wishlist');
    }
  }, []); // No dependencies needed

  const isInWishlist = useCallback((productId: string) => {
    return itemsRef.current.some(item => item.product_id === productId);
  }, []); // No dependencies needed

  const clearWishlist = useCallback(async () => {
    try {
      setItems([]);
      saveWishlistToStorage([]);
      
      // Try to sync with server if user is authenticated
      try {
        // Clear all items from server wishlist
        const wishlistResponse = await fetch('/api/wishlist/clear', {
          method: 'DELETE',
        });

        if (!wishlistResponse.ok) {
          console.warn('Failed to sync wishlist clear with server, but cleared locally');
        }
      } catch (error) {
        console.warn('Failed to sync wishlist clear with server, but cleared locally:', error);
      }
      
      toast.success('Wishlist cleared successfully');
    } catch (error) {
      console.error('Clear wishlist error:', error);
      toast.error('Failed to clear wishlist');
    }
  }, []); // No dependencies needed

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const itemCount = items.length;

  const value: WishlistContextType = {
    items,
    itemCount,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    refreshWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
