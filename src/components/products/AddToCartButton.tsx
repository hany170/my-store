"use client";
import { useState } from 'react';
import { useCart } from '@/lib/hooks/use-cart';

export function AddToCartButton({productId, disabled}:{productId: string; disabled?: boolean}){
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  
  const handleAddToCart = async () => {
    if (disabled) return;
    
    setIsAdding(true);
    try {
      await addToCart(productId, 1);
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <button 
      onClick={handleAddToCart} 
      disabled={disabled || isAdding} 
      className="inline-flex items-center justify-center rounded-md bg-gray-900 text-white px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
    >
      {isAdding ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding…
        </>
      ) : (
        'Add to cart'
      )}
    </button>
  );
}


