import {createClient} from '@/lib/supabase/server';
import {Link} from '@/i18n/routing';
import ProductActions from '@/components/admin/ProductActions';
import { Plus, Package, DollarSign, Box, Activity } from 'lucide-react';

export default async function AdminProducts(){
  const supabase = await createClient();
  const {data} = await supabase.from('products').select('id,title,slug,price_cents,stock_quantity,status').order('created_at', {ascending: false});
  const list: Array<{id: string; title: string; slug: string; price_cents: number; stock_quantity: number; status: string}> = data ?? [];
  
  const totalProducts = list.length;
  const activeProducts = list.filter(p => p.status === 'active').length;
  const totalValue = list.reduce((sum, p) => sum + (p.price_cents * p.stock_quantity), 0);
  const lowStock = list.filter(p => p.stock_quantity < 10).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Products</h3>
          </div>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Active Products</h3>
          </div>
          <p className="text-2xl font-bold">{activeProducts}</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
          </div>
          <p className="text-2xl font-bold">${(totalValue / 100).toFixed(2)}</p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Low Stock</h3>
          </div>
          <p className="text-2xl font-bold">{lowStock}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Product List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((product, index) => (
                <tr key={product.id} className={`border-b ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-muted-foreground">{product.slug}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">${(product.price_cents / 100).toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        product.stock_quantity === 0 
                          ? 'bg-destructive/10 text-destructive' 
                          : product.stock_quantity < 10 
                          ? 'bg-warning/10 text-warning' 
                          : 'bg-success/10 text-success'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      product.status === 'active' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <ProductActions productId={product.id} productSlug={product.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {list.length === 0 && (
            <div className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No products found</h3>
              <p className="mt-2 text-muted-foreground">Get started by creating your first product.</p>
              <Link 
                href="/admin/products/new" 
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Product
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


