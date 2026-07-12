import Link from 'next/link';
import { PageContainer } from '@/components/ui';

export default function NotFoundPage() {
  return (
    <PageContainer className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-darker">Page not found</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-dark md:text-5xl">This page is not available.</h1>
        <p className="mt-4 text-sm font-semibold leading-6 text-slate-600 md:text-base">
          The page may have moved, the link may be incorrect, or the item may no longer be active in the Attyre store.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/shop" className="btn-primary">Back to shop</Link>
          <Link href="/" className="btn-secondary">Go home</Link>
        </div>
      </div>
    </PageContainer>
  );
}
