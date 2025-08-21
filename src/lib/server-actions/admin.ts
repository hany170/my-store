'use server';
import {createClient} from '@/lib/supabase/server';
import {requireAdmin} from '@/lib/auth';

export async function createProduct(input: {title: string; slug: string; description?: string | null; price_cents: number; images?: string[]; stock_quantity?: number;}){
  const {isAdmin} = await requireAdmin();
  if (!isAdmin) return {ok: false, error: 'Unauthorized'};
  const supabase = await createClient();
  const {error} = await supabase.from('products').insert({
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    price_cents: input.price_cents,
    images: input.images ?? [],
    stock_quantity: input.stock_quantity ?? 0,
    status: 'active'
  });
  if (error) return {ok: false, error: error.message};
  return {ok: true};
}


