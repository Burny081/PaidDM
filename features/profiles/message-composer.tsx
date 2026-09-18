"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentDialog, type PaymentDialogState } from "@/features/payments/payment-dialog";
import type { PaymentOutcome, Profile } from "@/lib/domain";
import { useMockStore } from "@/lib/mock-store";
import { messageSchema } from "@/lib/validation";

type ComposerState = "editing" | PaymentDialogState;

export function MessageComposer({ profile }: { profile: Profile }) {
  const { state: storeState, payForMessage } = useMockStore();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ComposerState>("editing");
  const [outcome, setOutcome] = useState<PaymentOutcome>("confirmed");
  const requestId = useRef<string | null>(null);
  const requestSequence = useRef(0);
  const submissionStarted = useRef(false);

  const remainingCharacters = 1000 - content.length;

  function beginReview() {
    const result = messageSchema.safeParse({ content });

    if (!result.success) {
      setError("Write a message before continuing.");
      return;
    }

    setError(null);
    requestSequence.current += 1;
    requestId.current = `request-${profile.id}-${requestSequence.current}`;
    setState("reviewing");
  }

  async function confirmPayment() {
    if (state !== "reviewing" || submissionStarted.current || !requestId.current) {
      return;
    }

    const result = messageSchema.safeParse({ content });
    if (!result.success) {
      setError("Write a message before continuing.");
      setState("editing");
      return;
    }

    submissionStarted.current = true;
    setState("pending");

    try {
      const message = await payForMessage(
        {
          clientRequestId: requestId.current,
          senderId: storeState.currentUser.id,
          creatorId: profile.userId,
          profileId: profile.id,
          content: result.data.content,
          amount: profile.dmPrice,
        },
        outcome,
      );
      setState(message.paymentStatus);
    } catch {
      setState("rejected");
    } finally {
      submissionStarted.current = false;
    }
  }

  function closeDialog() {
    if (state === "pending") return;
    setState("editing");
  }

  function acknowledgePayment() {
    if (state === "rejected") {
      setState("reviewing");
      return;
    }

    setContent("");
    requestId.current = null;
    setState("editing");
  }

  return (
    <section aria-labelledby="message-composer-title" className="message-composer">
      <div>
        <p className="eyebrow">Private message</p>
        <h2 id="message-composer-title">Send a thoughtful note.</h2>
      </div>
      <label className="composer-label" htmlFor="private-message">Private message</label>
      <textarea
        aria-describedby="message-character-count message-payment-note"
        aria-invalid={error ? true : undefined}
        className="input textarea"
        id="private-message"
        maxLength={1000}
        onChange={(event) => {
          setContent(event.target.value);
          if (error) setError(null);
        }}
        placeholder="Write your message..."
        value={content}
      />
      <div className="composer-meta">
        <p id="message-character-count" aria-live="polite">{remainingCharacters} characters remaining</p>
        <p id="message-payment-note">Your message is delivered after payment is confirmed.</p>
      </div>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <Button className="button-wide" onClick={beginReview}>Pay &amp; Send</Button>

      {state !== "editing" ? (
        <PaymentDialog
          amount={profile.dmPrice}
          onAcknowledge={acknowledgePayment}
          onClose={closeDialog}
          onConfirm={confirmPayment}
          onOutcomeChange={setOutcome}
          outcome={outcome}
          state={state}
        />
      ) : null}
    </section>
  );
}
