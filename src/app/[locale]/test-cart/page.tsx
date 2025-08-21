import { AddToCartButton } from '@/components/products/AddToCartButton';

export default function TestCartPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cart Functionality Test</h1>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Product 1</h2>
            <p className="text-muted-foreground mb-4">This is a test product to verify cart functionality</p>
            <AddToCartButton productId="test-product-1" />
          </div>
          
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Product 2</h2>
            <p className="text-muted-foreground mb-4">Another test product</p>
            <AddToCartButton productId="test-product-2" />
          </div>
          
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Disabled Product</h2>
            <p className="text-muted-foreground mb-4">This product is out of stock</p>
            <AddToCartButton productId="disabled-product" disabled={true} />
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Click "Add to cart" on any product</li>
            <li>Check the browser console for debug logs</li>
            <li>Look for toast notifications</li>
            <li>Check if cookies are being set</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
