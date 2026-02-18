'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ShoppingBag,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Image from 'next/image';

interface CartItemWithPrice {
  id: string;
  product_id: string;
  qty: number;
  title: string;
  image?: string;
  unit_price_cents: number;
  total_cents: number;
}

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, isLoading } = useCart();
  const [itemsWithPrices, setItemsWithPrices] = useState<CartItemWithPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });

  // Fetch cart items with prices
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      try {
        const productIds = items.map(item => item.product_id);
        const response = await fetch('/api/products/prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds })
        });

        if (response.ok) {
          const products = await response.json();
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
          const newSubtotal = itemsWithPrices.reduce((sum, item) => sum + item.total_cents, 0);
          setSubtotal(newSubtotal);
          
          // Calculate shipping and tax
          const newShipping = newSubtotal > 5000 ? 0 : 500; // Free shipping over $50
          const newTax = Math.round(newSubtotal * 0.08); // 8% tax
          setShipping(newShipping);
          setTax(newTax);
          setTotal(newSubtotal + newShipping + newTax);
        }
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        toast.error('Failed to load cart items');
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();
  }, [items, router]);

  // Avoid navigating during render; redirect after loading settles.
  useEffect(() => {
    if (isLoading || isLoadingPrices) return;
    if (items.length === 0) return;
    if (itemsWithPrices.length === 0) {
      router.push('/cart');
    }
  }, [isLoading, isLoadingPrices, items.length, itemsWithPrices.length, router]);

  const handleInputChange = (field: keyof CheckoutForm | 'address', value: string | any) => {
    if (field === 'address') {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, ...value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    const required = ['email', 'firstName', 'lastName', 'phone'];
    const addressRequired = ['line1', 'city', 'state', 'postal_code'];
    
    for (const field of required) {
      if (!formData[field as keyof CheckoutForm]) {
        toast.error(`Please fill in your ${field}`);
        return false;
      }
    }
    
    for (const field of addressRequired) {
      if (!formData.address[field as keyof typeof formData.address]) {
        toast.error(`Please fill in your ${field}`);
        return false;
      }
    }
    
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    try {
      // Create checkout session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsWithPrices,
          customerInfo: formData,
          total: total
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        const message = err?.error || 'Failed to create checkout session';
        throw new Error(message);
      }

      const { sessionId, url } = await response.json();

      // Prefer a direct redirect via the URL returned by Stripe.
      if (url) {
        window.location.assign(url);
        return;
      }

      // Fallback to Stripe.js redirect if URL wasn't returned.
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        toast.error('Stripe is not configured');
        return;
      }

      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(publishableKey);
      if (!stripe) {
        toast.error('Stripe failed to load');
        return;
      }
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) toast.error(error.message || 'Checkout failed');
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error instanceof Error ? error.message : 'Checkout failed. Please try again.';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || isLoadingPrices) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-md"></div>
                ))}
              </div>
              <div className="h-96 bg-muted rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (itemsWithPrices.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/cart')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-xl p-6 border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Summary ({itemCount} items)
              </h2>
              
              <div className="space-y-4">
                {itemsWithPrices.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.title} 
                          width={64} 
                          height={64} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.qty} × ${(item.unit_price_cents / 100).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${(item.total_cents / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'Free' : `$${(shipping / 100).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-semibold">${(tax / 100).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-xl font-bold">${(total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-card rounded-2xl shadow-xl p-6 border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Secure Checkout
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  SSL encrypted payment processing
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  PCI DSS compliant
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Your payment information is secure
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Checkout Form */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-xl p-6 border">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-xl p-6 border">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address.line1}
                  onChange={(e) => handleInputChange('address', { line1: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="123 Main St"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Apartment, suite, etc. (optional)
                </label>
                <input
                  type="text"
                  value={formData.address.line2}
                  onChange={(e) => handleInputChange('address', { line2: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address', { city: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address', { state: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.address.postal_code}
                    onChange={(e) => handleInputChange('address', { postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-card rounded-2xl shadow-xl p-6 border">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </h2>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Secure Payment</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your payment will be processed securely by Stripe. We never store your payment information.
                </p>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full h-12 text-base font-medium"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Pay ${(total / 100).toFixed(2)}
                  </div>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


