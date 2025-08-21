"use client";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations();
  
  // Safe access to brand name with fallback
  const brandName = (() => {
    try {
      return tCommon('brand');
    } catch (error) {
      return 'Aurora';
    }
  })();

  const quickLinks = [
    { name: tNav('home'), href: '/' },
    { name: tNav('products'), href: '/products' },
    { name: tNav('cart'), href: '/cart' },
    { name: tNav('account'), href: '/account' },
  ];

  const customerService = [
    { name: t('contact'), href: '/contact' },
    { name: t('faq'), href: '/faq' },
    { name: t('shipping'), href: '/shipping' },
    { name: t('returns'), href: '/returns' },
  ];

  const company = [
    { name: t('about'), href: '/about' },
    { name: t('privacyPolicy'), href: '/privacy' },
    { name: t('termsOfService'), href: '/terms' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border/40 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-foreground">{brandName}</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('description')}
            </p>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-2">{t('newsletter')}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t('newsletterDescription')}
              </p>
              <div className="flex max-w-md">
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-r-lg hover:bg-primary/90 transition-colors">
                  {t('subscribe')}
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">{t('followUs')}</h3>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      aria-label={social.name}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('customerService')}</h3>
            <ul className="space-y-3">
              {customerService.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t('company')}</h3>
            <ul className="space-y-3">
              {company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. {t('allRightsReserved')}
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link
              href={"/privacy" as any}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('privacyPolicy')}
            </Link>
            <Link
              href={"/terms" as any}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


