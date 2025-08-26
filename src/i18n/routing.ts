import {createNavigation} from 'next-intl/navigation';

export const locales = ['en', 'ar'] as const;
export const localePrefix = 'always';

export const pathnames = {
  '/': '/',
  '/en/products/[slug]': '/en/products/[slug]',
  '/products': '/products',
  '/cart': '/cart',
  '/wishlist': '/wishlist',
  '/checkout': '/checkout',
  '/orders/[id]': '/orders/[id]',
  '/auth/sign-in': '/auth/sign-in',
  '/auth/sign-up': '/auth/sign-up',
  '/account': '/account',
  '/admin': '/admin',
  '/admin/products': '/admin/products',
  '/admin/products/new': '/admin/products/new',
  '/admin/users': '/admin/users',
  '/admin/settings': '/admin/settings',
  '/contact': '/contact',
  '/faq': '/faq',
  '/shipping': '/shipping',
  '/returns': '/returns',
  '/about': '/about',
  '/privacy': '/privacy',
  '/terms': '/terms'
} as const;

export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation({
  locales,
  localePrefix,
  pathnames
});
