"use client";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Heart, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function UserMenu() {
  const { user, signOut, loading, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('nav');

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when user signs out
  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false);
    }
  }, [isAuthenticated]);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.user_metadata?.name || 
                     user?.user_metadata?.full_name || 
                     user?.email?.split('@')[0] || 
                     'User';
  const userEmail = user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/sign-in"
        className="flex p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label={t('account')}
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="User menu"
      >
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-xs font-medium">
            {getUserInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden lg:block text-sm font-medium">{displayName}</span>
        <ChevronDown className="h-4 w-4 hidden lg:block" />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-sm font-medium">
                  {getUserInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/account"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4 mr-3" />
              {t('account')}
            </Link>

            <Link
              href="/wishlist"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="h-4 w-4 mr-3" />
              {t('wishlist')}
            </Link>

          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              {t('signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
