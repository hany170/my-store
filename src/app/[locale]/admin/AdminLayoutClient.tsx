'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Package, Users, BarChart3, Settings, Menu, X } from 'lucide-react';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your store</p>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          fixed md:static inset-y-0 left-0 z-40 w-64 min-h-screen bg-card/80 backdrop-blur-sm border-r border-border/50 transform transition-transform duration-200 ease-in-out md:transform-none
        `}>
          <nav className="p-4 space-y-2">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            
            <Link 
              href="/admin/products" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            
            <Link 
              href="/admin/users" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Users className="h-4 w-4" />
              Users
            </Link>
            
            <Link 
              href="/admin/settings" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 bg-background">
          <div className="p-6 sm:p-8 md:p-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
