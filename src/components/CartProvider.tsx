'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { CartContext, type CartContextType, type CartItem } from '@/lib/hooks/use-cart';

// Cart storage utilities
const CART_STORAGE_KEY = 'aurora_cart';

function getCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
}

// Generate unique ID for cart items
function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsRef = useRef<CartItem[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedItems = getCartFromStorage();
      setItems(storedItems);
    } catch (error) {
      console.error('Failed to refresh cart:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, qty: number = 1) => {
    try {
      // Fetch product details to get title and image
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const product = await response.json();
      
      const newItem: CartItem = {
        id: generateItemId(),
        product_id: productId,
        qty: qty,
        title: product.title || 'Unknown Product',
        image: product.images?.[0] || null
      };

      // Use functional update to avoid dependency on items
      setItems(prevItems => {
        const existingIndex = prevItems.findIndex(item => item.product_id === productId);
        
        if (existingIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...prevItems];
          updatedItems[existingIndex] = { ...updatedItems[existingIndex], qty: updatedItems[existingIndex].qty + qty };
          saveCartToStorage(updatedItems);
          return updatedItems;
        } else {
          // Add new item
          const updatedItems = [...prevItems, newItem];
          saveCartToStorage(updatedItems);
          return updatedItems;
        }
      });

      toast.success('Added to cart successfully!');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  }, []); // No dependencies needed

  const updateQuantity = useCallback(async (itemId: string, qty: number) => {
    try {
      setItems(prevItems => {
        const updatedItems = prevItems.map(item => 
          item.id === itemId 
            ? { ...item, qty }
            : item
        );
        saveCartToStorage(updatedItems);
        return updatedItems;
      });
      
      toast.success('Cart updated successfully!');
    } catch (error) {
      console.error('Update cart error:', error);
      toast.error('Failed to update cart');
    }
  }, []); // No dependencies needed

  const removeItem = useCallback(async (itemId: string) => {
    try {
      setItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.id !== itemId);
        saveCartToStorage(updatedItems);
        return updatedItems;
      });
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('Failed to remove item');
    }
  }, []); // No dependencies needed

  const clearCart = useCallback(async () => {
    try {
      setItems([]);
      saveCartToStorage([]);
      toast.success('Cart cleared successfully');
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    }
  }, []); // No dependencies needed

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  const value: CartContextType = {
    items,
    itemCount,
    subtotal: 0, // Will be calculated in cart page with fresh prices
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
