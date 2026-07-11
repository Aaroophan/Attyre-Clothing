import type { Metadata, Viewport } from 'next';
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
    <html lang="en">
      <body className="bg-[#f7fbfd] text-dark antialiased">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
            <AppFooter />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
