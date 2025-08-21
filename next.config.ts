import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: '**.supabase.co'},
      {protocol: 'https', hostname: 'images.unsplash.com'}
    ]
  }
};

export default withNextIntl(nextConfig);
