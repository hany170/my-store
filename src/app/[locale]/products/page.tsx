import { createClient } from '@/lib/supabase/server';
import { getProducts } from '@/lib/db/products';
import { Link } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Filter, Grid3X3, List, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { SortSelect } from '@/components/products/SortSelect';
import { Search } from '@/components/ui/search';
import { SearchSuggestions } from '@/components/ui/search-suggestions';
import { SearchAnalytics } from '@/components/ui/search-analytics';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('products');
  const tCommon = await getTranslations('common');
  const tProduct = await getTranslations('product');

  const supabase = await createClient();
  const sp = await searchParams;

  const search = typeof sp.q === 'string' ? sp.q : undefined;
  const categorySlug = typeof sp.category === 'string' ? sp.category : undefined;
  const sort = (typeof sp.sort === 'string' ? sp.sort : undefined) as 'price-asc' | 'price-desc' | 'newest' | undefined;
  const page = Number(sp.page ?? 1);
  const view = typeof sp.view === 'string' ? sp.view : 'grid';

  // Get products and categories
  const { products, count, pageSize } = await getProducts(supabase, { search, categorySlug, sort, page });
  const { data: categories } = await supabase.from('categories').select('*').order('name');

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, count ?? 0);

  const sortOptions = [
    { value: 'newest', label: t('sortOptions.newest') },
    { value: 'price-asc', label: t('sortOptions.priceAsc') },
    { value: 'price-desc', label: t('sortOptions.priceDesc') },
    { value: 'name-asc', label: t('sortOptions.nameAsc') },
  ];

  const buildUrl = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (newParams.q || search) params.set('q', newParams.q || search || '');
    if (newParams.category || categorySlug) params.set('category', newParams.category || categorySlug || '');
    if (newParams.sort || sort) params.set('sort', newParams.sort || sort || '');
    if (newParams.page || (page !== 1)) params.set('page', newParams.page || String(page));
    if (newParams.view || view) params.set('view', newParams.view || view);
    return `/${locale}/products?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {search ? t('searchResults', { query: search }) : t('title')}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {count ? t('showing', { count }) : tCommon('loading')}
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Search 
                variant="default" 
                className="w-full sm:w-80"
                placeholder={tCommon('searchPlaceholder')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Sidebar Filters - Mobile: Full width, Desktop: Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-semibold text-foreground mb-4 flex items-center text-sm sm:text-base">
                <Filter className="h-4 w-4 mr-2" />
                {t('filterBy')}
              </h2>

              {/* Categories Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-foreground mb-3 text-sm sm:text-base">{t('category')}</h3>
                <div className="space-y-2">
                  <a
                    href={`/${locale}/products`}
                    className={`block text-sm py-2 px-3 rounded transition-colors ${!categorySlug
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                  >
                    {t('allCategories')}
                  </a>
                  {categories?.map((category) => (
                    <a
                      key={category.id}
                      href={`/${locale}/products?category=${category.slug}`}
                      className={`block text-sm py-2 px-3 rounded transition-colors ${categorySlug === category.slug
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(search || categorySlug || sort) && (
                <a
                  href={`/${locale}/products`}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {tCommon('clear')} {t('filterBy')}
                </a>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 order-1 lg:order-2">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <SortSelect
                  sortOptions={sortOptions}
                  currentSort={sort}
                  label={t('sortBy')}
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <a
                  href={buildUrl({ view: 'grid' })}
                  className={`p-2 rounded-lg transition-colors ${view === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </a>
                <a
                  href={buildUrl({ view: 'list' })}
                  className={`p-2 rounded-lg transition-colors ${view === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <List className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  {search ? t('searchNoResults', { query: search }) : t('noResults')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 px-4">
                  {search ? t('tryDifferentSearch') : 'Try adjusting your search or filter criteria'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`/${locale}/products`}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {tCommon('clear')} {t('filterBy')}
                  </a>
                  {search && (
                    <a
                      href={`/${locale}/products`}
                      className="inline-flex items-center px-4 py-2 bg-muted text-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      {t('viewAll')}
                    </a>
                  )}
                </div>
                
                {/* Search Suggestions */}
                {search && (
                  <div className="mt-8 pt-8 border-t border-border/40">
                    <SearchSuggestions showPopular={true} showRecent={true} maxSuggestions={4} />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className={view === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-stretch grid-auto-rows"
                  : "space-y-3 sm:space-y-6"
                }>
                  {products.map((product) => (
                    <div key={product.id} className={view === 'grid' ? "group" : "group flex flex-col sm:flex-row gap-3 sm:gap-4 bg-card border border-border rounded-lg p-3 sm:p-4 min-h-[160px]"}>
                      <a
                        href={`/${locale}/products/${product.slug}`}
                        className="block"
                      >
                        {view === 'grid' ? (
                          <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col min-h-[400px]">
                            <div className="aspect-square overflow-hidden flex-shrink-0">
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
                                  <span className="text-muted-foreground text-xs sm:text-sm">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="p-3 sm:p-4 flex-1 flex flex-col">
                              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full truncate max-w-[120px]">
                                  {(product as any).categories?.name || 'Uncategorized'}
                                </span>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-muted-foreground ml-1">4.8</span>
                                </div>
                              </div>
                              <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base flex-shrink-0">
                                {product.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                                {(product as any).description || 'No description available'}
                              </p>
                              <div className="flex items-center justify-between mt-auto flex-shrink-0">
                                <span className="text-base sm:text-lg font-bold text-foreground">
                                  {tCommon('currency')}{(product.price_cents / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.title}
                                  width={128}
                                  height={128}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <span className="text-muted-foreground text-xs">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col">
                              <div className="flex items-start justify-between mb-2 flex-shrink-0">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full truncate max-w-[120px]">
                                  {(product as any).categories?.name || 'Uncategorized'}
                                </span>
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-muted-foreground ml-1">4.8</span>
                                </div>
                              </div>
                              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors text-sm sm:text-base line-clamp-2">
                                {product.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                                {(product as any).description || 'No description available'}
                              </p>
                              <div className="flex items-center justify-between mt-auto flex-shrink-0">
                                <span className="text-base sm:text-lg font-bold text-foreground">
                                  {tCommon('currency')}{(product.price_cents / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </a>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 sm:mt-12">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                      {t('pagination.showing', { start: startItem, end: endItem, total: count })}
                      {totalPages > 1 && (
                        <span className="ml-2">• {t('pagination.pageOf', { current: page, total: totalPages })}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-end gap-2">
                      {page > 1 && (
                        <a
                          href={buildUrl({ page: String(page - 1) })}
                          className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">{tCommon('previous')}</span>
                        </a>
                      )}

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <a
                              key={pageNum}
                              href={buildUrl({ page: String(pageNum) })}
                              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium rounded-lg transition-colors ${pageNum === page
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground bg-background border border-border hover:bg-muted'
                                }`}
                            >
                              {pageNum}
                            </a>
                          );
                        })}
                      </div>

                      {page < totalPages && (
                        <a
                          href={buildUrl({ page: String(page + 1) })}
                          className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                          <span className="hidden sm:inline">{tCommon('next')}</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      
      {/* Search Analytics */}
      <SearchAnalytics 
        searchQuery={search} 
        resultsCount={count || 0}
      />
    </div>
  );
}


