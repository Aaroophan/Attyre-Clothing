import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { CartProvider } from '@/components/cart/CartProvider';
import { AppFooter, AppHeader } from '@/components/layout';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Online Clothing Store`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: 'Attyre Team' }],
  keywords: [
    'Attyre',
    'clothing',
    'fashion',
    'e-commerce',
    'cash on delivery',
    'Sri Lanka clothing store',
  ],
  openGraph: {
    title: `${SITE_NAME} - Online Clothing Store`,
    description: SITE_DESCRIPTION,
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#003459',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-[#f7fbfd] text-dark antialiased">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <Suspense fallback={<div className="min-h-16 border-b border-slate-200 bg-white sm:min-h-20" />}><AppHeader /></Suspense>
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
            <AppFooter />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
