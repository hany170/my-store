import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createGuestClient } from '@/lib/supabase/guest';
import { cookies } from 'next/headers';

export async function GET() {
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
      return NextResponse.json({ items: [] });
    }

    let items: unknown[] = [];

    if (user) {
      // For authenticated users, use the view
      const { data: viewItems, error } = await supabase
        .from('cart_items_view')
        .select('*')
        .eq('cart_id', cartId);

      if (error) {
        console.error('Error fetching cart items from view:', error);
        return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 });
      }
      
      items = viewItems || [];
    } else {
      // For guest users, fetch items directly and join with products
      const guestClient = createGuestClient();
      
      const { data: cartItems, error: itemsError } = await guestClient
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId);

      if (itemsError) {
        console.error('Error fetching cart items:', itemsError);
        return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 });
      }

      if (cartItems && cartItems.length > 0) {
        // Get product information for each cart item
        const productIds = cartItems.map(item => item.product_id);
        const { data: products, error: productsError } = await guestClient
          .from('products')
          .select('id, title, images')
          .in('id', productIds);

        if (productsError) {
          console.error('Error fetching products:', productsError);
          return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
        }

        // Combine cart items with product information
        items = cartItems.map(item => {
          const product = products?.find(p => p.id === item.product_id);
          return {
            ...item,
            title: product?.title || 'Unknown Product',
            image: product?.images?.[0] || null
          };
        });
      }
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
