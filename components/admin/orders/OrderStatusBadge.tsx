import type { OrderStatus } from '@/types/database';
import { orderStatusBadgeClass, orderStatusLabel } from '@/lib/order-status';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${orderStatusBadgeClass(status)}`}>
      {orderStatusLabel(status)}
    </span>
  );
}
