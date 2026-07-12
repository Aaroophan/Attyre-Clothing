import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin';
import { isAdminUser } from '@/lib/auth/admin';
import { getCurrentUser, toPublicUser } from '@/lib/auth/session';
import { PageContainer } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Protected Attyre administration area.',
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/admin');
  }

  if (!isAdminUser(user)) {
    return (
      <PageContainer className="section-space">
        <div className="card mx-auto max-w-3xl p-6 text-center md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">Access denied</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-dark md:text-5xl">Admin access required</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            You are signed in, but this account does not have permission to open the Attyre admin area.
            Customer accounts can browse products, place Cash on Delivery orders, and view their own order history only.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/account/orders" className="btn-secondary">Go to my orders</a>
            <a href="/" className="btn-primary">Return to storefront</a>
          </div>
        </div>
      </PageContainer>
    );
  }

  return <AdminShell user={toPublicUser(user)}>{children}</AdminShell>;
}
