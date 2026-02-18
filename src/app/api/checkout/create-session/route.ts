import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function toHttpsImageUrl(origin: string, image?: string): string | undefined {
  if (!image || typeof image !== 'string') return undefined;
  const trimmed = image.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('https://')) return trimmed;

  // Stripe expects absolute URLs for images. For local/dev (http://localhost)
  // and relative paths, omit the image rather than failing session creation.
  if (trimmed.startsWith('http://')) return undefined;
  if (trimmed.startsWith('/')) {
    const absolute = `${origin}${trimmed}`;
    return absolute.startsWith('https://') ? absolute : undefined;
  }
  const absolute = `${origin}/${trimmed}`;
  return absolute.startsWith('https://') ? absolute : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Missing STRIPE_SECRET_KEY' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey, {
      // Use the library's default API version (matches installed stripe types).
    });

    const { items, customerInfo, total } = await request.json();

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }

    if (!customerInfo || !total) {
      return NextResponse.json(
        { error: 'Missing customer info or total' },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const origin = request.nextUrl.origin;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => {
      const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
        name: item.title,
      };
      const imageUrl = toHttpsImageUrl(origin, item.image);
      if (imageUrl) productData.images = [imageUrl];

      return {
        price_data: {
          currency: 'usd',
          product_data: productData,
          unit_amount: Number(item.unit_price_cents) || 0,
        },
        quantity: Number(item.qty) || 0,
      };
    });

    // Add shipping and tax if applicable
    const subtotal = items.reduce((sum: number, item: any) => sum + item.total_cents, 0);
    const shipping = subtotal > 5000 ? 0 : 500; // Free shipping over $50
    const tax = Math.round(subtotal * 0.08); // 8% tax

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data : {
            name: 'Shipping',
          },
          unit_amount: shipping,
        },
        quantity: 1,
      });
    }

    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
          },
          unit_amount: tax,
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cart`,
      customer_email: customerInfo.email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU'],
      },
      metadata: {
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_phone: customerInfo.phone,
        customer_address: JSON.stringify(customerInfo.address),
        items_count: items.length.toString(),
        subtotal: subtotal.toString(),
        shipping: shipping.toString(),
        tax: tax.toString(),
        total: total.toString(),
      },
      payment_intent_data: {
        metadata: {
          customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          customer_address: JSON.stringify(customerInfo.address),
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as any).message)
        : 'Failed to create checkout session';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
