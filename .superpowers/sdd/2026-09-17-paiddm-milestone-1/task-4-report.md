# Task 4 Report — Public Profile and Simulated Payment

## Implementation

- Added the Next.js 16 dynamic public profile route at `/@idris`. It resolves the handle from the asynchronous route params and renders Idris’s code-native initials avatar fallback, biography, handle, `$2 USDC` message price, and wallet-free simulated-payment copy.
- Added `MessageComposer`, which keeps the private-message label visible, reports the remaining character count, validates with `messageSchema`, and opens payment review only for valid content.
- Added the simulated payment dialog state machine: `editing`, `reviewing`, `pending`, `confirmed`, `rejected`, and `insufficient_balance`.
- Payment submission uses `useMockStore().payForMessage` exclusively. It creates deterministic client request IDs (`request-profile-idris-1`), avoids duplicate submission while pending, and never mutates paid/delivered state in the UI.
- Added clear pending, delivered, cancelled, and insufficient-token presentation with polite live announcements. A rejected payment returns to review only after the user selects “Review payment.”
- Added text-labelled payment status pills and a secondary disclosure for simulated transaction details and deterministic outcome selection. No wallet, chain, payment, or environment integration was added.

## TDD evidence

1. RED: created `tests/flows/payment.test.tsx` first and ran `npm test -- tests/flows/payment.test.tsx`. It failed because `@/features/profiles/message-composer` did not exist.
2. GREEN: added the profile composer, payment dialog, status pill, and dynamic profile route. The focused flow suite passed.
3. RED: added the deterministic client-request-ID assertion. It failed because the initial implementation used a timestamp-based ID.
4. GREEN: changed the ID generator to a component-local deterministic sequence; the focused flow suite passed again.

## Verification

- `npm test -- tests/flows/payment.test.tsx` — passed: 1 file, 6 tests.
- `npm run lint` — passed with no lint findings.
- `npm run typecheck` — passed (`tsc --noEmit`).
- `npm test` — passed: 5 files, 15 tests.
- `npm run build` — passed; Next.js reports `/[handle]` as an on-demand dynamic route.
- `git diff --check` — passed with no whitespace errors.

Vitest continues to emit the existing non-failing Vite warning about `__dirname` in `vitest.config.ts`; this task does not change that configuration.

## Self-review

- The dialog has `role="dialog"`, `aria-modal`, a labelled title, focusable controls, and a 44px close target. While pending, its close control is disabled and the confirm action is absent.
- The textarea has a visible persistent label, semantic error association, an accessible character-count description, and a visible keyboard focus indicator supplied by existing shared styles.
- Payment state comes from the store result; only `payForMessage` creates the payment and message records.
- The public route has no asset dependency for the avatar fallback, no secrets, no network calls, and no non-deterministic payment outcomes or request IDs.

## Files changed

- `app/[handle]/page.tsx`
- `app/globals.css`
- `components/status-pill.tsx`
- `features/profiles/message-composer.tsx`
- `features/payments/payment-dialog.tsx`
- `tests/flows/payment.test.tsx`
