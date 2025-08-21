"use client";
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Auth callback page loaded');
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Session data:', data);
        console.log('Session error:', error);
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          router.replace('/auth/sign-in');
          return;
        }

        if (data.session) {
          console.log('Session found, redirecting to home');
          toast.success('Successfully signed in!');
          router.replace('/');
        } else {
          console.log('No session found, redirecting to sign-in');
          // No session found, redirect to sign-in
          router.replace('/auth/sign-in');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        toast.error('An unexpected error occurred. Please try again.');
        router.replace('/auth/sign-in');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
