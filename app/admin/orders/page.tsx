import Link from 'next/link';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/orders';
import { CURRENCY } from '@/lib/constants';
import { countOrders, listOrders, objectIdToString } from '@/lib/db';
import { isOrderStatus, ORDER_STATUSES, orderStatusLabel } from '@/lib/order-status';
import { formatDate, formatPrice } from '@/utils';
import type { OrderStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Orders',
  description: 'Protected Attyre order management area for Cash on Delivery order processing.',
};

interface AdminOrdersPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

function parseStatus(status: string | undefined): OrderStatus | undefined {
  return isOrderStatus(status) ? status : undefined;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? '';
  const selectedStatus = parseStatus(params.status);

  const [orders, totalCount, pendingCount, processingCount, shippedCount, deliveredCount, cancelledCount] = await Promise.all([
    listOrders({ search: search || undefined, status: selectedStatus }),
    countOrders(),
    countOrders('pending'),
    countOrders('processing'),
    countOrders('shipped'),
    countOrders('delivered'),
    countOrders('cancelled'),
  ]);

  const visibleTotal = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="grid gap-6">
      <section className="card p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Order management</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">Orders</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Process Cash on Delivery orders, inspect customer delivery details, filter orders by progress, and update fulfilment status from this protected admin page.
            </p>
          </div>
          <Link href="/admin" className="btn-secondary w-full md:w-auto">Back to dashboard</Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-black text-dark">{totalCount}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Pending</p>
            <p className="mt-1 text-2xl font-black text-dark">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">Processing</p>
            <p className="mt-1 text-2xl font-black text-dark">{processingCount}</p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">Shipped</p>
            <p className="mt-1 text-2xl font-black text-dark">{shippedCount}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Delivered</p>
            <p className="mt-1 text-2xl font-black text-dark">{deliveredCount}</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Cancelled</p>
            <p className="mt-1 text-2xl font-black text-dark">{cancelledCount}</p>
          </div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-black text-dark">Search orders</span>
            <input
              name="q"
              defaultValue={search}
              placeholder="Order number, customer, email, phone, city"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-dark">Order status</span>
            <select
              name="status"
              defaultValue={selectedStatus ?? ''}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <button type="submit" className="btn-primary w-full">Apply</button>
            <Link href="/admin/orders" className="btn-secondary w-full">Reset</Link>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:flex md:items-center md:justify-between md:gap-4 md:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">COD order table</p>
            <h2 className="mt-2 text-2xl font-black text-dark">{orders.length} order{orders.length === 1 ? '' : 's'} found</h2>
          </div>
          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-black text-primary-darker md:mt-0">
            Visible total: {formatPrice(visibleTotal, CURRENCY)}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-5 md:p-6">
            <EmptyState
              title="No orders found"
              description="Try clearing filters or place a customer order through the checkout flow. New Cash on Delivery orders appear here."
              actionLabel="Clear filters"
              actionHref="/admin/orders"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Items</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const orderId = objectIdToString(order._id);

                  return (
                    <tr key={orderId} className="align-top transition hover:bg-sky-50/40">
                      <td className="px-5 py-4">
                        <p className="font-black text-dark">{order.orderNumber}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Created {formatDate(order.createdAt)}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Updated {formatDate(order.updatedAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-black text-dark">{order.customerInfo.name}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{order.customerInfo.email}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{order.customerInfo.phone}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{order.customerInfo.city}, {order.customerInfo.district}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-black text-dark">{order.items.length} item{order.items.length === 1 ? '' : 's'}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} total unit{order.items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? '' : 's'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-black text-primary-darker">{formatPrice(order.total, CURRENCY)}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Cash on Delivery</p>
                        <div className="mt-2"><PaymentStatusBadge status={order.paymentStatus} /></div>
                      </td>
                      <td className="px-5 py-4">
                        <OrderStatusBadge status={order.orderStatus} />
                        <p className="mt-2 text-xs font-semibold text-slate-500">{orderStatusLabel(order.orderStatus)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/admin/orders/${orderId}`} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-primary-darker transition hover:bg-sky-100">
                            View / update
                          </Link>
                          <Link href={`/order-success/${order.orderNumber}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary-darker">
                            Customer view
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
