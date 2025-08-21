'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/hooks/use-wishlist';
import { Button } from '@/components/ui';
import { useTranslations } from 'next-intl';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function WishlistButton({ 
  productId, 
  className = '',
  variant = 'outline',
  size = 'default'
}: WishlistButtonProps) {
  const t = useTranslations('product');
  const [isLoading, setIsLoading] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleToggleWishlist = async () => {
    try {
      setIsLoading(true);
      
      const inWishlist = isInWishlist(productId);
      
      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      // Toast notification is handled by the provider
    } finally {
      setIsLoading(false);
    }
  };

  const inWishlist = isInWishlist(productId);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`transition-all duration-200 ${
        inWishlist 
          ? 'text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' 
          : 'hover:border-red-300 hover:text-red-600'
      } ${className}`}
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-200 ${
          inWishlist ? 'fill-current' : ''
        }`} 
      />
      <span className="ml-2">
        {inWishlist ? t('removeFromWishlist') : t('wishlist')}
      </span>
    </Button>
  );
}
