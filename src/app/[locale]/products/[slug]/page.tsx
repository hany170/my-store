import { createClient } from '@/lib/supabase/server';
import { getProductBySlug, getRelatedProducts } from '@/lib/db/products';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { WishlistButton } from '@/components/products/WishlistButton';
import { Link } from '@/i18n/routing';
import NextLink from 'next/link';
import { Suspense } from 'react';

import { Separator } from '@/components/ui';
import { 
  Truck, 
  Shield, 
  RotateCcw, 
  Star, 
  Heart, 
  Share2,
  Package,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui';

// Updated interface to include both locale and slug
interface Params {
  locale: string;
  slug: string;
}

// Loading component for better UX
function ProductImageSkeleton() {
  return (
    <div className="aspect-square overflow-hidden rounded-lg bg-muted animate-pulse">
      <div className="h-full w-full bg-muted/50" />
    </div>
  );
}

function RelatedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-muted rounded-lg mb-3" />
          <div className="h-4 bg-muted rounded mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<Params> 
}) {
  const { slug, locale } = await params;
  const supabase = await createClient();
  
  try {
    const product = await getProductBySlug(supabase, slug);
    
    if (!product) return notFound();
    
    const related = product.category_name ? 
      await getRelatedProducts(supabase, (product as { categories?: { slug?: string } }).categories?.slug || '', product.id) : 
      [];

    const isOnSale = product.compare_at_cents && product.compare_at_cents > product.price_cents;
    const discountPercentage = isOnSale && product.compare_at_cents ? 
      Math.round(((product.compare_at_cents - product.price_cents) / product.compare_at_cents) * 100) : 0;

    return (
      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <nav className="px-6 sm:px-8 md:px-12 py-4 border-b border-border">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <NextLink href={`/${locale}`} className="hover:text-foreground transition-colors">Home</NextLink>
            </li>
            <li>/</li>
            <li>
              <NextLink href={`/${locale}/products`} className="hover:text-foreground transition-colors">Products</NextLink>
            </li>
            {product.category_name && (
              <>
                <li>/</li>
                <li>
                  <NextLink 
                    href={`/${locale}/products?category=${(product as { categories?: { slug?: string } }).categories?.slug || ''}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {product.category_name}
                  </NextLink>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-foreground font-medium">{product.title}</li>
          </ol>
        </nav>

        <div className="px-6 sm:px-8 md:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <Suspense fallback={<ProductImageSkeleton />}>
                <div className="aspect-square overflow-hidden rounded-xl bg-muted border border-border">
                  {product.images?.[0] ? (
                    <Image 
                      src={product.images[0]} 
                      alt={product.title} 
                      width={900} 
                      height={900} 
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" 
                      priority
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-muted-foreground">
                      <Package className="h-16 w-16" />
                      <p className="mt-2">No image available</p>
                    </div>
                  )}
                </div>
              </Suspense>
              
              {/* Additional images grid */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg bg-muted border border-border cursor-pointer hover:opacity-80 transition-opacity">
                      <Image 
                        src={image} 
                        alt={`${product.title} ${index + 2}`} 
                        width={200} 
                        height={200} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category and Status */}
              <div className="flex items-center gap-3">
                {product.category_name && (
                  <Badge variant="secondary" className="text-xs">
                    {product.category_name}
                  </Badge>
                )}
                <Badge 
                  variant={product.stock_quantity > 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
                {isOnSale && (
                  <Badge variant="destructive" className="text-xs">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
              
              {/* SKU */}
              {product.sku && (
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              )}

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ${(product.price_cents / 100).toFixed(2)}
                </span>
                {isOnSale && product.compare_at_cents && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${(product.compare_at_cents / 100).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" />
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600 dark:text-green-400">
                    {product.stock_quantity} units available
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Currently out of stock</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Add to Cart */}
              <div className="space-y-4">
                <AddToCartButton 
                  productId={product.id} 
                  disabled={product.stock_quantity <= 0} 
                />
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <WishlistButton productId={product.id} />
                  <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>

              {/* Features */}
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  <span>30-day returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Fast delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related?.length ? (
            <section className="mt-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
                <NextLink 
                  href={`/${locale}/products`} 
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View all products →
                </NextLink>
              </div>
              
              <Suspense fallback={<RelatedProductsSkeleton />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {related.map((p) => (
                    <div key={p.id} className="group">
                      <NextLink href={`/${locale}/products/${p.slug}`} className="block">
                        <div className="aspect-square overflow-hidden rounded-lg bg-muted border border-border group-hover:border-border/60 transition-colors">
                          {p.images?.[0] ? (
                            <Image 
                              src={p.images[0]} 
                              alt={p.title} 
                              width={600} 
                              height={600} 
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <div className="h-full w-full grid place-items-center text-muted-foreground">
                              <Package className="h-12 w-12" />
                            </div>
                          )}
                        </div>
                        <div className="mt-3 space-y-1">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {p.title}
                          </h3>
                          <p className="font-semibold text-foreground">
                            ${(p.price_cents / 100).toFixed(2)}
                          </p>
                        </div>
                      </NextLink>
                    </div>
                  ))}
                </div>
              </Suspense>
            </section>
          ) : null}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    throw new Error('Failed to load product details');
  }
}

// Also update the generateMetadata function
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<Params>; 
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const supabase = await createClient();
  
  try {
    const product = await getProductBySlug(supabase, slug);
    
    if (!product) return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    };
    
    const title = `${product.title} – Aurora Store`;
    const description = product.description ?? `Discover ${product.title} at Aurora Store. High-quality products with competitive pricing.`;
    const images = product.images?.length ? [{ url: product.images[0] }] : [];
    
    return {
      title,
      description,
      openGraph: { 
        title, 
        description, 
        images,
        type: 'website',
        locale: locale
      },
      twitter: { 
        card: 'summary_large_image', 
        title, 
        description, 
        images 
      },
      alternates: {
        canonical: `/products/${slug}`,
        languages: {
          'en': `/en/products/${slug}`,
          'ar': `/ar/products/${slug}`
        }
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product – Aurora Store',
      description: 'Product details from Aurora Store'
    };
  }
}