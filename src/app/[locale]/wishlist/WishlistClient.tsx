'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Package, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { useTranslations } from 'next-intl';

interface WishlistClientProps {
  locale: string;
}

export function WishlistClient({ locale }: WishlistClientProps) {
  const t = useTranslations('wishlist');
  const { items, removeFromWishlist, clearWishlist } = useWishlist();

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      // Add to cart logic here - you can reuse your existing cart functionality
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId, 
          qty: 1 
        }),
      });

      if (response.ok) {
        // Show success message or redirect to cart
        window.location.href = `/${locale}/cart`;
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t('empty')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('emptyDescription')}
        </p>
        <Link href={`/${locale}/products`}>
          <Button>
            {t('browseProducts')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">
          {t('itemsInWishlist', { count: items.length })}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={clearWishlist}
          className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          {t('clearAll')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          return (
            <div key={item.id} className="group border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-muted">
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    width={400} 
                    height={400} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-muted-foreground">
                    <Package className="h-12 w-12" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-medium text-foreground line-clamp-2">
                  {item.title}
                </h3>

                {/* Price */}
                {item.price_cents && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">
                      ${(item.price_cents / 100).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleAddToCart(item.product_id)}
                    className="flex-1"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('addToCart')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFromWishlist(item.product_id)}
                    className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {t('itemsInWishlist', { count: items.length })}
          </p>
          
          <Link href={`/${locale}/products`}>
            <Button variant="outline">
              {t('continueShopping')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
