import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createGuestClient } from '@/lib/supabase/guest';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { productId, qty = 1 } = await request.json();
    
    if (!productId || qty < 1) {
      return NextResponse.json(
        { error: 'Invalid product ID or quantity' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const cookieStore = await cookies();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    let cartId: string;
    
    if (user) {
      // User is authenticated, get or create their cart
      let { data: userCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!userCart) {
        // Create new user cart
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        
        if (createError) {
          console.error('User cart creation error:', createError);
          return NextResponse.json(
            { error: 'Failed to create user cart' },
            { status: 500 }
          );
        }
        
        userCart = newCart;
      }
      
      cartId = userCart.id;
    } else {
      // Guest user, get or create cart from cookie
      const cookieCartId = cookieStore.get('cart_id')?.value;
      
      if (!cookieCartId) {
        cartId = randomUUID();
      } else {
        cartId = cookieCartId;
      }
    }

    // Create or get cart (for guest carts)
    if (!user) {
      const guestClient = createGuestClient();
      
      const { data: cart, error: cartError } = await guestClient
        .from('carts')
        .upsert({ id: cartId }, { onConflict: 'id' })
        .select('id')
        .single();

      if (cartError) {
        console.error('Cart creation error:', cartError);
        return NextResponse.json(
          { error: 'Failed to create cart' },
          { status: 500 }
        );
      }

      // Check if item already exists in cart
      const { data: existingItem } = await guestClient
        .from('cart_items')
        .select('id, qty')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update existing item
        const { error: updateError } = await guestClient
          .from('cart_items')
          .update({ 
            qty: existingItem.qty + qty,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (updateError) {
          console.error('Update cart item error:', updateError);
          return NextResponse.json(
            { error: 'Failed to update cart item' },
            { status: 500 }
          );
        }
      } else {
        // Insert new item
        const { error: insertError } = await guestClient
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: productId,
            qty: qty
          });

        if (insertError) {
          console.error('Insert cart item error:', insertError);
          return NextResponse.json(
            { error: 'Failed to add item to cart' },
            { status: 500 }
          );
        }
      }
    } else {
      // For authenticated users, use the RPC function
      const { error: addError } = await supabase.rpc('add_to_cart', {
        p_cart_id: cartId,
        p_product_id: productId,
        p_qty: qty,
      });

      if (addError) {
        console.error('Add to cart error:', addError);
        return NextResponse.json(
          { error: 'Failed to add item to cart' },
          { status: 500 }
        );
      }
    }

    // Create response with cookie if needed (only for guest users)
    const response = NextResponse.json({ success: true, cartId });
    
    if (!user && !cookieStore.get('cart_id')?.value) {
      response.cookies.set('cart_id', cartId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Add to cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
