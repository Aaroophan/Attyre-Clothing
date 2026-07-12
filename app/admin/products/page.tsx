import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Products',
  description: 'Protected Attyre product management area.',
};

export default function AdminProductsPage() {
  return (
    <div className="card p-6 md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Admin section</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">Products</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
        This protected product management route is ready for Issue 13. Only admin users can reach this page.
        Product listing, create, edit, stock update, and deactivate features will be implemented in the product CRUD issue.
      </p>
      <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold leading-6 text-slate-600">
        Protected placeholder: product table and product form will be added here.
      </div>
    </div>
  );
}
