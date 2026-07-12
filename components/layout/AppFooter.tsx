import Link from 'next/link';
import { PageContainer } from '@/components/ui';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/constants';

const shopLinks = [
  { href: '/shop', label: 'All products' },
  { href: '/shop?category=men', label: 'Menswear' },
  { href: '/shop?category=women', label: 'Womenswear' },
  { href: '/shop?category=sale', label: 'Sale' },
];

const supportLinks = [
  { href: '/contact', label: 'Contact' },
  { href: '/cart', label: 'Cart' },
  { href: '/login', label: 'Customer login' },
  { href: '/admin', label: 'Admin' },
];

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-dark text-white">
      <PageContainer className="py-10 md:py-12">
        <div className="grid gap-10 md:grid-cols-[1.6fr_0.7fr_0.7fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Attyre home">
              <span className="block text-3xl font-black tracking-wide bg-gradient-to-r from-primary via-primary-dark to-primary-darker bg-clip-text text-transparent ps-1" style={{ fontFamily: 'Mistral, "Brush Script MT", cursive' }} >
                {SITE_NAME}
              </span>
            </Link>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
              {SITE_DESCRIPTION}. Browse curated clothing, place Cash on Delivery orders, and manage essentials through a simple business-ready storefront.
            </p>
            <div className="mt-5 grid gap-2 text-sm text-slate-300">
              <span>Email: hello@attyre.local</span>
              <span>Phone: +94 76 000 0000</span>
              <span>Location: Colombo, Sri Lanka</span>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.24em] text-primary">Shop</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-300">
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
            <h2 className="text-xs font-black uppercase tracking-[0.24em] text-primary">Support</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-300">
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

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {SITE_NAME}. Built for a small-to-medium clothing business workflow.
        </div>
      </PageContainer>
    </footer>
  );
}
