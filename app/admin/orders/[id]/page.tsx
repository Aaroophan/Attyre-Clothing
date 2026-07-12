import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { OrderStatusBadge, OrderStatusUpdateForm, PaymentStatusBadge } from '@/components/admin/orders';
import { CURRENCY } from '@/lib/constants';
import { findOrderById } from '@/lib/db/orders';
import { objectIdToString } from '@/lib/db/object-id';
import { orderStatusLabel, paymentStatusLabel } from '@/lib/order-status';
import { formatDate, formatPrice } from '@/utils';

export const dynamic = 'force-dynamic';

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AdminOrderPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await findOrderById(id);

  return {
    title: order ? `Admin Order ${order.orderNumber}` : 'Admin Order',
    description: 'Protected Attyre admin order management page.',
  };
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  const order = await findOrderById(id);

  if (!order) {
    notFound();
  }

  const orderId = objectIdToString(order._id);
  const unitCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const statusHistory = order.statusHistory ?? [
    {
      status: order.orderStatus,
      changedAt: order.updatedAt,
      note: 'Current order status.',
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Order management</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-dark md:text-4xl">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Inspect Cash on Delivery order details, review customer delivery information, and update fulfilment progress.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
          <Link href="/admin/orders" className="btn-secondary w-full md:w-auto">Back to orders</Link>
          <Link href={`/order-success/${order.orderNumber}`} className="btn-primary w-full md:w-auto">Customer view</Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Order total</p>
          <p className="mt-2 text-2xl font-black text-primary-darker">{formatPrice(order.total, CURRENCY)}</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Items</p>
          <p className="mt-2 text-2xl font-black text-dark">{order.items.length}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{unitCount} total units</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Payment</p>
          <div className="mt-2"><PaymentStatusBadge status={order.paymentStatus} /></div>
          <p className="mt-2 text-xs font-semibold text-slate-500">Cash on Delivery</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Created</p>
          <p className="mt-2 text-base font-black text-dark">{formatDate(order.createdAt)}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Updated {formatDate(order.updatedAt)}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <div className="grid gap-6">
          <section className="card p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-dark">Order items</h2>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-700">
                {unitCount} unit{unitCount === 1 ? '' : 's'}
              </span>
            </div>

            <p className="table-scroll-note mt-5 sm:hidden">Swipe horizontally to view all order item columns.</p>
            <div className="admin-table-wrap" tabIndex={0} aria-label="Scrollable order items table">
              <table className="responsive-table min-w-[720px] w-full text-left text-sm"><caption className="sr-only-custom">Order items table</caption>
                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="rounded-l-2xl px-4 py-3">Product</th>
                    <th className="px-4 py-3">Variant</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit price</th>
                    <th className="rounded-r-2xl px-4 py-3 text-right">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={`${item.slug}-${item.size}-${item.color}`}>
                      <td className="px-4 py-4">
                        <p className="font-black text-dark">{item.name}</p>
                        <Link href={`/shop/${item.slug}`} className="mt-1 inline-flex text-xs font-black text-primary-darker hover:underline">
                          /{item.slug}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {item.size ? `Size ${item.size}` : 'One size'} · {item.color ?? 'Standard'}
                      </td>
                      <td className="px-4 py-4 font-black text-dark">{item.quantity}</td>
                      <td className="px-4 py-4 font-semibold text-slate-600">{formatPrice(item.price, CURRENCY)}</td>
                      <td className="px-4 py-4 text-right font-black text-primary-darker">{formatPrice(item.lineTotal, CURRENCY)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Status history</p>
            <h2 className="mt-2 text-2xl font-black text-dark">Fulfilment timeline</h2>
            <div className="mt-5 grid gap-3">
              {statusHistory.slice().reverse().map((entry, index) => (
                <div key={`${entry.status}-${entry.changedAt.toString()}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <OrderStatusBadge status={entry.status} />
                    <p className="text-xs font-bold text-slate-500">{formatDate(entry.changedAt)}</p>
                  </div>
                  {entry.note ? <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{entry.note}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid gap-6">
          <section className="card p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Update status</p>
            <h2 className="mt-2 text-xl font-black text-dark">Current: {orderStatusLabel(order.orderStatus)}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Update the operational order state as the store prepares, ships, delivers, or cancels a Cash on Delivery order.
            </p>
            <div className="mt-5">
              <OrderStatusUpdateForm orderId={orderId} orderNumber={order.orderNumber} currentStatus={order.orderStatus} />
            </div>
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
              Cancelling an order does not automatically restore stock in this minimal RAD version. Stock adjustments can be handled manually in product management.
            </p>
          </section>

          <section className="card p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Customer</p>
            <h2 className="mt-2 text-xl font-black text-dark">Delivery details</h2>
            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              <p><span className="font-black text-dark">Name:</span> {order.customerInfo.name}</p>
              <p><span className="font-black text-dark">Email:</span> {order.customerInfo.email}</p>
              <p><span className="font-black text-dark">Phone:</span> {order.customerInfo.phone}</p>
              <p><span className="font-black text-dark">Address:</span> {order.customerInfo.address}</p>
              <p><span className="font-black text-dark">City:</span> {order.customerInfo.city}</p>
              <p><span className="font-black text-dark">District:</span> {order.customerInfo.district}</p>
              {order.customerInfo.note ? <p><span className="font-black text-dark">Customer note:</span> {order.customerInfo.note}</p> : null}
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
                <p>Payment method: Cash on Delivery</p>
                <p className="mt-1">Payment status: {paymentStatusLabel(order.paymentStatus)}</p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
