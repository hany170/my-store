import { createClient, createAdminClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';
import { 
  Package, 
  Users, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Eye,
  Plus
} from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Product {
  id: string;
  title: string;
  price_cents: number;
  stock_quantity: number;
  status: string;
  created_at: string;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Fetch products
  const { data: products } = await supabase.from('products').select('*');
  const productList: Product[] = products || [];

  // Fetch users with admin privileges
  let users: User[] = [];
  let userError: string | null = null;

  try {
    const { data: userData, error: fetchError } = await adminSupabase.auth.admin.listUsers();
    if (fetchError) {
      userError = fetchError.message;
      console.error('Error fetching users:', fetchError);
    } else {
      users = userData?.users || [];
    }
  } catch (err) {
    userError = 'Failed to fetch users';
    console.error('Unexpected error fetching users:', err);
  }

  // Calculate statistics
  const totalProducts = productList.length;
  const activeProducts = productList.filter(p => p.status === 'active').length;
  const totalValue = productList.reduce((sum, p) => sum + p.price_cents, 0);
  const lowStock = productList.filter(p => p.stock_quantity < 10).length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.last_sign_in_at).length;

  // Recent activity
  const recentProducts = productList
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentUsers = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Welcome to Admin Dashboard
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Manage your store, products, and users from one central location
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Products</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-medium">+{recentProducts.length}</span>
            <span className="text-blue-600 dark:text-blue-400">recently added</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Users</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{activeUsers}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-medium">{totalUsers}</span>
            <span className="text-green-600 dark:text-green-400">total registered</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Inventory Value</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">${(totalValue / 100).toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <ShoppingBag className="h-4 w-4 text-purple-600" />
            <span className="text-purple-600 font-medium">{activeProducts}</span>
            <span className="text-purple-600 dark:text-purple-400">active products</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Low Stock</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{lowStock}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-orange-600 font-medium">Needs attention</span>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Status */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Product Status</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Active Products</span>
              <span className="text-2xl font-bold text-green-600">{activeProducts}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Inactive Products</span>
              <span className="text-2xl font-bold text-gray-600">{totalProducts - activeProducts}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Low Stock Items</span>
              <span className="text-2xl font-bold text-orange-600">{lowStock}</span>
            </div>
          </div>
        </div>

        {/* Stock Overview */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Stock Overview</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">
              Manage Stock
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Total Items</span>
              <span className="text-2xl font-bold text-blue-600">
                {productList.reduce((sum, p) => sum + p.stock_quantity, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Average Stock</span>
              <span className="text-2xl font-bold text-purple-600">
                {totalProducts > 0 ? Math.round(productList.reduce((sum, p) => sum + p.stock_quantity, 0) / totalProducts) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Out of Stock</span>
              <span className="text-2xl font-bold text-red-600">
                {productList.filter(p => p.stock_quantity === 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <div className="flex gap-2">
            <Link href="/admin/products" className="text-sm text-primary hover:underline">
              View Products
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/admin/users" className="text-sm text-primary hover:underline">
              View Users
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Products */}
          <div>
            <h3 className="text-lg font-medium mb-4">Recent Products</h3>
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <p className="text-sm text-muted-foreground">${(product.price_cents / 100).toFixed(2)}</p>
                  </div>
                  <Link href="/admin/products" className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div>
            <h3 className="text-lg font-medium mb-4">Recent Users</h3>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.email || 'No email'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs px-2 py-1 bg-muted rounded-full">
                    {(user.app_metadata as any)?.role || 'user'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin/products/new" 
            className="flex items-center gap-3 p-4 border rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Add Product</h3>
              <p className="text-sm text-muted-foreground">Create a new product</p>
            </div>
          </Link>

          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 p-4 border rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and edit user accounts</p>
            </div>
          </Link>

          <Link 
            href="/admin/products" 
            className="flex items-center gap-3 p-4 border rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">View Products</h3>
              <p className="text-sm text-muted-foreground">Browse all products</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Alerts & Notifications */}
      {userError && (
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-950/30 dark:to-orange-900/30 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                Admin Access Restricted
              </h3>
              <p className="mt-2 text-orange-700 dark:text-orange-300">
                Some features may be limited due to admin access restrictions. Error: {userError}
              </p>
              <p className="mt-3 text-sm text-orange-600 dark:text-orange-400">
                Contact your system administrator to resolve this issue.
              </p>
            </div>
          </div>
        </div>
      )}

      {lowStock > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:border-yellow-800 dark:from-yellow-950/30 dark:to-yellow-900/30 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                Low Stock Alert
              </h3>
              <p className="mt-2 text-yellow-700 dark:text-yellow-300">
                {lowStock} product{lowStock !== 1 ? 's' : ''} {lowStock !== 1 ? 'are' : 'is'} running low on stock and may need replenishment.
              </p>
              <Link 
                href="/admin/products" 
                className="mt-3 inline-flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium hover:underline"
              >
                Review Stock Levels →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


