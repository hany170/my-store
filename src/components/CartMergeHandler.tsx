'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function CartMergeHandler() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Attempt to merge guest cart into user cart
          const response = await fetch('/api/cart/merge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Cart merge result:', result.message);
            
            // Refresh the page to show the merged cart
            router.refresh();
          } else {
            console.error('Failed to merge cart');
          }
        } catch (error) {
          console.error('Error merging cart:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // This component doesn't render anything
  return null;
}
