import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WishlistClient } from './WishlistClient';

interface Params {
  locale: string;
}

export default async function WishlistPage({ 
  params 
}: { 
  params: Promise<Params> 
}) {
  const { locale } = await params;
  const t = await getTranslations('wishlist');

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <nav className="px-6 sm:px-8 md:px-12 py-4 border-b border-border">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <a href={`/${locale}`} className="hover:text-foreground transition-colors">
              Home
            </a>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">Wishlist</li>
        </ol>
      </nav>

      <div className="px-6 sm:px-8 md:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">{t('title')}</h1>
          
          <WishlistClient locale={locale} />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<Params>; 
}): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'ar' ? 'قائمة الأمنيات - متجر أورورا' : 'Wishlist – Aurora Store',
    description: locale === 'ar' 
      ? 'عرض وإدارة المنتجات في قائمة أمنياتك' 
      : 'View and manage products in your wishlist',
    alternates: {
      canonical: `/wishlist`,
      languages: {
        'en': `/en/wishlist`,
        'ar': `/ar/wishlist`
      }
    }
  };
}
