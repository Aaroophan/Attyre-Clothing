'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { SITE_NAME } from '@/lib/constants';
import type { PublicUser } from '@/types/auth';
import { cn } from '@/utils';
import { AdminLogoutButton } from './AdminLogoutButton';

interface AdminShellProps {
  user: PublicUser;
  children: ReactNode;
}

const adminNavItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    description: 'Overview',
  },
  {
    href: '/admin/products',
    label: 'Products',
    description: 'Catalog management',
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    description: 'Store sections',
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    description: 'COD processing',
  },
];

function isActiveAdminLink(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <section className="bg-slate-50 py-6 md:py-8">
      <div className="p-5 max-w-[90vw] mx-auto">
        <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="card h-fit overflow-hidden lg:sticky lg:top-6">
            <div className="border-b border-slate-100 bg-gradient-to-br from-primary-darker to-primary-dark p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-100">Admin area</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">{SITE_NAME}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-sky-50">
                Product, category, inventory, and order administration.
              </p>
            </div>

            <div className="p-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Signed in as</p>
                <p className="mt-1 truncate text-sm font-black text-dark">{user.name}</p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">{user.email}</p>
              </div>

              <nav className="mt-4 grid gap-2" aria-label="Admin navigation">
                {adminNavItems.map((item) => {
                  const active = isActiveAdminLink(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'rounded-2xl border px-4 py-3 transition',
                        active
                          ? 'border-sky-200 bg-sky-50 text-primary-darker shadow-sm'
                          : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-white hover:text-dark',
                      )}
                    >
                      <span className="block text-sm font-black">{item.label}</span>
                      <span className="mt-0.5 block text-xs font-semibold text-slate-500">{item.description}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4">
                <Link href="/" className="btn-secondary w-full text-xs">
                  View storefront
                </Link>
                <AdminLogoutButton />
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-5 rounded-3xl border border-sky-100 bg-white p-4 shadow-sm md:flex md:items-center md:justify-between md:gap-4 md:p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-darker">Protected dashboard</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Only users with the <span className="font-black text-dark">admin</span> role can access these pages.
                </p>
              </div>
              <span className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-700 md:mt-0">
                Admin verified
              </span>
            </div>

            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
