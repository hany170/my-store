import { createClient } from '@/lib/supabase/server';
import { getFeaturedProducts, type DbProduct } from '@/lib/db/products';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Star, Shield, Truck, RefreshCw } from 'lucide-react';
import { Search } from '@/components/ui/search';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const tHome = await getTranslations('home');
  const tHero = await getTranslations('hero');
  const tProduct = await getTranslations('product');
  const tCommon = await getTranslations('common');

  let featured: DbProduct[] = [];
  let categories: Array<{ id: string; name: string; slug: string; description?: string }> = [];
  let error = null;

  try {
    const supabase = await createClient();
    featured = await getFeaturedProducts(supabase, 8);

    // Debug: Check if products have slugs
    console.log('Featured products:', featured.map(p => ({ id: p.id, title: p.title, slug: p.slug })));

    // Get categories for the category section
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .limit(4);
    categories = categoriesData || [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load products';
    console.error('Database error:', e);
  }

  const features = [
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: 'Premium materials and craftsmanship'
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery on orders over $50'
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day hassle-free returns'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              {tHero('title')}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              {tHero('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-slate-900 hover:bg-white/90 transition-colors"
              >
                {tHero('cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-colors"
              >
                {tHome('viewAll')}
              </Link>
            </div>
            
            {/* Hero Search */}
            <div className="max-w-2xl mx-auto">
              <Search variant="hero" placeholder={tHero('searchPlaceholder')} />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{tHome('categories')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover our carefully curated collections
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}` as any}
                  className="group relative overflow-hidden rounded-2xl bg-muted hover:bg-muted/80 transition-colors p-8 text-center"
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{tHome('featured')}</h2>
              <p className="text-lg text-muted-foreground">
                Handpicked products just for you
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center text-primary hover:text-primary/80 font-medium"
            >
              {tHome('viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <p className="text-destructive font-medium mb-2">Error loading products</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : featured.length === 0 ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">No products found</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">The database might need to be seeded.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.map((product) => (
                  <div key={product.id} className="group">
                    <Link href={`/products/${product.slug}` as any} className="block">
                      <div className="relative overflow-hidden rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                        <div className="aspect-square overflow-hidden">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              width={400}
                              height={400}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {product.category_name || 'Uncategorized'}
                            </span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground ml-1">4.8</span>
                            </div>
                          </div>

                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {product.title}
                          </h3>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-foreground">
                                {tCommon('currency')}{(product.price_cents / 100).toFixed(2)}
                              </span>
                              {product.compare_at_cents && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {tCommon('currency')}{(product.compare_at_cents / 100).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {tHome('viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 sm:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stay in the loop
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about new products, exclusive offers, and updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-foreground bg-background border-0 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
              />
              <button className="px-6 py-3 bg-primary-foreground text-primary font-semibold rounded-lg hover:bg-primary-foreground/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
