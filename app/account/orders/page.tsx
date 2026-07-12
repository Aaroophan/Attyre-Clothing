import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/session';
import { listCustomerOrders } from '@/lib/db/orders';
import { objectIdToString } from '@/lib/db/object-id';
import { CURRENCY } from '@/lib/constants';
import { PageContainer, EmptyState } from '@/components/ui';
import { formatDate, formatPrice } from '@/utils';
import type { OrderStatus, PaymentStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'View your Attyre customer order history.',
};

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

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/account/orders');
  }

  const orders = await listCustomerOrders(objectIdToString(user._id));

  return (
    <PageContainer className="section-space">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Customer account</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-5xl">My orders</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Track Cash on Delivery orders placed while logged in as {user.name}.
          </p>
        </div>
        <Link href="/shop" className="btn-secondary w-full md:w-auto">Continue shopping</Link>
      </div>

      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState
            title="No account orders yet"
            description="Orders placed while logged in will appear here. Guest orders are still shown through the order confirmation page."
            actionLabel="Start shopping"
            actionHref="/shop"
          />
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => (
              <article key={objectIdToString(order._id)} className="card overflow-hidden">
                <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-black text-dark">{order.orderNumber}</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusBadgeClass(order.orderStatus)}`}>
                        {labelStatus(order.orderStatus)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Placed on {formatDate(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? '' : 's'} · Cash on Delivery
                    </p>
                    <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      {order.items.map((item) => (
                        <div key={`${item.slug}-${item.size}-${item.color}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                          <p className="font-black text-dark">{item.name}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {item.size ? `Size ${item.size}` : 'One size'} · {item.color ?? 'Standard'} · Qty {item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-sky-50 p-4 md:min-w-56">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-darker">Order total</p>
                    <p className="mt-2 text-2xl font-black text-primary-darker">{formatPrice(order.total, CURRENCY)}</p>
                    <div className="mt-3 space-y-1 text-sm font-semibold text-slate-600">
                      <p>Payment: {labelStatus(order.paymentStatus)}</p>
                      <p>Delivery: {order.customerInfo.city}, {order.customerInfo.district}</p>
                    </div>
                    <Link href={`/order-success/${order.orderNumber}`} className="btn-primary mt-4 w-full text-xs">
                      View confirmation
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
