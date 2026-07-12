'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus } from '@/types/database';
import { ORDER_STATUSES, orderStatusDescription } from '@/lib/order-status';

interface OrderStatusUpdateFormProps {
  orderId: string;
  orderNumber: string;
  currentStatus: OrderStatus;
}

interface StatusUpdateResponse {
  ok: boolean;
  message?: string;
  orderStatus?: OrderStatus;
}

export function OrderStatusUpdateForm({ orderId, orderNumber, currentStatus }: OrderStatusUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === currentStatus && !note.trim()) {
      setError('Select a different status or add a note before updating.');
      setMessage('');
      return;
    }

    if (status === 'cancelled') {
      const confirmed = window.confirm(`Cancel order ${orderNumber}? This will mark the order as cancelled but will not automatically restore stock.`);

      if (!confirmed) {
        return;
      }
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: status, note: note.trim() }),
    });

    const data = await response.json() as StatusUpdateResponse;

    if (!response.ok || !data.ok) {
      setError(data.message ?? 'Order status could not be updated.');
      setSubmitting(false);
      return;
    }

    setMessage('Order status updated successfully.');
    setNote('');
    router.refresh();
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-black text-dark">Order status</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
        >
          {ORDER_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <span className="text-xs font-semibold leading-5 text-slate-500">{orderStatusDescription(status)}</span>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-black text-dark">Admin note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={220}
          placeholder="Optional note for internal status history"
          className="resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-sky-100"
        />
      </label>

      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
      {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}

      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
        {submitting ? 'Updating status...' : 'Update order status'}
      </button>
    </form>
  );
}
