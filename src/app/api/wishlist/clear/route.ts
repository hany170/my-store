import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE() {
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

    if (wishlistError) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Remove all items from wishlist
    const { error: deleteError } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlist.id);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to clear wishlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Wishlist clear error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
