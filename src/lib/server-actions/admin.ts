'use server';
import {createClient, createAdminClient} from '@/lib/supabase/server';
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

export async function updateProduct(productId: string, input: {
  title: string;
  slug: string;
  description?: string | null;
  price_cents: number;
  images?: string[];
  stock_quantity?: number;
  status?: string;
}) {
  const {isAdmin} = await requireAdmin();
  if (!isAdmin) return {ok: false, error: 'Unauthorized'};
  
  const supabase = await createClient();
  const {error} = await supabase
    .from('products')
    .update({
      title: input.title,
      slug: input.slug,
      description: input.description ?? null,
      price_cents: input.price_cents,
      images: input.images ?? [],
      stock_quantity: input.stock_quantity ?? 0,
      status: input.status ?? 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', productId);
  
  if (error) return {ok: false, error: error.message};
  return {ok: true};
}

export async function deleteProduct(productId: string) {
  const {isAdmin} = await requireAdmin();
  if (!isAdmin) return {ok: false, error: 'Unauthorized'};
  
  const supabase = await createClient();
  const {error} = await supabase.from('products').delete().eq('id', productId);
  
  if (error) return {ok: false, error: error.message};
  return {ok: true};
}

export async function inviteUser(email: string, role: 'user' | 'admin' = 'user') {
  const {isAdmin} = await requireAdmin();
  if (!isAdmin) return {ok: false, error: 'Unauthorized'};
  
  const adminSupabase = await createAdminClient();
  
  // Invite user via Supabase Auth
  const {error} = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    data: { role }
  });
  
  if (error) return {ok: false, error: error.message};
  return {ok: true};
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const {isAdmin} = await requireAdmin();
  if (!isAdmin) return {ok: false, error: 'Unauthorized'};
  
  const adminSupabase = await createAdminClient();
  
  const {error} = await adminSupabase.auth.admin.updateUserById(userId, {
    app_metadata: { role }
  });
  
  if (error) return {ok: false, error: error.message};
  return {ok: true};
}

export async function deleteUser(userId: string) {
  const {isAdmin} = await requireAdmin();
  if (!isAdmin) return {ok: false, error: 'Unauthorized'};
  
  const adminSupabase = await createAdminClient();
  
  const {error} = await adminSupabase.auth.admin.deleteUser(userId);
  
  if (error) return {ok: false, error: error.message};
  return {ok: true};
}

export async function resendInvitation(email: string) {
  const {isAdmin} = await requireAdmin();
  if (!isAdmin) return {ok: false, error: 'Unauthorized'};
  
  const adminSupabase = await createAdminClient();
  
  // Resend invitation email
  const {error} = await adminSupabase.auth.admin.inviteUserByEmail(email);
  
  if (error) return {ok: false, error: error.message};
  return {ok: true};
}


