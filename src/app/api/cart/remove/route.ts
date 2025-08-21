import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
  try {
    const { itemId } = await request.json();
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Remove cart item
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('cart_id', cartId);

    if (error) {
      console.error('Remove cart item error:', error);
      return NextResponse.json(
        { error: 'Failed to remove cart item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
