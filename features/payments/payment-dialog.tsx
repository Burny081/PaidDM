"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import type { PaymentOutcome } from "@/lib/domain";
import { formatUsdc } from "@/lib/format";

export type PaymentDialogState =
  | "reviewing"
  | "pending"
  | "confirmed"
  | "rejected"
  | "insufficient_balance";

type PaymentDialogProps = {
  amount: number;
  state: PaymentDialogState;
  outcome: PaymentOutcome;
  onOutcomeChange(outcome: PaymentOutcome): void;
  onConfirm(): void;
  onClose(): void;
  onAcknowledge(): void;
};

const outcomeOptions: Array<{ value: PaymentOutcome; label: string }> = [
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Cancelled" },
  { value: "insufficient_balance", label: "Insufficient test tokens" },
];

export function PaymentDialog({
  amount,
  state,
  outcome,
  onOutcomeChange,
  onConfirm,
  onClose,
  onAcknowledge,
}: PaymentDialogProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isPending = state === "pending";

  useEffect(() => {
    titleRef.current?.focus();
  }, [state]);

  return (
    <div className="dialog-backdrop">
      <section
        aria-labelledby="payment-dialog-title"
        aria-modal="true"
        className="payment-dialog"
        role="dialog"
      >
        <div className="dialog-heading">
          <h2 id="payment-dialog-title" ref={titleRef} tabIndex={-1}>
            {state === "reviewing" ? "Review your message" : "Simulated payment"}
          </h2>
          <button
            aria-label="Close payment dialog"
            className="dialog-close"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {state === "reviewing" ? (
          <>
            <p className="dialog-copy">Your message will be delivered after payment is confirmed.</p>
            <p className="payment-amount">{formatUsdc(amount)}</p>
            <details className="simulation-details">
              <summary>Simulated transaction details</summary>
              <p>This is a local test payment. No wallet connection is needed.</p>
              <label>
                Simulated outcome
                <select
                  value={outcome}
                  onChange={(event) => onOutcomeChange(event.target.value as PaymentOutcome)}
                >
                  {outcomeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </details>
            <div className="dialog-actions">
              <Button className="button-secondary" onClick={onClose}>Keep editing</Button>
              <Button onClick={onConfirm}>Confirm simulated payment</Button>
            </div>
          </>
        ) : null}

        {state === "pending" ? (
          <div aria-live="polite" className="payment-feedback">
            <StatusPill status="pending" />
            <p>Processing your simulated payment.</p>
          </div>
        ) : null}

        {state === "confirmed" ? (
          <div aria-live="polite" className="payment-feedback">
            <StatusPill status="confirmed" />
            <h3>Message delivered</h3>
            <p>Your message is on its way to this creator.</p>
            <Button onClick={onAcknowledge}>Close</Button>
          </div>
        ) : null}

        {state === "rejected" ? (
          <div aria-live="polite" className="payment-feedback">
            <StatusPill status="rejected" />
            <h3>Payment was cancelled</h3>
            <p>Your message was not delivered. You can review the payment again.</p>
            <Button onClick={onAcknowledge}>Review payment</Button>
          </div>
        ) : null}

        {state === "insufficient_balance" ? (
          <div aria-live="polite" className="payment-feedback">
            <StatusPill status="insufficient_balance" />
            <h3>You need more test tokens</h3>
            <p>Your message was not delivered.</p>
            <Button onClick={onAcknowledge}>Back to message</Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
