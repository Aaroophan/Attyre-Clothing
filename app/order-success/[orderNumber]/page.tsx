import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui';
import { CURRENCY } from '@/lib/constants';
import { findOrderByNumber } from '@/lib/db';
import { formatDate, formatPrice } from '@/utils';

export const dynamic = 'force-dynamic';

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>;
}

function statusLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: OrderSuccessPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Order ${orderNumber}`,
    description: 'Attyre Cash on Delivery order confirmation.',
  };
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = await params;
  const order = await findOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <PageContainer className="py-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Order placed</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-dark sm:text-4xl">Thank you, {order.customerInfo.name}</h1>
          <p className="mt-4 text-sm leading-7 text-emerald-900 sm:text-base">
            Your Cash on Delivery order has been created successfully. Keep this order number for reference.
          </p>
          <div className="mx-auto mt-6 inline-flex rounded-full bg-white px-5 py-3 text-base font-black text-primary-darker shadow-sm">
            {order.orderNumber}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          <section className="card p-5 md:p-6" aria-labelledby="order-items-title">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Order items</p>
            <h2 id="order-items-title" className="mt-2 text-2xl font-black text-dark">What you ordered</h2>

            <div className="mt-5 divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={`${item.productId.toString()}-${item.size}-${item.color}`} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-base font-black text-dark">{item.name}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {item.size ? `Size ${item.size}` : 'One size'} · {item.color ?? 'Standard'} · Qty {item.quantity}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-slate-500">{formatPrice(item.price, CURRENCY)} each</p>
                    <p className="mt-1 text-base font-black text-primary-darker">{formatPrice(item.lineTotal, CURRENCY)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="card p-5 md:p-6" aria-labelledby="order-summary-title">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Summary</p>
              <h2 id="order-summary-title" className="mt-2 text-2xl font-black text-dark">Order total</h2>
              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-700">
                <div className="flex justify-between gap-4"><span>Subtotal</span><span>{formatPrice(order.subtotal, CURRENCY)}</span></div>
                <div className="flex justify-between gap-4"><span>Delivery fee</span><span>{formatPrice(order.deliveryFee, CURRENCY)}</span></div>
                <div className="flex justify-between gap-4 border-t border-slate-100 pt-4 text-base font-black text-dark">
                  <span>Total</span><span className="text-primary-darker">{formatPrice(order.total, CURRENCY)}</span>
                </div>
              </div>
            </section>

            <section className="card p-5 md:p-6" aria-labelledby="delivery-summary-title">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Delivery</p>
              <h2 id="delivery-summary-title" className="mt-2 text-xl font-black text-dark">Customer details</h2>
              <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                <p><span className="font-black text-dark">Phone:</span> {order.customerInfo.phone}</p>
                <p><span className="font-black text-dark">Email:</span> {order.customerInfo.email}</p>
                <p><span className="font-black text-dark">Address:</span> {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.district}</p>
                {order.customerInfo.note ? <p><span className="font-black text-dark">Note:</span> {order.customerInfo.note}</p> : null}
              </div>
            </section>

            <section className="card p-5 md:p-6" aria-labelledby="order-status-title">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Status</p>
              <h2 id="order-status-title" className="mt-2 text-xl font-black text-dark">Current progress</h2>
              <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
                <p><span className="font-black text-dark">Order:</span> {statusLabel(order.orderStatus)}</p>
                <p><span className="font-black text-dark">Payment:</span> Cash on Delivery · {statusLabel(order.paymentStatus)}</p>
                <p><span className="font-black text-dark">Created:</span> {formatDate(order.createdAt)}</p>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/shop" className="btn-primary">Continue shopping</Link>
          <Link href="/" className="btn-secondary">Back to home</Link>
        </div>
      </div>
    </PageContainer>
  );
}
