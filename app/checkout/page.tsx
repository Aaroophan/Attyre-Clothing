import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutPageClient } from '@/components/checkout';
import { PageContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Attyre Cash on Delivery order.',
};

export default function CheckoutPage() {
  return (
    <PageContainer className="py-10 md:py-14">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500" aria-label="Checkout breadcrumb">
        <Link href="/" className="transition hover:text-primary-darker">Home</Link>
        <span>/</span>
        <Link href="/cart" className="transition hover:text-primary-darker">Cart</Link>
        <span>/</span>
        <span className="text-dark">Checkout</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-darker">Cash on Delivery checkout</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-dark sm:text-4xl lg:text-5xl">Confirm your delivery details</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          Attyre uses a simple Cash on Delivery flow for this release. Product prices and stock are rechecked on the server before the order is saved.
        </p>
      </header>

      <CheckoutPageClient />
    </PageContainer>
  );
}
