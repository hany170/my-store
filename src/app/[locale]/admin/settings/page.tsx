import { 
  Settings, 
  Store, 
  Shield, 
  Bell, 
  Database, 
  Palette,
  Globe,
  CreditCard,
  FileText,
  Save
} from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your store settings and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Store Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Store Name</label>
                <input
                  type="text"
                  defaultValue="My Store"
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Store Description</label>
                <textarea
                  rows={3}
                  defaultValue="Modern e-commerce store with authentication"
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="admin@mystore.com"
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Localization
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Default Language</label>
                  <select className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Time Zone</label>
                  <select className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="stripe" defaultChecked className="rounded border-input" />
                <label htmlFor="stripe" className="text-sm font-medium">Enable Stripe Payments</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="paypal" className="rounded border-input" />
                <label htmlFor="paypal" className="text-sm font-medium">Enable PayPal</label>
              </div>
              <div>
                <label className="text-sm font-medium">Stripe Publishable Key</label>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="2fa" defaultChecked className="rounded border-input" />
                <label htmlFor="2fa" className="text-sm font-medium">Require 2FA for Admins</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="session" defaultChecked className="rounded border-input" />
                <label htmlFor="session" className="text-sm font-medium">Session Timeout (24h)</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="audit" className="rounded border-input" />
                <label htmlFor="audit" className="text-sm font-medium">Enable Audit Logs</label>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="email" defaultChecked className="rounded border-input" />
                <label htmlFor="email" className="text-sm font-medium">Email Notifications</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="low-stock" defaultChecked className="rounded border-input" />
                <label htmlFor="low-stock" className="text-sm font-medium">Low Stock Alerts</label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="new-orders" defaultChecked className="rounded border-input" />
                <label htmlFor="new-orders" className="text-sm font-medium">New Order Notifications</label>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Appearance
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <select className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex gap-2 mt-1">
                  <button className="w-8 h-8 bg-blue-600 rounded-full border-2 border-blue-600"></button>
                  <button className="w-8 h-8 bg-green-600 rounded-full border-2 border-transparent hover:border-green-600"></button>
                  <button className="w-8 h-8 bg-purple-600 rounded-full border-2 border-transparent hover:border-purple-600"></button>
                  <button className="w-8 h-8 bg-orange-600 rounded-full border-2 border-transparent hover:border-orange-600"></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
