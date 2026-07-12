import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Attyre protected admin dashboard.',
};

const adminCards = [
  {
    title: 'Product management',
    description: 'Create, edit, deactivate, and maintain clothing products and stock details.',
    href: '/admin/products',
    eyebrow: 'Catalog',
  },
  {
    title: 'Category management',
    description: 'Organize products into customer-facing clothing categories and sale sections.',
    href: '/admin/categories',
    eyebrow: 'Structure',
  },
  {
    title: 'Order management',
    description: 'Review Cash on Delivery orders and prepare them for processing and fulfilment.',
    href: '/admin/orders',
    eyebrow: 'Operations',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6">
      <section className="card overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Business control panel</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-dark md:text-5xl">Admin dashboard</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              This protected area is reserved for the Attyre store administrator. It provides the secured layout
              and navigation foundation for product, category, and order management workflows.
            </p>
          </div>
          <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5 text-center md:min-w-52">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-darker">Payment mode</p>
            <p className="mt-2 text-2xl font-black text-dark">COD</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Cash on Delivery only</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {adminCards.map((card) => (
          <Link key={card.href} href={card.href} className="card group p-5 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-darker">{card.eyebrow}</p>
            <h2 className="mt-3 text-xl font-black text-dark group-hover:text-primary-darker">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
            <span className="mt-5 inline-flex text-sm font-black text-primary-darker">Open section →</span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 md:p-6">
          <h2 className="text-lg font-black text-dark">Current Issue 11 scope</h2>
          <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-slate-600">
            <li>• Admin-only route protection is active for every page under <span className="font-black text-dark">/admin</span>.</li>
            <li>• Customer accounts are blocked from admin pages.</li>
            <li>• Admin navigation and layout are ready for later management features.</li>
          </ul>
        </div>

        <div className="card p-5 md:p-6">
          <h2 className="text-lg font-black text-dark">Next implementation areas</h2>
          <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-slate-600">
            <li>• Issue 12 will add real dashboard metrics.</li>
            <li>• Issue 13 will add product CRUD.</li>
            <li>• Issues 14 and 15 will add category and order administration.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
