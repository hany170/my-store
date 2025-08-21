'use client';

import { useCart } from '@/lib/hooks/use-cart';
import { Button } from '@/components/ui';

export default function TestCartPage() {
  const { items, itemCount, subtotal, addToCart, clearCart } = useCart();

  const testProducts = [
    { id: 'test-1', name: 'Test Product 1' },
    { id: 'test-2', name: 'Test Product 2' },
    { id: 'test-3', name: 'Test Product 3' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Cart Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Test Controls */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Controls</h2>
          
          <div className="space-y-2">
            {testProducts.map((product) => (
              <Button
                key={product.id}
                onClick={() => addToCart(product.id)}
                className="w-full"
              >
                Add {product.name}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={clearCart}
            variant="destructive"
            className="w-full"
          >
            Clear Cart
          </Button>
        </div>

        {/* Cart Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cart Status</h2>
          
          <div className="p-4 border rounded-lg space-y-2">
            <p><strong>Items in cart:</strong> {itemCount}</p>
            <p><strong>Subtotal:</strong> ${(subtotal / 100).toFixed(2)}</p>
            <p><strong>Cart items:</strong> {items.length}</p>
          </div>
          
          {items.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Cart Items:</h3>
              {items.map((item) => (
                <div key={item.id} className="p-2 border rounded text-sm">
                  <p><strong>{item.title}</strong></p>
                  <p>Qty: {item.qty}</p>
                  <p>Product ID: {item.product_id}</p>
                  {item.image && <p>Has Image: Yes</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">How to test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Add some test products to your cart</li>
          <li>Check that the cart count updates in the header</li>
          <li>Go to the cart page to see the full cart</li>
          <li>Try signing in/out to test cart merging</li>
          <li>Check that guest carts persist across page refreshes</li>
        </ol>
      </div>
    </div>
  );
}
