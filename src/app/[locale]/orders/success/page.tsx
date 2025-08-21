'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, Home, ShoppingBag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OrderDetails {
  id: string;
  total: number;
  items: any[];
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/success?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data);
        } else {
          toast.error('Failed to load order details');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-6"></div>
            <div className="h-32 bg-muted rounded-md mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-card rounded-2xl shadow-xl p-8 border">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find the order details. Please contact support if you believe this is an error.
            </p>
            <Button onClick={() => router.push('/')}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="bg-card rounded-2xl shadow-xl p-8 border text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-4">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Order ID: <span className="font-mono font-medium text-foreground">{orderDetails.id}</span>
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-card rounded-2xl shadow-xl p-6 border mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{orderDetails.customer_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{orderDetails.customer_email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Order Date</span>
              <span className="font-medium">
                {new Date(orderDetails.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {orderDetails.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="text-xl font-bold">
                ${(orderDetails.total / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card rounded-2xl shadow-xl p-6 border mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Order Items
          </h2>
          
          <div className="space-y-4">
            {orderDetails.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.qty} × ${(item.unit_price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <span className="font-semibold">
                  ${(item.total_cents / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-card rounded-2xl shadow-xl p-6 border mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            What's Next?
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Order Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email confirmation with your order details.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Order Processing</h3>
                <p className="text-sm text-muted-foreground">
                  We'll process your order and prepare it for shipping.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Shipping Updates</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive tracking information once your order ships.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Continue Shopping
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/account')}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Package className="h-4 w-4" />
            View Orders
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@mystore.com" className="text-primary hover:text-primary/80">
              support@mystore.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
