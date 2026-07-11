'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/utils';

const primaryNavItems = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=new-arrivals', label: 'New Arrivals' },
  { href: '/shop?category=sale', label: 'Sale' },
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

  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

export function AppHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="container-max">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3" aria-label="Attyre home">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-darker text-lg font-black text-white shadow-md shadow-primary/20">
              A
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tight text-dark group-hover:text-primary-darker">
                {SITE_NAME}
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
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
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    active
                      ? 'bg-primary/10 text-primary-darker'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-dark'
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
              const isAdmin = item.href === '/admin';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-semibold transition',
                    isCart && 'border border-primary/30 text-primary-darker hover:bg-primary/10',
                    isAdmin && 'text-gray-500 hover:bg-gray-100 hover:text-dark',
                    !isCart && !isAdmin && 'bg-dark text-white hover:bg-primary-darker',
                    active && 'ring-2 ring-primary/30'
                  )}
                >
                  {item.label}
                  {isCart ? (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">0</span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 p-3 text-dark transition hover:bg-gray-100 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span className="sr-only">Toggle menu</span>
            <span className="flex h-5 w-5 flex-col justify-center gap-1.5">
              <span className="h-0.5 w-full rounded-full bg-current" />
              <span className="h-0.5 w-full rounded-full bg-current" />
              <span className="h-0.5 w-full rounded-full bg-current" />
            </span>
          </button>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-gray-100 py-4 lg:hidden">
            <nav className="grid gap-2" aria-label="Mobile navigation">
              {[...primaryNavItems, ...utilityNavItems].map((item) => {
                const active = isActiveLink(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'rounded-xl px-4 py-3 text-sm font-semibold transition',
                      active
                        ? 'bg-primary/10 text-primary-darker'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
