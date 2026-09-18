import type { PaymentStatus } from "@/lib/domain";

const statusLabels: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  confirmed: "Payment confirmed",
  rejected: "Payment cancelled",
  insufficient_balance: "More test tokens needed",
};

export function StatusPill({ status }: { status: PaymentStatus }) {
  return <span className={`status-pill status-pill-${status}`}>{statusLabels[status]}</span>;
}
