import { createAdminClient } from '@/lib/supabase/server';
import UserActions from '@/components/admin/UserActions';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserX,
  MoreHorizontal,
  Download,
  RefreshCw
} from 'lucide-react';

export default async function AdminUsers() {
  const adminSupabase = await createAdminClient();
  
  let userList: any[] = [];
  let error: any = null;
  
  try {
    // Try to fetch users with admin privileges using admin client
    const { data: users, error: fetchError } = await adminSupabase.auth.admin.listUsers();
    if (fetchError) {
      error = fetchError;
      console.error('Error fetching users:', fetchError);
    } else {
      userList = users?.users || [];
    }
  } catch (err) {
    error = err;
    console.error('Unexpected error:', err);
  }
  
  // Calculate user statistics (with fallback for errors)
  const totalUsers = userList.length;
  const activeUsers = userList.filter(user => user.email_confirmed_at).length;
  const pendingUsers = userList.filter(user => !user.email_confirmed_at).length;
  const recentUsers = userList.filter(user => {
    const userDate = new Date(user.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return userDate > weekAgo;
  }).length;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get user status
  const getUserStatus = (user: any) => {
    if (user.email_confirmed_at) {
      return { status: 'active', label: 'Active', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle };
    } else {
      return { status: 'pending', label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock };
    }
  };

  // If there's an authentication error, show a helpful message
  if (error && error.message?.includes('User not allowed')) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
        </div>

        {/* Error Message */}
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-950/30 dark:to-orange-900/30 p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200">
                Admin Access Required
              </h3>
              <p className="mt-3 text-orange-700 dark:text-orange-300">
                You need administrator privileges to access user management. This feature requires:
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-sm text-orange-700 dark:text-orange-300">
                <li>Admin role in your Supabase project</li>
                <li>Proper service role key configuration</li>
                <li>Admin user authentication</li>
              </ul>
              <p className="mt-4 text-sm text-orange-600 dark:text-orange-400">
                Contact your system administrator or check your Supabase project settings.
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="rounded-2xl border bg-card p-8">
          <h3 className="text-xl font-semibold mb-6">Alternative Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-xl hover:bg-accent/50 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold">Check Permissions</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Verify your user role and permissions in the Supabase dashboard.
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                Go to Supabase Dashboard →
              </button>
            </div>
            <div className="p-6 border rounded-xl hover:bg-accent/50 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-semibold">Contact Support</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get help with admin access and user management setup.
              </p>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline transition-colors">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's a general error, show error message
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 dark:border-red-800 dark:from-red-950/30 dark:to-red-900/30 p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-800 dark:text-red-200">
                Error Loading Users
              </h3>
              <p className="mt-3 text-red-700 dark:text-red-300">
                {error.message || 'An unexpected error occurred while loading user data.'}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Manage user accounts, permissions, and access control
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg bg-background text-sm font-medium hover:bg-accent transition-colors">
            <Download className="h-4 w-4" />
            Export Users
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            <UserPlus className="h-4 w-4" />
            Invite User
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-blue-600 dark:text-blue-400">from last month</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Users</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{activeUsers}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-medium">{Math.round((activeUsers / totalUsers) * 100)}%</span>
            <span className="text-green-600 dark:text-green-400">of total users</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{pendingUsers}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-600 font-medium">Need confirmation</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">New This Week</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{recentUsers}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-purple-600 font-medium">Recent growth</span>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by email, name, or role..."
              className="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="px-4 py-3 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all">
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending Only</option>
              <option value="admin">Admins Only</option>
            </select>
            <button className="inline-flex items-center gap-2 px-6 py-3 border border-input rounded-xl bg-background text-sm font-medium hover:bg-accent transition-colors">
              <Filter className="h-4 w-4" />
              Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Users Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="p-6 border-b bg-gradient-to-r from-muted/30 to-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">User List</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage and monitor user accounts</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/80 px-3 py-1.5 rounded-lg border">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Active: {activeUsers}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/80 px-3 py-1.5 rounded-lg border">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Pending: {pendingUsers}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    User
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Status
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Last Active
                  </div>
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/30">
              {userList.map((user, index) => {
                const userStatus = getUserStatus(user);
                const StatusIcon = userStatus.icon;
                const isAdmin = user.app_metadata?.role === 'admin';
                const isRecent = new Date(user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                
                return (
                  <tr 
                    key={user.id} 
                    className={`group transition-all duration-200 hover:bg-muted/20 hover:shadow-sm ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/5'
                    } ${isRecent ? 'ring-1 ring-primary/20 bg-primary/5' : ''}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 group-hover:scale-105 ${
                          isAdmin 
                            ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-300/50' 
                            : 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30'
                        }`}>
                          <span className={`text-lg font-bold ${
                            isAdmin ? 'text-purple-700 dark:text-purple-300' : 'text-primary'
                          }`}>
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                          {isRecent && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground truncate">{user.email}</span>
                            {isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono">ID: {user.id.slice(0, 8)}...</span>
                            {isRecent && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-105 ${
                          userStatus.status === 'active' 
                            ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800/50' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800/50'
                        }`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {userStatus.label}
                        </span>
                        {userStatus.status === 'pending' && (
                          <span className="text-xs text-muted-foreground">
                            {user.email_confirmed_at ? 'Confirmed' : 'Awaiting email'}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl transition-all duration-200 group-hover:scale-110 ${
                          isAdmin 
                            ? 'bg-purple-100 dark:bg-purple-900/40 border border-purple-200/50 dark:border-purple-800/50' 
                            : 'bg-blue-100 dark:bg-blue-900/40 border border-blue-200/50 dark:border-blue-800/50'
                        }`}>
                          <Shield className={`h-4 w-4 ${
                            isAdmin ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <span className={`text-sm font-semibold ${
                            isAdmin ? 'text-purple-700 dark:text-purple-300' : 'text-blue-700 dark:text-blue-300'
                          }`}>
                            {isAdmin ? 'Administrator' : 'Standard User'}
                          </span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {isAdmin ? 'Full access' : 'Limited access'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">{formatDate(user.created_at)}</span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {isRecent ? 'This week' : 'Older account'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never signed in'}
                          </span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {user.last_sign_in_at ? 'Last activity' : 'No activity yet'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center justify-center">
                        <UserActions user={user} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {userList.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-muted/30 to-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">No users found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Users will appear here once they register for your platform. Start by inviting your first user to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                  <UserPlus className="h-4 w-4" />
                  Invite First User
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border border-input px-6 py-3 text-sm font-medium hover:bg-accent transition-colors">
                  <Download className="h-4 w-4" />
                  Import Users
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Table Footer */}
        {userList.length > 0 && (
          <div className="p-4 border-t bg-muted/20">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Total: <span className="font-semibold text-foreground">{totalUsers}</span> users</span>
                <span>•</span>
                <span>Active: <span className="font-semibold text-green-600">{activeUsers}</span></span>
                <span>•</span>
                <span>Pending: <span className="font-semibold text-yellow-600">{pendingUsers}</span></span>
                <span>•</span>
                <span>Admins: <span className="font-semibold text-purple-600">{userList.filter(u => u.app_metadata?.role === 'admin').length}</span></span>
              </div>
              <div className="text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {userList.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border bg-card">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{userList.length}</span> of <span className="font-medium">{totalUsers}</span> users
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-input rounded-lg bg-background text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <div className="flex items-center gap-1">
              <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">1</button>
              <span className="px-3 py-2 text-sm text-muted-foreground">of 1</span>
            </div>
            <button className="px-4 py-2 border border-input rounded-lg bg-background text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
