import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Sort } from 'mongodb';
import { ProductStatusButton } from '@/components/admin/products';
import { EmptyState } from '@/components/ui';
import { CURRENCY } from '@/lib/constants';
import { listCategories, listProducts, objectIdToString } from '@/lib/db';
import { formatDate, formatPrice } from '@/utils';
import type { ProductDocument } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Products',
  description: 'Protected Attyre product management area for product CRUD and inventory updates.',
};

interface AdminProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    created?: string;
    updated?: string;
  }>;
}

function stockBadgeClass(stock: number): string {
  if (stock <= 0) {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (stock <= 5) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function statusBadgeClass(active: boolean): string {
  return active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600';
}

function buildSort(): Sort {
  return { updatedAt: -1, createdAt: -1 };
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

function successMessage(created?: string, updated?: string): string {
  if (created) {
    return 'Product created successfully.';
  }

  if (updated) {
    return 'Product updated successfully.';
  }

  return '';
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? '';
  const categorySlug = params.category?.trim() ?? '';
  const status = params.status === 'inactive' || params.status === 'active' ? params.status : 'all';
  const message = successMessage(params.created, params.updated);

  const [categories, allProducts] = await Promise.all([
    listCategories({ activeOnly: true }),
    listProducts({
      includeInactive: true,
      activeOnly: false,
      search: search || undefined,
      categorySlug: categorySlug || undefined,
      sort: buildSort(),
    }),
  ]);

  const products = allProducts.filter((product) => matchesStatus(product, status));
  const activeCount = allProducts.filter((product) => product.active).length;
  const inactiveCount = allProducts.length - activeCount;
  const lowStockCount = allProducts.filter((product) => product.active && product.stock <= 5).length;

  return (
    <div className="grid gap-6">
      <section className="card p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Product management</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">Products</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Create, edit, restock, feature, and deactivate Attyre catalog products from this protected admin page.
              Deactivated products are hidden from the customer shop but kept for existing order history.
            </p>
          </div>
          <Link href="/admin/products/new" className="btn-primary w-full md:w-auto">Create product</Link>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {message}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Active</p>
            <p className="mt-1 text-2xl font-black text-dark">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Inactive</p>
            <p className="mt-1 text-2xl font-black text-dark">{inactiveCount}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Low stock</p>
            <p className="mt-1 text-2xl font-black text-dark">{lowStockCount}</p>
          </div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem_12rem_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-black text-dark">Search products</span>
            <input
              name="q"
              defaultValue={search}
              placeholder="Search by name or description"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-dark">Category</span>
            <select
              name="category"
              defaultValue={categorySlug}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={objectIdToString(category._id)} value={category.slug}>{category.name}</option>
              ))}
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
            <Link href="/admin/products" className="btn-secondary w-full">Reset</Link>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:flex md:items-center md:justify-between md:gap-4 md:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Catalog table</p>
            <h2 className="mt-2 text-2xl font-black text-dark">{products.length} product{products.length === 1 ? '' : 's'} found</h2>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="p-5 md:p-6">
            <EmptyState
              title="No products found"
              description="Try clearing filters or create a new product for the catalog."
              actionLabel="Create product"
              actionHref="/admin/products/new"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const productId = objectIdToString(product._id);
                  const image = product.images[0] ?? '/images/products/classic-white-shirt.svg';

                  return (
                    <tr key={productId} className="align-top transition hover:bg-sky-50/40">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 gap-4">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                            <Image src={image} alt={product.name} fill sizes="64px" className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-black text-dark">{product.name}</p>
                            <p className="mt-1 truncate text-xs font-semibold text-slate-500">/{product.slug}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">SKU: {product.sku ?? 'Not set'}</p>
                            {product.featured ? (
                              <span className="mt-2 inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-primary-darker">
                                Featured
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">{product.categoryName}</td>
                      <td className="px-5 py-4">
                        {product.salePrice ? (
                          <div>
                            <p className="font-black text-primary-darker">{formatPrice(product.salePrice, CURRENCY)}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-400 line-through">{formatPrice(product.price, CURRENCY)}</p>
                          </div>
                        ) : (
                          <p className="font-black text-dark">{formatPrice(product.price, CURRENCY)}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${stockBadgeClass(product.stock)}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusBadgeClass(product.active)}`}>
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                        <p className="mt-2 text-xs font-semibold text-slate-500">Updated {formatDate(product.updatedAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/shop/${product.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary-darker">
                            View
                          </Link>
                          <Link href={`/admin/products/${productId}/edit`} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-primary-darker transition hover:bg-sky-100">
                            Edit
                          </Link>
                          <ProductStatusButton productId={productId} active={product.active} />
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
