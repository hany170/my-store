'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  updateUserRole, 
  deleteUser, 
  resendInvitation 
} from '@/lib/server-actions/admin';
import { useRouter } from 'next/navigation';
import { 
  MoreHorizontal, 
  Users, 
  Mail, 
  Shield, 
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';

interface UserActionsProps {
  user: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    app_metadata?: { role?: string };
  };
}

export default function UserActions({ user }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isActive = !!user.email_confirmed_at;
  const isAdmin = user.app_metadata?.role === 'admin';

  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    if (newRole === user.app_metadata?.role) return;
    
    setIsLoading(true);
    try {
      const result = await updateUserRole(user.id, newRole);
      if (result.ok) {
        router.refresh();
      } else {
        alert(`Error updating role: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while updating the user role');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteUser(user.id);
      if (result.ok) {
        router.refresh();
      } else {
        alert(`Error deleting user: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while deleting the user');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleResendInvitation = async () => {
    setIsLoading(true);
    try {
      const result = await resendInvitation(user.email);
      if (result.ok) {
        alert('Invitation email sent successfully');
      } else {
        alert(`Error sending invitation: ${result.error}`);
      }
    } catch (error) {
      alert('An error occurred while sending the invitation');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-md shadow-lg z-50">
            <div className="py-1">
              {/* View Details */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Implement user details view
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors"
              >
                <Users className="h-4 w-4" />
                View Details
              </button>

              {/* Role Management */}
              {!isAdmin ? (
                <button
                  onClick={() => handleRoleChange('admin')}
                  disabled={isLoading}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Make Admin
                </button>
              ) : (
                <button
                  onClick={() => handleRoleChange('user')}
                  disabled={isLoading}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors"
                >
                  <UserX className="h-4 w-4" />
                  Remove Admin
                </button>
              )}

              {/* Resend Invitation for pending users */}
              {!isActive && (
                <button
                  onClick={handleResendInvitation}
                  disabled={isLoading}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-accent transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Resend Invitation
                </button>
              )}

              {/* Delete User */}
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
