import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get guest cart ID from cookie
    const guestCartId = cookieStore.get('cart_id')?.value;
    
    if (!guestCartId) {
      // No guest cart to merge
      return NextResponse.json({ success: true, message: 'No guest cart to merge' });
    }

    // Check if guest cart has items
    const { data: guestCartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select('id')
      .eq('cart_id', guestCartId);

    if (itemsError) {
      console.error('Error checking guest cart items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to check guest cart' },
        { status: 500 }
      );
    }

    if (!guestCartItems || guestCartItems.length === 0) {
      // Guest cart is empty, just remove the cookie
      const response = NextResponse.json({ success: true, message: 'Guest cart was empty' });
      response.cookies.delete('cart_id');
      return response;
    }

    // Merge guest cart into user cart using the database function
    const { data: mergedCartId, error: mergeError } = await supabase.rpc(
      'merge_guest_cart_into_user_cart',
      {
        p_guest_cart_id: guestCartId,
        p_user_id: user.id,
      }
    );

    if (mergeError) {
      console.error('Cart merge error:', mergeError);
      return NextResponse.json(
        { error: 'Failed to merge guest cart' },
        { status: 500 }
      );
    }

    // Remove the guest cart cookie
    const response = NextResponse.json({
      success: true,
      message: 'Guest cart merged successfully',
      mergedCartId,
    });
    response.cookies.delete('cart_id');

    return response;
  } catch (error) {
    console.error('Cart merge API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
