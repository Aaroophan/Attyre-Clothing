import Link from 'next/link';
import type { Metadata } from 'next';
import { DashboardCard } from '@/components/admin';
import { EmptyState } from '@/components/ui';
import { CURRENCY } from '@/lib/constants';
import {
  calculateSalesTotal,
  countActiveProducts,
  countOrders,
  listLowStockProducts,
  listOrders,
  objectIdToString,
} from '@/lib/db';
import { formatDate, formatPrice } from '@/utils';
import type { OrderStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Attyre protected admin dashboard with store metrics and recent order overview.',
};

function labelStatus(status: OrderStatus): string {
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

function BoxIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 0 1 2-2Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.3 2.8 16a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 3 3 5-6" />
      <path d="M19 7h-5" />
      <path d="M19 7v5" />
    </svg>
  );
}

export default async function AdminDashboardPage() {
  const [
    productCount,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    lowStockProducts,
    totalSales,
    recentOrders,
  ] = await Promise.all([
    countActiveProducts(),
    countOrders(),
    countOrders('pending'),
    countOrders('delivered'),
    listLowStockProducts(5),
    calculateSalesTotal(),
    listOrders({ limit: 5 }),
  ]);

  const lowStockCount = lowStockProducts.length;
  const activeOrders = totalOrders - (await countOrders('cancelled'));
  const averageOrderValue = activeOrders > 0 ? totalSales / activeOrders : 0;

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Business overview</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-5xl">Admin dashboard</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Monitor the Attyre catalog, Cash on Delivery orders, low-stock products, and estimated sales performance
              from one protected admin overview.
            </p>
          </div>
          <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5 text-center md:min-w-56">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-darker">Sales total</p>
            <p className="mt-2 text-2xl font-black text-dark">{formatPrice(totalSales, CURRENCY)}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Excludes cancelled orders</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store metrics">
        <DashboardCard
          title="Active products"
          value={productCount.toString()}
          description="Products currently visible to customers in the storefront catalog."
          href="/admin/products"
          tone="sky"
          icon={<BoxIcon />}
        />
        <DashboardCard
          title="Total orders"
          value={totalOrders.toString()}
          description={`${pendingOrders} pending and ${deliveredOrders} delivered Cash on Delivery orders.`}
          href="/admin/orders"
          tone="default"
          icon={<OrderIcon />}
        />
        <DashboardCard
          title="Low stock"
          value={lowStockCount.toString()}
          description="Active products with stock at or below 5 units and needing attention."
          href="/admin/inventory?stock=low"
          tone={lowStockCount > 0 ? 'amber' : 'emerald'}
          icon={<StockIcon />}
        />
        <DashboardCard
          title="Average order"
          value={formatPrice(averageOrderValue, CURRENCY)}
          description="Estimated average value across non-cancelled orders."
          href="/admin/orders"
          tone="emerald"
          icon={<SalesIcon />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 p-5 md:flex md:items-center md:justify-between md:gap-4 md:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Recent orders</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-dark">Latest customer activity</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                The five newest orders placed through the Cash on Delivery checkout flow.
              </p>
            </div>
            <Link href="/admin/orders" className="btn-secondary mt-4 w-full md:mt-0 md:w-auto">
              View all
            </Link>
          </div>

          <div className="p-4 md:p-6">
            {recentOrders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="Orders will appear here after customers complete the Cash on Delivery checkout."
                actionLabel="Open storefront"
                actionHref="/shop"
              />
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-100">
                <div className="hidden bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500 md:grid md:grid-cols-[1.1fr_1fr_0.9fr_0.8fr] md:gap-4">
                  <span>Order</span>
                  <span>Customer</span>
                  <span>Status</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <Link
                      key={objectIdToString(order._id)}
                      href={`/admin/orders/${objectIdToString(order._id)}`}
                      className="grid gap-3 p-4 transition hover:bg-sky-50/60 md:grid-cols-[1.1fr_1fr_0.9fr_0.8fr] md:items-center md:gap-4 md:px-5"
                    >
                      <div>
                        <p className="font-black text-dark">{order.orderNumber}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{order.customerInfo.name}</p>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-500">{order.customerInfo.email}</p>
                      </div>
                      <div>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusBadgeClass(order.orderStatus)}`}>
                          {labelStatus(order.orderStatus)}
                        </span>
                      </div>
                      <div className="font-black text-primary-darker md:text-right">
                        {formatPrice(order.total, CURRENCY)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="grid gap-6">
          <section className="card p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Order status</p>
            <h2 className="mt-2 text-2xl font-black text-dark">Fulfilment snapshot</h2>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-700">
              <div className="flex justify-between gap-4 rounded-2xl bg-amber-50 px-4 py-3 text-amber-800">
                <span>Pending</span>
                <span className="font-black">{pendingOrders}</span>
              </div>
              <div className="flex justify-between gap-4 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800">
                <span>Delivered</span>
                <span className="font-black">{deliveredOrders}</span>
              </div>
              <div className="flex justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
                <span>Non-cancelled sales base</span>
                <span className="font-black">{activeOrders}</span>
              </div>
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Inventory alerts</p>
                <h2 className="mt-2 text-2xl font-black text-dark">Low-stock products</h2>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                ≤ 5 units
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
                No active products are currently below the low-stock threshold.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <Link
                    key={objectIdToString(product._id)}
                    href={`/shop/${product.slug}`}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-amber-200 hover:bg-amber-50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-dark">{product.name}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{product.categoryName}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-amber-700">
                        {product.stock} left
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}
