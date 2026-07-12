'use client';

import { useState } from 'react';

export function AdminLogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await globalThis.fetch('/api/auth/logout', { method: 'POST' });
      globalThis.location.href = '/login?next=/admin';
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
    >
      {isLoggingOut ? 'Signing out...' : 'Admin logout'}
    </button>
  );
}
