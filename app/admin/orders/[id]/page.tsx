import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CURRENCY } from '@/lib/constants';
import { findOrderById } from '@/lib/db/orders';
import { formatDate, formatPrice } from '@/utils';
import type { OrderStatus, PaymentStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

interface AdminOrderPreviewPageProps {
  params: Promise<{ id: string }>;
}

function labelStatus(status: OrderStatus | PaymentStatus): string {
  return status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'processing':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'shipped':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
    case 'delivered':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'cancelled':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

export async function generateMetadata({ params }: AdminOrderPreviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await findOrderById(id);

  return {
    title: order ? `Admin Order ${order.orderNumber}` : 'Admin Order',
    description: 'Protected Attyre admin order preview.',
  };
}

export default async function AdminOrderPreviewPage({ params }: AdminOrderPreviewPageProps) {
  const { id } = await params;
  const order = await findOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Order preview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">{order.orderNumber}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Read-only dashboard preview. Full status editing and operational order management will be expanded in Issue 15.
          </p>
        </div>
        <Link href="/admin" className="btn-secondary w-full md:w-auto">Back to dashboard</Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="card p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-dark">Order items</h2>
            <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusBadgeClass(order.orderStatus)}`}>
              {labelStatus(order.orderStatus)}
            </span>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={`${item.slug}-${item.size}-${item.color}`} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center">
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
        </div>

        <aside className="grid gap-6">
          <section className="card p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Customer</p>
            <h2 className="mt-2 text-xl font-black text-dark">Delivery details</h2>
            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              <p><span className="font-black text-dark">Name:</span> {order.customerInfo.name}</p>
              <p><span className="font-black text-dark">Email:</span> {order.customerInfo.email}</p>
              <p><span className="font-black text-dark">Phone:</span> {order.customerInfo.phone}</p>
              <p><span className="font-black text-dark">Address:</span> {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.district}</p>
              {order.customerInfo.note ? <p><span className="font-black text-dark">Note:</span> {order.customerInfo.note}</p> : null}
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Payment</p>
            <h2 className="mt-2 text-xl font-black text-dark">Cash on Delivery</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              <div className="flex justify-between gap-4"><span>Subtotal</span><span>{formatPrice(order.subtotal, CURRENCY)}</span></div>
              <div className="flex justify-between gap-4"><span>Delivery fee</span><span>{formatPrice(order.deliveryFee, CURRENCY)}</span></div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-4 text-base font-black text-dark">
                <span>Total</span><span className="text-primary-darker">{formatPrice(order.total, CURRENCY)}</span>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p>Payment status: {labelStatus(order.paymentStatus)}</p>
                <p className="mt-1">Created: {formatDate(order.createdAt)}</p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
