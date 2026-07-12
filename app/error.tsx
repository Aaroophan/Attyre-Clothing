'use client';

import Link from 'next/link';

export default function GlobalErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-soft px-4 py-16 text-dark md:py-24">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-sm md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Attyre could not load this view.</h1>
        <p className="mt-4 text-sm font-semibold leading-6 text-slate-600 md:text-base">
          Please try again. The application has shown a safe error screen instead of exposing internal details.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-secondary">Go home</Link>
        </div>
      </div>
    </main>
  );
}
