import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Categories',
  description: 'Protected Attyre category management area.',
};

export default function AdminCategoriesPage() {
  return (
    <div className="card p-6 md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Admin section</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-4xl">Categories</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
        This protected category management route is ready for Issue 14. Only admin users can reach this page.
        Category listing, create, edit, and safe delete/deactivate behavior will be implemented in the category management issue.
      </p>
      <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold leading-6 text-slate-600">
        Protected placeholder: category table and category form will be added here.
      </div>
    </div>
  );
}
