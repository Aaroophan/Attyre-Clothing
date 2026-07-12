import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { InventoryStockForm } from '@/components/admin/inventory';
import { EmptyState } from '@/components/ui';
import { CURRENCY } from '@/lib/constants';
import { listProducts, objectIdToString } from '@/lib/db';
import { getInventoryStatus, getInventoryStatusLabel, LOW_STOCK_THRESHOLD, type InventoryStatus } from '@/lib/inventory';
import { formatDate, formatPrice } from '@/utils';
import type { ProductDocument } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Inventory',
  description: 'Protected Attyre inventory and stock control area.',
};

interface AdminInventoryPageProps {
  searchParams: Promise<{
    q?: string;
    stock?: string;
    status?: string;
  }>;
}

function matchesStatus(product: ProductDocument, status: string): boolean {
  if (status === 'active') {
    return product.active;
  }

  if (status === 'inactive') {
    return !product.active;
  }

  return true;
}

function matchesStockStatus(product: ProductDocument, stockStatus: string): boolean {
  if (stockStatus === 'low') {
    return getInventoryStatus(product.stock) === 'low-stock';
  }

  if (stockStatus === 'out') {
    return getInventoryStatus(product.stock) === 'out-of-stock';
  }

  if (stockStatus === 'in') {
    return getInventoryStatus(product.stock) === 'in-stock';
  }

  return true;
}

function statusBadgeClass(active: boolean): string {
  return active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600';
}

function stockToneClass(status: InventoryStatus): string {
  if (status === 'out-of-stock') {
    return 'border-red-100 bg-red-50 text-red-700';
  }

  if (status === 'low-stock') {
    return 'border-amber-100 bg-amber-50 text-amber-700';
  }

  return 'border-emerald-100 bg-emerald-50 text-emerald-700';
}

export default async function AdminInventoryPage({ searchParams }: AdminInventoryPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? '';
  const status = params.status === 'active' || params.status === 'inactive' ? params.status : 'all';
  const stockStatus = params.stock === 'low' || params.stock === 'out' || params.stock === 'in' ? params.stock : 'all';

  const allProducts = await listProducts({
    includeInactive: true,
    activeOnly: false,
    search: search || undefined,
    sort: { stock: 1, name: 1 },
  });

  const products = allProducts
    .filter((product) => matchesStatus(product, status))
    .filter((product) => matchesStockStatus(product, stockStatus));

  const activeProducts = allProducts.filter((product) => product.active);
  const totalUnits = activeProducts.reduce((sum, product) => sum + product.stock, 0);
  const lowStockCount = activeProducts.filter((product) => getInventoryStatus(product.stock) === 'low-stock').length;
  const outOfStockCount = activeProducts.filter((product) => getInventoryStatus(product.stock) === 'out-of-stock').length;
  const inStockCount = activeProducts.filter((product) => getInventoryStatus(product.stock) === 'in-stock').length;

  return (
    <div className="grid gap-6">
      <section className="card p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Inventory control</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">Stock management</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Monitor stock levels, identify low-stock and out-of-stock products, and update product stock without opening the full product editor.
              Checkout still revalidates stock from MongoDB before every Cash on Delivery order.
            </p>
          </div>
          <Link href="/admin/products/new" className="btn-primary w-full md:w-auto">Create product</Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Active units</p>
            <p className="mt-1 text-2xl font-black text-dark">{totalUnits}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Total sellable units</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">In stock</p>
            <p className="mt-1 text-2xl font-black text-dark">{inStockCount}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">Above {LOW_STOCK_THRESHOLD} units</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Low stock</p>
            <p className="mt-1 text-2xl font-black text-dark">{lowStockCount}</p>
            <p className="mt-1 text-xs font-semibold text-amber-700">1-{LOW_STOCK_THRESHOLD} units</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Out of stock</p>
            <p className="mt-1 text-2xl font-black text-dark">{outOfStockCount}</p>
            <p className="mt-1 text-xs font-semibold text-red-700">Cannot be ordered</p>
          </div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-black text-dark">Search inventory</span>
            <input
              name="q"
              defaultValue={search}
              placeholder="Search by product name or description"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-dark">Stock</span>
            <select
              name="stock"
              defaultValue={stockStatus}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-dark">Status</span>
            <select
              name="status"
              defaultValue={status}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">All products</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <button type="submit" className="btn-primary w-full">Apply</button>
            <Link href="/admin/inventory" className="btn-secondary w-full">Reset</Link>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:flex md:items-center md:justify-between md:gap-4 md:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Inventory table</p>
            <h2 className="mt-2 text-2xl font-black text-dark">{products.length} product{products.length === 1 ? '' : 's'} found</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Low stock is treated as {LOW_STOCK_THRESHOLD} units or fewer. Zero stock products remain visible in admin but cannot be ordered by customers.
            </p>
          </div>
          <Link href="/admin/products" className="btn-secondary mt-4 w-full md:mt-0 md:w-auto">Open product CRUD</Link>
        </div>

        {products.length === 0 ? (
          <div className="p-5 md:p-6">
            <EmptyState
              title="No inventory records found"
              description="Try clearing filters or create a product before managing inventory."
              actionLabel="Create product"
              actionHref="/admin/products/new"
            />
          </div>
        ) : (
          <>
            <p className="table-scroll-note sm:hidden">Swipe horizontally to view all table columns.</p>
          <div className="admin-table-wrap" tabIndex={0} aria-label="Scrollable admin table">
            <table className="responsive-table min-w-[980px] w-full text-left text-sm"><caption className="sr-only-custom">Admin inventory table</caption>
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock status</th>
                  <th className="px-5 py-4">Quick update</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const productId = objectIdToString(product._id);
                  const image = product.images[0] ?? '/images/products/classic-white-shirt.svg';
                  const inventoryStatus = getInventoryStatus(product.stock);

                  return (
                    <tr key={productId} className="align-top transition hover:bg-sky-50/40">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 gap-4">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                            <Image src={image} alt={product.name} fill sizes="64px" className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-black text-dark">{product.name}</p>
                            <p className="mt-1 truncate text-xs font-semibold text-slate-500">SKU: {product.sku ?? 'Not set'}</p>
                            <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] ${statusBadgeClass(product.active)}`}>
                              {product.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">{product.categoryName}</td>
                      <td className="px-5 py-4 font-black text-primary-darker">{formatPrice(product.salePrice ?? product.price, CURRENCY)}</td>
                      <td className="px-5 py-4">
                        <div className={`rounded-2xl border p-3 ${stockToneClass(inventoryStatus)}`}>
                          <p className="text-xs font-black uppercase tracking-[0.14em]">{getInventoryStatusLabel(product.stock)}</p>
                          <p className="mt-1 text-xl font-black text-dark">{product.stock} unit{product.stock === 1 ? '' : 's'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <InventoryStockForm productId={productId} productName={product.name} currentStock={product.stock} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/shop/${product.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary-darker">
                            View
                          </Link>
                          <Link href={`/admin/products/${productId}/edit`} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-primary-darker transition hover:bg-sky-100">
                            Edit full product
                          </Link>
                        </div>
                        <p className="mt-3 text-xs font-semibold text-slate-500">Updated {formatDate(product.updatedAt)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>
    </div>
  );
}
