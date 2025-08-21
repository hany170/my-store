import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's wishlist
    const { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (wishlistError && wishlistError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to get wishlist' }, { status: 500 });
    }

    let wishlistItems: unknown[] = [];

    if (wishlist) {
      // Get wishlist items with product details
      const { data: items, error: itemsError } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          created_at,
          products (
            id,
            title,
            slug,
            price_cents,
            images,
            stock_quantity
          )
        `)
        .eq('wishlist_id', wishlist.id);

      if (itemsError) {
        return NextResponse.json({ error: 'Failed to get wishlist items' }, { status: 500 });
      }

      wishlistItems = items || [];
    }

    return NextResponse.json({ items: wishlistItems });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user's wishlist
    let { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (wishlistError && wishlistError.code === 'PGRST116') {
      // Create new wishlist if it doesn't exist
      const { data: newWishlist, error: createError } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id })
        .select('id')
        .single();

      if (createError) {
        return NextResponse.json({ error: 'Failed to create wishlist' }, { status: 500 });
      }
      wishlist = newWishlist;
    } else if (wishlistError) {
      return NextResponse.json({ error: 'Failed to get wishlist' }, { status: 500 });
    }

    // Check if product is already in wishlist
    if (!wishlist) {
      return NextResponse.json({ error: 'Failed to get or create wishlist' }, { status: 500 });
    }

    const { data: existingItem } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlist.id)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 400 });
    }

    // Add product to wishlist
    const { error: addError } = await supabase
      .from('wishlist_items')
      .insert({
        wishlist_id: wishlist.id,
        product_id: productId
      });

    if (addError) {
      return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's wishlist
    const { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (wishlistError || !wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Remove product from wishlist
    const { error: deleteError } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlist.id)
      .eq('product_id', productId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
