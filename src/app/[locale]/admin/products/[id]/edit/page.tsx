import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import EditProductForm from '@/components/admin/EditProductForm';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    notFound();
  }

  const { id } = await params;
  const supabase = await createClient();
  
  // Fetch the product data
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">
          Update product information and settings
        </p>
      </div>
      
      <EditProductForm product={product} />
    </div>
  );
} 