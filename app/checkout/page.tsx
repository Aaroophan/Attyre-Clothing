import type { Metadata } from 'next';
import Link from 'next/link';
import { PageContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Attyre Cash on Delivery checkout placeholder.',
};

export default function CheckoutPlaceholderPage() {
  return (
    <PageContainer className="py-10 md:py-14">
      <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Next step</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-dark sm:text-4xl">Checkout comes next</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          The cart is ready. The complete Cash on Delivery checkout form and order creation flow will be implemented in Issue 09.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/cart" className="btn-primary">Back to cart</Link>
          <Link href="/shop" className="btn-secondary">Continue shopping</Link>
        </div>
      </div>
    </PageContainer>
  );
}
