'use server';
import {createClient} from '@/lib/supabase/server';
import {cookies} from 'next/headers';
import {randomUUID} from 'crypto';

type AddToCartInput = {productId: string; qty: number};

export async function addToCartAction(input: AddToCartInput){
  try {
    console.log('Starting add to cart action for product:', input.productId);
    
    const supabase = await createClient();
    console.log('Supabase client created successfully');
    
    // Get or create cart ID from cookie
    const cookieStore = await cookies();
    let cartId = cookieStore.get('cart_id')?.value;
    console.log('Current cart ID from cookie:', cartId);
    
    if (!cartId) {
      cartId = randomUUID();
      console.log('Generated new cart ID:', cartId);
      // Set the cookie in the response headers
      cookieStore.set('cart_id', cartId, {
        httpOnly: true, 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production', 
        path: '/', 
        maxAge: 60*60*24*30
      });
    }

    // Create or get cart
    console.log('Creating/getting cart with ID:', cartId);
    const {data: cart, error: cartError} = await supabase
      .from('carts')
      .upsert({id: cartId}, {onConflict: 'id'})
      .select('id')
      .single();
      
    if (cartError) {
      console.error('Cart creation error:', cartError);
      throw new Error(`Failed to create cart: ${cartError.message}`);
    }
    
    if (!cart) {
      throw new Error('Cart not found after creation');
    }
    
    console.log('Cart created/retrieved successfully:', cart.id);

    // Add item to cart using the function
    console.log('Adding item to cart:', { cartId: cart.id, productId: input.productId, qty: input.qty });
    const {error: addError} = await supabase.rpc('add_to_cart', {
      p_cart_id: cart.id, 
      p_product_id: input.productId, 
      p_qty: input.qty
    });
    
    if (addError) {
      console.error('Add to cart error:', addError);
      throw new Error(`Failed to add item to cart: ${addError.message}`);
    }
    
    console.log('Item added to cart successfully');

    return { success: true, cartId: cart.id };
  } catch (error) {
    console.error('Add to cart action error:', error);
    throw error;
  }
}


