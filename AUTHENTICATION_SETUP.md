# Authentication Setup Guide

This guide will help you set up authentication with Supabase and Google OAuth for your Next.js application.

## Prerequisites

- A Supabase project
- Google Cloud Console project
- Next.js application with the required dependencies

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

### Environment Variables

Create a `.env.local` file in your project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Google OAuth Setup

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)
7. Note down your Client ID and Client Secret

### Configure Supabase with Google OAuth

1. In your Supabase dashboard, go to "Authentication" → "Providers"
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth Client ID
   - Client Secret: Your Google OAuth Client Secret
4. Save the configuration

## 3. Application Features

### Authentication Pages

The application includes the following authentication pages:

- `/auth` - Main authentication landing page
- `/auth/sign-in` - Sign in with email/password or Google
- `/auth/sign-up` - Create account with email/password or Google
- `/auth/callback` - OAuth callback handler

### Components

- `UserProfile` - Displays user information and sign-out button
- `ProtectedRoute` - Guards routes that require authentication
- `useAuth` hook - Manages authentication state

### Features

- ✅ Google OAuth authentication
- ✅ Email/password authentication
- ✅ User profile management
- ✅ Protected routes
- ✅ Automatic session management
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

## 4. Usage Examples

### Using the useAuth Hook

```tsx
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, signOut, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.email}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protecting Routes

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>This is a protected page</div>
    </ProtectedRoute>
  );
}
```

### User Profile Component

```tsx
import { UserProfile } from '@/components/UserProfile';

function AccountPage() {
  return (
    <div>
      <h1>Account</h1>
      <UserProfile />
    </div>
  );
}
```

## 5. File Structure

```
src/
├── app/
│   └── [locale]/
│       └── auth/
│           ├── page.tsx              # Auth landing page
│           ├── sign-in/
│           │   └── page.tsx          # Sign in page
│           ├── sign-up/
│           │   └── page.tsx          # Sign up page
│           └── callback/
│               └── page.tsx          # OAuth callback
├── components/
│   ├── UserProfile.tsx               # User profile component
│   └── ProtectedRoute.tsx            # Route protection
├── lib/
│   ├── auth.ts                       # Server-side auth utilities
│   ├── hooks/
│   │   └── useAuth.ts                # Client-side auth hook
│   └── supabase/
│       ├── client.ts                 # Client-side Supabase
│       └── server.ts                 # Server-side Supabase
```

## 6. Security Considerations

- Always use environment variables for sensitive data
- Implement proper CORS settings in Supabase
- Use HTTPS in production
- Regularly rotate OAuth secrets
- Implement rate limiting
- Validate user input
- Use secure session management

## 7. Troubleshooting

### Common Issues

1. **OAuth redirect errors**: Ensure redirect URIs are correctly configured
2. **CORS errors**: Check Supabase CORS settings
3. **Session not persisting**: Verify cookie settings
4. **Google OAuth not working**: Check Google Cloud Console settings

### Debug Mode

Enable debug mode in your Supabase client for development:

```tsx
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      debug: true
    }
  }
);
```

## 8. Next Steps

- Add email verification
- Implement password reset
- Add social login providers (GitHub, Facebook, etc.)
- Create user roles and permissions
- Add two-factor authentication
- Implement account deletion
- Add audit logging

## Support

For issues related to:
- Supabase: [Supabase Documentation](https://supabase.com/docs)
- Google OAuth: [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- Next.js: [Next.js Documentation](https://nextjs.org/docs)
