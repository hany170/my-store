import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const isAdmin = Boolean(meta && (meta['is_admin'] as boolean | undefined));
  return { user, isAdmin };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}


