'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductStatusButtonProps {
  productId: string;
  active: boolean;
}

interface StatusResponse {
  ok: boolean;
  message?: string;
}

export function ProductStatusButton({ productId, active }: ProductStatusButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleStatusChange() {
    const confirmed = window.confirm(
      active
        ? 'Deactivate this product? It will be hidden from the customer shop but kept for existing orders.'
        : 'Reactivate this product and show it in the customer shop?',
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setMessage('');

    const response = await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: active ? 'deactivate' : 'reactivate' }),
    });

    const data = await response.json() as StatusResponse;

    if (!response.ok || !data.ok) {
      setMessage(data.message ?? 'Product status could not be changed.');
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
