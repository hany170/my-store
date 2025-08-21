"use client";
import { Link } from '@/i18n/routing';
import type { ReactNode } from 'react';

type Product = {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  images?: string[] | null;
  description?: string | null;
  category_name?: string | null;
  compare_at_cents?: number | null;
  stock_quantity?: number;
};

interface SafeProductLinkProps {
  product: Product;
  children: ReactNode;
  className?: string;
}

export function SafeProductLink({ product, children, className }: SafeProductLinkProps) {
  if (!product?.slug) {
    return <div className={className}>{children}</div>;
  }

  // Use string-based href to avoid locale params issues
  const href = `/products/${product.slug}`;

  return (
    <Link href={href as any} className={className}>
      {children}
    </Link>
  );
}