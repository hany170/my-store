import type {SupabaseClient} from '@supabase/supabase-js';

export type DbProduct = {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  description: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  images: string[] | null;
  stock_quantity: number;
  category_id: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  category_name?: string | null;
};  

export async function getFeaturedProducts(supabase: SupabaseClient, limit = 8): Promise<DbProduct[]> {
  const {data, error} = await supabase
    .from('products')
    .select('id,title,slug,sku,description,price_cents,compare_at_cents,images,stock_quantity,category_id,status,created_at,updated_at,categories(name)')
    .eq('status', 'active')
    .limit(limit);
  if (error) throw error;
  type Row = Omit<DbProduct,'category_name'> & {categories?: {name?: string} | null};
  return (data as Row[] | null ?? []).map((row)=> ({...row, category_name: row.categories?.name ?? null}));
}

export type ProductQuery = {
  search?: string;
  categorySlug?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest';
  page?: number;
  pageSize?: number;
};

export async function getProducts(supabase: SupabaseClient, query: ProductQuery){
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  
  if (query.categorySlug) {
    // When filtering by category, use inner join
    let q = supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        price_cents,
        images,
        created_at,
        categories!inner(slug, name)
      `, {count: 'exact'})
      .eq('status','active')
      .eq('categories.slug', query.categorySlug);
    
    if (query.search) {
      // Enhanced search: search in title, description, and SKU
      const searchTerm = query.search.trim();
      q = q.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
    }
    
    if (query.sort === 'price-asc') {
      q = q.order('price_cents', {ascending: true});
    } else if (query.sort === 'price-desc') {
      q = q.order('price_cents', {ascending: false});
    } else {
      q = q.order('created_at', {ascending: false});
    }
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const {data, error, count} = await q.range(from, to);
    
    if (error) throw error;
    
    return {products: data ?? [], count: count ?? 0, page, pageSize};
  } else {
    // When no category filter, use left join to get all products
    let q = supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        price_cents,
        images,
        created_at,
        categories(slug, name)
      `, {count: 'exact'})
      .eq('status','active');
    
    if (query.search) {
      // Enhanced search: search in title, description, and SKU
      const searchTerm = query.search.trim();
      q = q.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
    }
    
    if (query.sort === 'price-asc') {
      q = q.order('price_cents', {ascending: true});
    } else if (query.sort === 'price-desc') {
      q = q.order('price_cents', {ascending: false});
    } else {
      q = q.order('created_at', {ascending: false});
    }
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const {data, error, count} = await q.range(from, to);
    
    if (error) throw error;
    
    return {products: data ?? [], count: count ?? 0, page, pageSize};
  }
}

export async function getProductBySlug(supabase: SupabaseClient, slug: string): Promise<DbProduct | null>{
  const {data, error} = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {...(data as DbProduct), category_name: (data as {categories?: {name?: string}}).categories?.name ?? null} as DbProduct;
}

export async function getRelatedProducts(supabase: SupabaseClient, categorySlug: string, excludeProductId: string, limit = 4){
  const {data, error} = await supabase
    .from('products')
    .select('id,title,slug,price_cents,images,categories(slug)')
    .eq('status','active')
    .eq('categories.slug', categorySlug)
    .neq('id', excludeProductId)
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Array<{id: string; title: string; slug: string; price_cents: number; images: string[] | null; categories?: {slug?: string}}>;
}


