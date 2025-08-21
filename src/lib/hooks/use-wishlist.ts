'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  product_id: string;
  title: string;
  image?: string;
  price_cents?: number;
  created_at: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

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

export { WishlistContext, type WishlistContextType, type WishlistItem };
