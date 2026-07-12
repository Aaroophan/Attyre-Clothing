'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryStatusButtonProps {
  categoryId: string;
  active: boolean;
  productCount: number;
}

interface StatusResponse {
  ok: boolean;
  message?: string;
}

export function CategoryStatusButton({ categoryId, active, productCount }: CategoryStatusButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleStatusChange() {
    const confirmMessage = active
      ? productCount > 0
        ? `Deactivate this category? It will be hidden from category filters, but ${productCount} product${productCount === 1 ? '' : 's'} will be kept for order history and catalog safety.`
        : 'Deactivate this unused category? It will be hidden from category filters.'
      : 'Reactivate this category and make it available in filters and product forms?';

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setMessage('');

    const response = await fetch(`/api/admin/categories/${categoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: active ? 'deactivate' : 'reactivate' }),
    });

    const data = await response.json() as StatusResponse;

    if (!response.ok || !data.ok) {
      setMessage(data.message ?? 'Category status could not be changed.');
      setSubmitting(false);
      return;
    }

    router.refresh();
    setSubmitting(false);
  }

  return (
    <div className="grid gap-1">
      <button
        type="button"
        onClick={handleStatusChange}
        disabled={submitting}
        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary-darker disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Updating...' : active ? 'Deactivate' : 'Reactivate'}
      </button>
      {message ? <p className="text-xs font-bold text-red-600">{message}</p> : null}
    </div>
  );
}
