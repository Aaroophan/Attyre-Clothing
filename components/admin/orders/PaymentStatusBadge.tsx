import type { PaymentStatus } from '@/types/database';
import { paymentStatusBadgeClass, paymentStatusLabel } from '@/lib/order-status';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${paymentStatusBadgeClass(status)}`}>
      {paymentStatusLabel(status)}
    </span>
  );
}
