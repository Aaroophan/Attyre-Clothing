import Link from 'next/link';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/constants';
import { PageContainer } from '@/components/ui';

const shopLinks = [
  { href: '/shop', label: 'All Products' },
  { href: '/shop?category=mens', label: 'Menswear' },
  { href: '/shop?category=womens', label: 'Womenswear' },
  { href: '/shop?category=sale', label: 'Sale' },
];

const supportLinks = [
  { href: '/contact', label: 'Contact' },
  { href: '/cart', label: 'Cart' },
  { href: '/login', label: 'Customer Login' },
  { href: '/admin', label: 'Admin' },
];

export function AppFooter() {
  return (
    <footer className="mt-20 border-t border-primary/10 bg-dark text-white">
      <PageContainer className="py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Attyre home">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-black text-primary-darker">
                A
              </span>
              <span>
                <span className="block text-2xl font-black tracking-tight">{SITE_NAME}</span>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Clothing Store
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-gray-300">
              {SITE_DESCRIPTION}. Browse curated clothing, place Cash on Delivery orders, and manage essentials through a simple business-ready storefront.
            </p>
            <div className="mt-5 grid gap-2 text-sm text-gray-300">
              <span>Email: hello@attyre.local</span>
              <span>Phone: +94 76 000 0000</span>
              <span>Location: Colombo, Sri Lanka</span>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Shop</h2>
            <ul className="mt-4 grid gap-3 text-sm text-gray-300">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Support</h2>
            <ul className="mt-4 grid gap-3 text-sm text-gray-300">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {SITE_NAME}. Built for a small-to-medium clothing business workflow.
        </div>
      </PageContainer>
    </footer>
  );
}
