'use client';

import { useCart } from '@/lib/hooks/use-cart';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';
import { useEffect, useState, useMemo, useCallback } from 'react';

interface CartItemWithPrice {
  id: string;
  product_id: string;
  qty: number;
  title: string;
  image?: string;
  unit_price_cents: number;
  total_cents: number;
}

export default function CartPage() {
  const { items, itemCount, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const [itemsWithPrices, setItemsWithPrices] = useState<CartItemWithPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  // Memoize product IDs to prevent unnecessary API calls
  const productIds = useMemo(() => 
    items.map(item => item.product_id).sort(), 
    [items]
  );

  // Fetch fresh prices for cart items only when product IDs change
  useEffect(() => {
    if (productIds.length === 0) {
      setItemsWithPrices([]);
      setSubtotal(0);
      return;
    }

    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      try {
        // Fetch prices for all products in one API call
        const response = await fetch('/api/products/prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds })
        });

        if (response.ok) {
          const products = await response.json();
          
          // Combine cart items with fresh prices
          const itemsWithPrices = items.map(item => {
            const product = products.find((p: any) => p.id === item.product_id);
            const unitPrice = product?.price_cents || 0;
            return {
              ...item,
              unit_price_cents: unitPrice,
              total_cents: unitPrice * item.qty
            };
          });

          setItemsWithPrices(itemsWithPrices);
          setSubtotal(itemsWithPrices.reduce((sum, item) => sum + item.total_cents, 0));
        }
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();
  }, [productIds, items]); // Only re-run when product IDs or items change

  // Memoize cart operations to prevent unnecessary re-renders
  const handleUpdateQuantity = useCallback(async (itemId: string, qty: number) => {
    await updateQuantity(itemId, qty);
  }, [updateQuantity]);

  const handleRemoveItem = useCallback(async (itemId: string) => {
    await removeItem(itemId);
  }, [removeItem]);

  const handleClearCart = useCallback(async () => {
    await clearCart();
  }, [clearCart]);

  if (isLoading || isLoadingPrices) {
    return (
      <div className="px-6 sm:px-8 md:px-12 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-md">
                <div className="h-24 w-24 bg-muted rounded-md"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-8 md:px-12 py-8">
      <h1 className="text-2xl font-semibold mb-6">Your cart ({itemCount} items)</h1>
      
      {itemsWithPrices.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium text-muted-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ul className="divide-y rounded-md border">
              {itemsWithPrices.map((item) => (
                <li key={item.id} className="flex gap-4 p-4">
                  <div className="h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        width={96} 
                        height={96} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${(item.unit_price_cents / 100).toFixed(2)} each
                    </p>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.qty - 1))}
                        disabled={item.qty <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-12 text-center text-sm font-medium">
                        {item.qty}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.qty + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${(item.total_cents / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.qty} × ${(item.unit_price_cents / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-destructive hover:text-destructive"
              >
                Clear Cart
              </Button>
              
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>
          
          <aside className="rounded-md border p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold">${(subtotal / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              Secure checkout powered by Stripe
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}


