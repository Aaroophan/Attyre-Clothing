import Link from 'next/link';
import type { Metadata } from 'next';
import { CategoryStatusButton } from '@/components/admin/categories';
import { EmptyState } from '@/components/ui';
import { getCategoryUsageMap, listCategories, objectIdToString } from '@/lib/db';
import { formatDate } from '@/utils';
import type { CategoryDocument } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Categories',
  description: 'Protected Attyre category management area.',
};

interface AdminCategoriesPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    created?: string;
    updated?: string;
  }>;
}

function statusBadgeClass(active: boolean): string {
  return active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600';
}

function matchesSearch(category: CategoryDocument, search: string): boolean {
  if (!search) {
    return true;
  }

  const haystack = `${category.name} ${category.slug} ${category.description ?? ''}`.toLowerCase();
  return haystack.includes(search.toLowerCase());
}

function matchesStatus(category: CategoryDocument, status: string): boolean {
  if (status === 'active') {
    return category.active;
  }

  if (status === 'inactive') {
    return !category.active;
  }

  return true;
}

function successMessage(created?: string, updated?: string): string {
  if (created) {
    return 'Category created successfully.';
  }

  if (updated) {
    return 'Category updated successfully.';
  }

  return '';
}

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? '';
  const status = params.status === 'inactive' || params.status === 'active' ? params.status : 'all';
  const message = successMessage(params.created, params.updated);

  const [allCategories, usageMap] = await Promise.all([
    listCategories(),
    getCategoryUsageMap(),
  ]);

  const categories = allCategories.filter((category) => matchesSearch(category, search) && matchesStatus(category, status));
  const activeCount = allCategories.filter((category) => category.active).length;
  const inactiveCount = allCategories.length - activeCount;
  const usedCount = allCategories.filter((category) => (usageMap.get(objectIdToString(category._id)) ?? 0) > 0).length;

  return (
    <div className="grid gap-6">
      <section className="card p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Category management</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">Categories</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Create, edit, activate, and deactivate storefront categories. Active categories are used in product forms and customer filters, while inactive categories are kept for product and order history safety.
            </p>
          </div>
          <Link href="/admin/categories/new" className="btn-primary w-full md:w-auto">Create category</Link>
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
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-darker">Used by products</p>
            <p className="mt-1 text-2xl font-black text-dark">{usedCount}</p>
          </div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-black text-dark">Search categories</span>
            <input
              name="q"
              defaultValue={search}
              placeholder="Search by name, slug, or description"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-dark">Status</span>
            <select
              name="status"
              defaultValue={status}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">All categories</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <button type="submit" className="btn-primary w-full">Apply</button>
            <Link href="/admin/categories" className="btn-secondary w-full">Reset</Link>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:flex md:items-center md:justify-between md:gap-4 md:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Category table</p>
            <h2 className="mt-2 text-2xl font-black text-dark">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'} found</h2>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="p-5 md:p-6">
            <EmptyState
              title="No categories found"
              description="Try clearing filters or create a new category for the storefront."
              actionLabel="Create category"
              actionHref="/admin/categories/new"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[840px] w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Products</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => {
                  const categoryId = objectIdToString(category._id);
                  const productCount = usageMap.get(categoryId) ?? 0;

                  return (
                    <tr key={categoryId} className="align-top transition hover:bg-sky-50/40">
                      <td className="px-5 py-4">
                        <p className="font-black text-dark">{category.name}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">/{category.slug}</p>
                        <p className="mt-2 max-w-md text-xs font-semibold leading-5 text-slate-500">
                          {category.description || 'No description provided.'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-slate-700">
                          {productCount} product{productCount === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusBadgeClass(category.active)}`}>
                          {category.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                        {formatDate(category.updatedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/shop?category=${category.slug}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary-darker">
                            View
                          </Link>
                          <Link href={`/admin/categories/${categoryId}/edit`} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-black text-primary-darker transition hover:bg-sky-100">
                            Edit
                          </Link>
                          <CategoryStatusButton categoryId={categoryId} active={category.active} productCount={productCount} />
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
