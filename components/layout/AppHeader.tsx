'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { SITE_NAME } from '@/lib/constants';
import type { PublicUser } from '@/types/auth';
import { cn } from '@/utils';

const primaryNavItems = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=new-arrivals', label: 'New Arrivals', category: 'new-arrivals' },
  { href: '/shop?category=sale', label: 'Sale', category: 'sale' },
  { href: '/contact', label: 'Contact' },
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
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { totals } = useCart();

  function isCurrentItem(item: { href: string; category?: string }): boolean {
    if (item.category) {
      return pathname === '/shop' && searchParams.get('category') === item.category;
    }

    if (item.href === '/shop') {
      return (pathname === '/shop' && !searchParams.get('category')) || pathname.startsWith('/shop/');
    }

    return isActiveLink(pathname, item.href);
  }

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await globalThis.fetch('/api/auth/me', { cache: 'no-store' });
        const result = await response.json() as { user: PublicUser | null };

        if (isMounted) {
          setCurrentUser(result.user);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await globalThis.fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      globalThis.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-max">
        <div className="flex min-h-16 items-center justify-between gap-3 py-3 sm:min-h-20 sm:gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Attyre home">
            <span className="leading-none">
              <span className="block text-3xl font-black tracking-wide scale-200 bg-gradient-to-r from-primary via-primary-dark to-primary-darker bg-clip-text text-transparent px-1" style={{ fontFamily: 'Mistral, "Brush Script MT", cursive' }} >
                {SITE_NAME}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {primaryNavItems.map((item) => {
              const active = isCurrentItem(item);

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
            <Link
              href="/cart"
              aria-current={isActiveLink(pathname, '/cart') ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-10 items-center justify-center rounded-full border border-sky-200 bg-white px-4 text-sm font-bold text-primary-darker transition hover:bg-sky-50',
                isActiveLink(pathname, '/cart') && 'ring-2 ring-sky-200',
              )}
            >
              <span>Cart</span>
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white">
                {totals.itemCount}
              </span>
            </Link>

            {currentUser ? (
              <>
                <Link
                  href="/account/orders"
                  aria-current={isActiveLink(pathname, '/account/orders') ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-dark',
                    isActiveLink(pathname, '/account/orders') && 'ring-2 ring-sky-200',
                  )}
                >
                  Orders
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-dark px-4 text-sm font-bold text-white transition hover:bg-primary-darker disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isLoggingOut ? 'Leaving...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-dark">
                  Login
                </Link>
                <Link href="/register" className="inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-dark">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-dark transition hover:bg-slate-50 lg:hidden"
            aria-label="Toggle navigation menu"
            aria-controls="mobile-primary-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span aria-hidden="true" className="flex w-5 flex-col gap-1.5">
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
              <span className="h-0.5 rounded-full bg-current" />
            </span>
          </button>
        </div>

        {isMenuOpen ? (
          <nav id="mobile-primary-navigation" className="grid gap-2 border-t border-slate-100 py-4 lg:hidden" aria-label="Mobile navigation">
            {[
              ...primaryNavItems,
              { href: '/cart', label: 'Cart' },
              ...(currentUser ? [{ href: '/account/orders', label: 'Orders' }] : [{ href: '/login', label: 'Login' }, { href: '/register', label: 'Register' }]),
              { href: '/admin', label: 'Admin' },
            ].map((item) => {
              const active = isCurrentItem(item);

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

            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  void handleLogout();
                }}
                disabled={isLoggingOut}
                className="flex items-center justify-between rounded-2xl bg-dark px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-darker disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-300">{currentUser.name}</span>
              </button>
            ) : null}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
