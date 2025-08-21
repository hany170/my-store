import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Store',
  description: 'Modern e-commerce store with authentication',
};

// This file is required for next-intl with App Router
// The locale layout will handle the HTML structure
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
