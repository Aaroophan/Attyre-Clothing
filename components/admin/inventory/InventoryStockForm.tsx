'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface InventoryStockFormProps {
  productId: string;
  productName: string;
  currentStock: number;
}

interface InventoryMutationResponse {
  ok: boolean;
  message?: string;
  stock?: number;
}

export function InventoryStockForm({ productId, productName, currentStock }: InventoryStockFormProps) {
  const router = useRouter();
  const [stock, setStock] = useState(currentStock.toString());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    const response = await fetch(`/api/admin/inventory/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', stock }),
    });

    const data = await response.json() as InventoryMutationResponse;

    if (!response.ok || !data.ok) {
      setError(data.message ?? 'Stock could not be updated.');
      setSubmitting(false);
      return;
    }

    const nextStock = typeof data.stock === 'number' ? data.stock : Number(stock);
    setStock(nextStock.toString());
    setMessage(data.message ?? `${productName} stock updated.`);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[7rem_auto] sm:items-start">
      <label className="grid gap-1">
        <span className="sr-only">Stock for {productName}</span>
        <input
          type="number"
          min={0}
          step={1}
          value={stock}
          onChange={(event) => {
            setStock(event.target.value);
            setMessage('');
            setError('');
          }}
          className="h-10 rounded-2xl border border-slate-200 px-3 text-sm font-black text-dark outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
          aria-label={`Stock value for ${productName}`}
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-10 items-center justify-center rounded-full bg-primary-darker px-4 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Saving' : 'Update'}
      </button>
      {message ? <p className="text-xs font-bold text-emerald-700 sm:col-span-2">{message}</p> : null}
      {error ? <p className="text-xs font-bold text-red-700 sm:col-span-2">{error}</p> : null}
    </form>
  );
}
