import type { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  title: `${SITE_NAME} - Premium Clothing Store`,
  description: SITE_DESCRIPTION,
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  authors: [{ name: 'Attyre Team' }],
  keywords: ['clothing', 'fashion', 'e-commerce', 'mens', 'womens', 'kids'],
  openGraph: {
    title: `${SITE_NAME} - Premium Clothing Store`,
    description: SITE_DESCRIPTION,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#00a7e1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white text-dark">
        <div className="min-h-screen flex flex-col">
          <header className="bg-dark text-white py-4 shadow-md">
            <div className="container-max">
              <h1 className="text-2xl font-bold">{SITE_NAME}</h1>
              <p className="text-sm text-gray-300">Premium Clothing Store</p>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="bg-dark text-white py-8 mt-12">
            <div className="container-max">
              <p className="text-center text-gray-300">
                &copy; 2024 {SITE_NAME}. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
