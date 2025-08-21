import createMiddleware from 'next-intl/middleware';
import {localePrefix, pathnames} from './i18n/routing';

export default createMiddleware({
  locales : ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix,
  pathnames
});

export const config = { 
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|auth/callback|.*\\..*).*)'
  ]
};
