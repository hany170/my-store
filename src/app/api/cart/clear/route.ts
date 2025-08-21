import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function DELETE() {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    let cartId: string | undefined;
    
    if (user) {
      // User is authenticated, get their cart
      const { data: userCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (userCart) {
        cartId = userCart.id;
      }
    } else {
      // Guest user, get cart from cookie
      cartId = cookieStore.get('cart_id')?.value;
    }

    if (!cartId) {
      return NextResponse.json({ success: true });
    }

    // Clear all cart items
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) {
      console.error('Clear cart error:', error);
      return NextResponse.json(
        { error: 'Failed to clear cart' },
        { status: 500 }
      );
    }

    // Remove the cart cookie only for guest users
    const response = NextResponse.json({ success: true });
    
    if (!user) {
      response.cookies.delete('cart_id');
    }

    return response;
  } catch (error) {
    console.error('Clear cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
