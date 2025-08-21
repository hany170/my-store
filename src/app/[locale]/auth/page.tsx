"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Failed to authenticate with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome to My Store
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Sign in to your account or create a new one to get started
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-6 border">
          {/* Google Authentication */}
          <Button
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 h-12 text-base"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isGoogleLoading ? 'Authenticating...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Sign In Option */}
          <div className="space-y-4">
            <div className="flex items-center p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                 onClick={() => router.push('/auth/sign-in')}>
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mr-4">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Sign in with email</h3>
                <p className="text-sm text-muted-foreground">Already have an account? Sign in here</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Sign Up Option */}
            <div className="flex items-center p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                 onClick={() => router.push('/auth/sign-up')}>
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mr-4">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Create new account</h3>
                <p className="text-sm text-muted-foreground">New to My Store? Create your account</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* Features */}
          <div className="pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Why choose My Store?</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                Secure authentication with Google OAuth
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                Fast and reliable shopping experience
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                ️24/7 customer support
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary hover:text-primary/80">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
