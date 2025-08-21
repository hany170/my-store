import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Extract order details from session metadata
    const metadata = session.metadata;
    if (!metadata) {
      return NextResponse.json(
        { error: 'Order metadata not found' },
        { status: 400 }
      );
    }

    // Parse items from line items
    const items = session.line_items?.data
      ?.filter(item => item.price_data?.product_data?.name !== 'Shipping' && item.price_data?.product_data?.name !== 'Tax')
      ?.map(item => ({
        title: item.price_data?.product_data?.name || 'Unknown Product',
        qty: item.quantity || 0,
        unit_price_cents: item.price_data?.unit_amount || 0,
        total_cents: (item.price_data?.unit_amount || 0) * (item.quantity || 0),
        image: item.price_data?.product_data?.images?.[0] || null,
      })) || [];

    const orderDetails = {
      id: sessionId,
      total: session.amount_total || 0,
      items: items,
      customer_name: metadata.customer_name || 'Unknown Customer',
      customer_email: session.customer_email || metadata.customer_email || 'No email provided',
      status: session.payment_status === 'paid' ? 'Paid' : 'Pending',
      created_at: new Date(session.created * 1000).toISOString(),
    };

    // Store order in database (optional)
    try {
      const supabase = await createClient();
      await supabase.from('orders').insert({
        id: sessionId,
        customer_name: orderDetails.customer_name,
        customer_email: orderDetails.customer_email,
        total_amount: orderDetails.total,
        status: orderDetails.status,
        stripe_session_id: sessionId,
        metadata: metadata,
      });
    } catch (dbError) {
      console.error('Failed to store order in database:', dbError);
      // Don't fail the request if database storage fails
    }

    return NextResponse.json(orderDetails);
  } catch (error) {
    console.error('Error processing order success:', error);
    return NextResponse.json(
      { error: 'Failed to process order success' },
      { status: 500 }
    );
  }
}
