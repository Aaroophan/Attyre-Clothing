import type { Metadata } from 'next';
import Link from 'next/link';
import { PageContainer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Attyre Cash on Delivery checkout placeholder.',
};

export default function CheckoutPlaceholderPage() {
  return (
    <PageContainer className="py-16">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-primary/10 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-primary-darker">Next step</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-dark">Checkout comes next</h1>
        <p className="mt-4 text-base leading-7 text-gray-600">
          The cart is ready. The complete Cash on Delivery checkout form and order creation flow will be implemented in Issue 09.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/cart" className="btn-primary justify-center rounded-full">
            Back to cart
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-primary/30 px-6 py-3 font-semibold text-primary-darker transition hover:bg-primary/10"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
