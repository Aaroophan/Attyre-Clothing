'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/utils';

const primaryNavItems = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=new-arrivals', label: 'New Arrivals', category: 'new-arrivals' },
  { href: '/shop?category=sale', label: 'Sale', category: 'sale' },
  { href: '/contact', label: 'Contact' },
];

const utilityNavItems = [
  { href: '/cart', label: 'Cart' },
  { href: '/login', label: 'Login' },
  { href: '/admin', label: 'Admin' },
];

function isActiveLink(pathname: string, href: string): boolean {
  const cleanHref = href.split('?')[0];

  if (cleanHref === '/') {
    return pathname === '/';
  }

  if (cleanHref === '/shop') {
    return pathname === '/shop' || pathname.startsWith('/shop/');
  }

  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

export function AppHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totals } = useCart();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-max">
        <div className="flex min-h-20 items-center justify-between gap-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Attyre home">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-darker text-lg font-black text-white shadow-sm">
              A
            </span>
            <span className="leading-none">
              <span className="block text-2xl font-black tracking-tight text-dark">{SITE_NAME}</span>
              <span className="mt-1 block text-[0.65rem] font-black uppercase tracking-[0.24em] text-slate-500">
                Clothing Store
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {primaryNavItems.map((item) => {
              const active = isActiveLink(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-sm font-bold transition',
                    active
                      ? 'bg-sky-50 text-primary-darker'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-dark',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {utilityNavItems.map((item) => {
              const active = isActiveLink(pathname, item.href);
              const isCart = item.href === '/cart';
              const isLogin = item.href === '/login';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold transition',
                    isCart && 'border border-sky-200 bg-white text-primary-darker hover:bg-sky-50',
                    isLogin && 'bg-dark text-white hover:bg-primary-darker',
                    !isCart && !isLogin && 'text-slate-600 hover:bg-slate-100 hover:text-dark',
                    active && 'ring-2 ring-sky-200',
                  )}
                >
                  <span>{item.label}</span>
                  {isCart ? (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white">
                      {totals.itemCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-dark transition hover:bg-slate-50 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span className="flex w-5 flex-col gap-1.5">
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
            </span>
          </button>
        </div>

        {isMenuOpen ? (
          <nav className="grid gap-2 border-t border-slate-100 py-4 lg:hidden" aria-label="Mobile navigation">
            {[...primaryNavItems, ...utilityNavItems].map((item) => {
              const active = isActiveLink(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition',
                    active ? 'bg-sky-50 text-primary-darker' : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <span>{item.label}</span>
                  {item.href === '/cart' ? (
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-black text-white">
                      {totals.itemCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
