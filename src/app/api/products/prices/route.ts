import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid product IDs' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, price_cents')
      .in('id', productIds);

    if (error) {
      console.error('Error fetching product prices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product prices' },
        { status: 500 }
      );
    }

    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Product prices API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
