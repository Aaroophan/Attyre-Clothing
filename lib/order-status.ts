import type { OrderStatus, PaymentStatus } from '@/types/database';

export const ORDER_STATUSES: { value: OrderStatus; label: string; description: string }[] = [
  {
    value: 'pending',
    label: 'Pending',
    description: 'Order is received and waiting for admin processing.',
  },
  {
    value: 'processing',
    label: 'Processing',
    description: 'Order is being prepared by the store.',
  },
  {
    value: 'shipped',
    label: 'Shipped',
    description: 'Order has been handed over for delivery.',
  },
  {
    value: 'delivered',
    label: 'Delivered',
    description: 'Order has been delivered to the customer.',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    description: 'Order has been cancelled and should not be fulfilled.',
  },
];

export const ORDER_STATUS_VALUES = ORDER_STATUSES.map((status) => status.value);

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && ORDER_STATUS_VALUES.includes(value as OrderStatus);
}

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function orderStatusDescription(status: OrderStatus): string {
  return ORDER_STATUSES.find((item) => item.value === status)?.description ?? '';
}

export function orderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'processing':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'shipped':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
    case 'delivered':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'cancelled':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

export function paymentStatusLabel(status: PaymentStatus): string {
  return status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function paymentStatusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'failed':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'refunded':
      return 'border-slate-200 bg-slate-50 text-slate-700';
    case 'pending':
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}
