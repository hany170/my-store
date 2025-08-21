"use client";
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Mail, Shield } from 'lucide-react';

export function UserProfile() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email;
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-lg font-semibold">
            {getUserInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
          <p className="text-sm text-gray-500">{userEmail}</p>
          <div className="flex items-center mt-1">
            <Shield className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-xs text-green-600 font-medium">Verified Account</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span>Account Type: {user.app_metadata?.provider || 'Email'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span>Email: {userEmail}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="w-4 h-4 mr-2" />
            <span>Member since: {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
