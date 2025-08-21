import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import '../globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/CartProvider';
import { WishlistProvider } from '@/components/WishlistProvider';
import { CartMergeHandler } from '@/components/CartMergeHandler';

function getDir(locale: string) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export default async function LocaleLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale} timeZone="UTC">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CartProvider>
          <WishlistProvider>
            <CartMergeHandler />
            <div className="flex flex-col min-h-screen">
              <Suspense fallback={<div className="h-16 bg-background border-b" />}>
                <Header />
              </Suspense>
              <main className="flex-1">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                  {children}
                </Suspense>
              </main>
              <Suspense fallback={<div className="h-32 bg-muted/30 border-t" />}>
                <Footer />
              </Suspense>
            </div>
            <Toaster richColors position="top-center" />
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}


