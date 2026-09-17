# PaidDM Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive PaidDM frontend that demonstrates the complete creator and sender experience using deterministic session-local mock data.

**Architecture:** A Next.js App Router application composes small feature components over framework-independent domain types, validation functions, and a client-side mock store. Pages never mutate paid state directly; they call typed store actions that simulate the future server and blockchain boundaries.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Lucide React, Zod, Vitest, Testing Library, and Playwright.

**Spec:** `docs/superpowers/specs/2026-09-17-paiddm-milestone-1-design.md`

## Global Constraints

- This milestone contains no live X OAuth, Supabase, embedded-wallet, blockchain, smart-contract, or real-funds integration.
- Use no environment variables and create no `.env` file.
- Never include private keys, seed phrases, signing secrets, API credentials, or real OAuth tokens.
- Never represent private-message content as on-chain data.
- Use modern minimalism: white and soft-neutral surfaces, charcoal text, one restrained green accent, strong typography, generous whitespace, subtle borders, and minimal shadows.
- Use plain-language payment copy; keep blockchain details secondary.
- Build mobile-first layouts with 44-by-44-pixel minimum targets, visible focus states, persistent labels, accessible status announcements, and non-color state indicators.
- Treat all rendered user content as text; do not use raw HTML injection.
- Keep every mock result deterministic so tests and screenshots are repeatable.

---

## File Structure

```text
app/
  [handle]/page.tsx               Public creator profile at /@idris
  dashboard/page.tsx              Creator overview
  dashboard/messages/page.tsx     Inbox
  dashboard/messages/[id]/page.tsx Message detail
  login/page.tsx                  Simulated X entry
  onboarding/page.tsx             Profile setup
  settings/page.tsx               Profile and wallet settings
  globals.css                     Design tokens and global utilities
  layout.tsx                      Fonts, metadata, providers, app shell
  page.tsx                        Landing page
components/
  app-header.tsx                  Shared navigation
  empty-state.tsx                 Reusable empty state
  status-pill.tsx                 Text-and-icon status indicator
  ui/                             Button, card, field, avatar primitives
features/
  auth/login-panel.tsx            Simulated sign-in action
  onboarding/profile-form.tsx     Creator setup form
  payments/payment-dialog.tsx     Payment review and progress
  profiles/message-composer.tsx   Public message form
  dashboard/summary-cards.tsx     Creator metrics
  messages/inbox-list.tsx         Message list
  messages/message-detail.tsx     Reading and reply flow
  settings/settings-panel.tsx     Profile and wallet display
lib/
  domain.ts                       Shared domain types
  validation.ts                   Zod schemas and parsing helpers
  mock-data.ts                    Seed fixtures
  mock-store.tsx                  Provider, selectors, and typed actions
  format.ts                       Money, date, and address formatting
tests/
  setup.ts                        DOM matchers and cleanup
  validation.test.ts              Domain validation tests
  mock-store.test.tsx             State transition tests
  flows/*.test.tsx                Feature flow tests
e2e/core-flows.spec.ts            Browser-level sender/creator smoke test
vitest.config.ts                  Unit/component test configuration
playwright.config.ts              Browser test configuration
README.md                         Run instructions and mock/live boundary
```

### Task 1: Scaffold the Application and Test Harness

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/home.test.tsx`
- Create: `playwright.config.ts`

**Interfaces:**
- Consumes: none.
- Produces: `npm run dev`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and the root Next.js layout.

- [ ] **Step 1: Scaffold Next.js without replacing the existing `docs` directory**

Run from a temporary sibling directory, then move only generated application files into the repository:

```powershell
npx create-next-app@latest paiddm-scaffold --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm
```

Keep the generated dependency versions and lockfile together. Do not copy the scaffold's `.git` directory or README.

- [ ] **Step 2: Add the testing and icon dependencies**

```powershell
npm install lucide-react zod
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

- [ ] **Step 3: Write the failing home-page test**

```tsx
// tests/home.test.tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

it("presents the paid-message value proposition", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { name: /messages worth opening/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /create your paiddm/i })).toHaveAttribute("href", "/login");
});
```

- [ ] **Step 4: Configure Vitest and verify the test fails**

```ts
// vitest.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: ["./tests/setup.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

```ts
// tests/setup.ts
import "@testing-library/jest-dom/vitest";
```

Run: `npm test -- tests/home.test.tsx`

Expected: FAIL because the generated home page does not contain the PaidDM heading or link.

- [ ] **Step 5: Implement the root layout, global tokens, and minimal landing page**

Define semantic CSS variables in `app/globals.css` (`--background`, `--foreground`, `--muted`, `--border`, `--accent`, `--accent-foreground`, `--danger`) and implement `app/page.tsx` with a semantic header, hero heading “Messages worth opening.”, supporting copy, and a `/login` CTA named “Create your PaidDM.”

- [ ] **Step 6: Add scripts and verify the foundation**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Run: `npm test -- tests/home.test.tsx && npm run lint && npm run typecheck && npm run build`

Expected: all commands PASS.

- [ ] **Step 7: Commit**

```powershell
git add package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs app vitest.config.ts playwright.config.ts tests/setup.ts tests/home.test.tsx
git commit -m "feat: scaffold PaidDM frontend"
```

### Task 2: Domain Types, Validation, and Mock Store

**Files:**
- Create: `lib/domain.ts`, `lib/validation.ts`, `lib/mock-data.ts`, `lib/mock-store.tsx`, `lib/format.ts`
- Create: `tests/validation.test.ts`, `tests/mock-store.test.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: the React application shell from Task 1.
- Produces: `PaymentStatus`, `User`, `Profile`, `Message`, `Payment`, `Reply`, `Transaction`; `profileSchema`, `messageSchema`, `replySchema`; `MockStoreProvider`; `useMockStore()` actions `signIn()`, `saveProfile(input)`, `payForMessage(input, outcome)`, `markRead(id)`, and `replyToMessage(id, content)`.

- [ ] **Step 1: Write failing validation tests**

```ts
// tests/validation.test.ts
import { describe, expect, it } from "vitest";
import { messageSchema, profileSchema } from "@/lib/validation";

describe("profileSchema", () => {
  it("normalizes a valid slug and accepts a two-decimal price", () => {
    expect(profileSchema.parse({ slug: " Idris ", bio: "Designer", dmPrice: "2.00" })).toMatchObject({ slug: "idris", dmPrice: 2 });
  });
  it("rejects a zero price", () => expect(() => profileSchema.parse({ slug: "idris", bio: "", dmPrice: "0" })).toThrow());
});

it("rejects a blank private message", () => {
  expect(() => messageSchema.parse({ content: "   " })).toThrow();
});
```

Run: `npm test -- tests/validation.test.ts`

Expected: FAIL because the validation module does not exist.

- [ ] **Step 2: Implement exact domain contracts and schemas**

```ts
// lib/domain.ts
export type PaymentStatus = "pending" | "confirmed" | "rejected" | "insufficient_balance";
export type User = { id: string; username: string; displayName: string; avatarUrl: string; walletAddress: string };
export type Profile = { id: string; userId: string; slug: string; bio: string; dmPrice: number; currency: "USDC"; active: boolean };
export type Message = { id: string; senderId: string; creatorId: string; profileId: string; content: string; amount: number; paymentStatus: PaymentStatus; createdAt: string; paidAt?: string; readAt?: string; repliedAt?: string };
export type Payment = { id: string; messageId: string; txHash?: string; chainLabel: "Robinhood Chain Testnet (simulated)"; tokenSymbol: "USDC"; amount: number; status: PaymentStatus; confirmedAt?: string };
export type Reply = { id: string; messageId: string; creatorId: string; content: string; createdAt: string };
export type Transaction = { id: string; direction: "in" | "out"; amount: number; status: PaymentStatus; address: string; createdAt: string };
export type PaymentOutcome = Exclude<PaymentStatus, "pending">;
```

```ts
// lib/validation.ts
import { z } from "zod";
export const profileSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,20}$/),
  bio: z.string().trim().max(160),
  dmPrice: z.coerce.number().positive().multipleOf(0.01),
});
export const messageSchema = z.object({ content: z.string().trim().min(1).max(1000) });
export const replySchema = z.object({ content: z.string().trim().min(1).max(1000) });
```

- [ ] **Step 3: Write failing store-transition tests**

Render `MockStoreProvider` with a test probe. Assert that `payForMessage(..., "confirmed")` adds one confirmed message, the same message contributes to earnings and unread totals, a repeated request with the same client request ID returns the existing message, `markRead()` reduces unread count, and `replyToMessage()` sets `repliedAt` and adds one reply. Assert rejected and insufficient-balance outcomes do not enter the creator inbox.

Run: `npm test -- tests/mock-store.test.tsx`

Expected: FAIL because `MockStoreProvider` is not implemented.

- [ ] **Step 4: Implement deterministic fixtures and reducer-backed actions**

Use fixed IDs and ISO timestamps in `lib/mock-data.ts`. In `lib/mock-store.tsx`, expose:

```ts
export type PayForMessageInput = { clientRequestId: string; senderId: string; creatorId: string; profileId: string; content: string; amount: number };
export type MockState = {
  signedIn: boolean;
  currentUser: User;
  profiles: Profile[];
  messages: Message[];
  payments: Payment[];
  replies: Reply[];
  transactions: Transaction[];
  balance: number;
};
export type MockStoreApi = {
  state: MockState;
  signIn(): void;
  saveProfile(input: { slug: string; bio: string; dmPrice: number }): void;
  payForMessage(input: PayForMessageInput, outcome: PaymentOutcome): Promise<Message>;
  markRead(messageId: string): void;
  replyToMessage(messageId: string, content: string): void;
};
```

Validate all action inputs, delay payment resolution by a fixed 600 ms, deduplicate by `clientRequestId`, and derive `totalEarned` and `unreadCount` only from confirmed messages.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/validation.test.ts tests/mock-store.test.tsx && npm run typecheck`

Expected: PASS.

```powershell
git add lib app/layout.tsx tests/validation.test.ts tests/mock-store.test.tsx
git commit -m "feat: add PaidDM mock domain store"
```

### Task 3: Shared UI, Landing, Login, and Onboarding

**Files:**
- Create: `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/field.tsx`, `components/ui/avatar.tsx`
- Create: `components/app-header.tsx`, `features/auth/login-panel.tsx`, `features/onboarding/profile-form.tsx`
- Create: `app/login/page.tsx`, `app/onboarding/page.tsx`
- Modify: `app/page.tsx`, `app/globals.css`
- Create: `tests/flows/onboarding.test.tsx`

**Interfaces:**
- Consumes: `useMockStore().signIn`, `useMockStore().saveProfile`, and validation schemas from Task 2.
- Produces: accessible shared primitives, simulated sign-in, and creator onboarding.

- [ ] **Step 1: Write the failing onboarding flow test**

Render `ProfileForm` inside `MockStoreProvider`. Submit once with price `0` and assert an inline positive-price error. Then enter slug `idris`, bio `Designer • AI • YouTube`, and price `2.00`; submit and assert `saveProfile` results in the normalized profile and calls the injected `onComplete("/dashboard")` callback.

Run: `npm test -- tests/flows/onboarding.test.tsx`

Expected: FAIL because `ProfileForm` does not exist.

- [ ] **Step 2: Implement accessible primitives and navigation**

Each primitive accepts native element props and forwards refs. Buttons use a minimum height of 44px and `focus-visible` rings. `Field` always renders a visible `<label>`, optional hint, and error with `aria-describedby`. `AppHeader` provides links to Home, Dashboard, and Settings with a compact mobile layout.

- [ ] **Step 3: Implement login and onboarding**

`LoginPanel` labels the action “Continue with X (simulated),” calls `signIn()`, then navigates to `/onboarding`. `ProfileForm` uses controlled fields, parses with `profileSchema.safeParse`, maps field errors beside their controls, disables during submission, and calls `saveProfile()` only for valid input.

- [ ] **Step 4: Refine the landing page**

Add a three-step “Set your price / Receive a message / Get paid” explanation, a representative creator card, a security note stating that message content stays off-chain, and a footer that labels the experience as a testnet MVP preview. Avoid unsupported customer counts or testimonials.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/home.test.tsx tests/flows/onboarding.test.tsx && npm run lint && npm run typecheck`

Expected: PASS.

```powershell
git add app components features/auth features/onboarding tests/flows/onboarding.test.tsx
git commit -m "feat: build landing and creator onboarding"
```

### Task 4: Public Profile and Simulated Payment

**Files:**
- Create: `app/[handle]/page.tsx`
- Create: `features/profiles/message-composer.tsx`, `features/payments/payment-dialog.tsx`, `components/status-pill.tsx`
- Create: `tests/flows/payment.test.tsx`

**Interfaces:**
- Consumes: `messageSchema`, `PayForMessageInput`, `PaymentOutcome`, and `useMockStore().payForMessage`.
- Produces: a public profile, message composition, payment review, and all four payment presentations.

- [ ] **Step 1: Write failing payment-flow tests**

Test that whitespace-only content shows an inline error; a valid message opens a review dialog showing `$2.00 USDC`; confirmation renders an `aria-live="polite"` pending message; confirmed outcome renders “Message delivered”; rejected outcome renders “Payment was cancelled”; insufficient balance renders “You need more test tokens”; and double-clicking confirm calls `payForMessage` once.

Run: `npm test -- tests/flows/payment.test.tsx`

Expected: FAIL because the public-profile features do not exist.

- [ ] **Step 2: Implement the composer and dialog state machine**

Use states `editing | reviewing | pending | confirmed | rejected | insufficient_balance`. Generate a client request ID once when review begins and reuse it for retries. While pending, disable close and confirm controls. Return rejected outcomes to the review screen only after the user acknowledges the message.

- [ ] **Step 3: Implement the public profile**

Render Idris’s avatar, handle, biography, `$2 USDC` price, wallet-free primary copy, persistent message label, remaining character count, and the note “Your message is delivered after payment is confirmed.” Put simulated transaction detail in a secondary disclosure.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- tests/flows/payment.test.tsx && npm run lint && npm run typecheck`

Expected: PASS.

```powershell
git add 'app/[handle]' features/profiles features/payments components/status-pill.tsx tests/flows/payment.test.tsx
git commit -m "feat: add simulated paid message flow"
```

### Task 5: Dashboard, Inbox, Message Detail, and Reply

**Files:**
- Create: `app/dashboard/page.tsx`, `app/dashboard/messages/page.tsx`, `app/dashboard/messages/[id]/page.tsx`
- Create: `features/dashboard/summary-cards.tsx`, `features/messages/inbox-list.tsx`, `features/messages/message-detail.tsx`
- Create: `components/empty-state.tsx`
- Create: `tests/flows/inbox.test.tsx`

**Interfaces:**
- Consumes: confirmed messages and derived metrics from `useMockStore()`, plus `markRead()` and `replyToMessage()`.
- Produces: creator overview, sortable inbox, message reading, transaction evidence, and reply behavior.

- [ ] **Step 1: Write failing inbox and reply tests**

Seed one unread confirmed message. Assert dashboard metrics show balance, total earned, received, and unread values. Open the message and assert `markRead(id)` runs once, full content and payment status appear, the mock explorer control is labelled as simulated, a blank reply is rejected, and a valid reply shows “Reply sent” and disables duplicate submission.

Run: `npm test -- tests/flows/inbox.test.tsx`

Expected: FAIL because dashboard/message features do not exist.

- [ ] **Step 2: Implement dashboard and inbox**

`SummaryCards` formats monetary values with `Intl.NumberFormat`. `InboxList` orders unread messages first and then newest first, shows sender, amount, excerpt, and text-labelled status, and renders `EmptyState` when no confirmed messages exist.

- [ ] **Step 3: Implement message detail and reply**

On mount, mark the message read. Render complete content as plain text, sender, received time, amount, confirmed status, shortened transaction hash, and a secondary simulated-explorer action. Validate replies with `replySchema`; after submission, show an accessible success announcement and the sent reply.

- [ ] **Step 4: Add a not-found state**

For an unknown message ID, render a “Message not found” heading and a `/dashboard/messages` link named “Back to inbox”; do not throw an uncaught client error.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/flows/inbox.test.tsx && npm run lint && npm run typecheck`

Expected: PASS.

```powershell
git add app/dashboard features/dashboard features/messages components/empty-state.tsx tests/flows/inbox.test.tsx
git commit -m "feat: build creator dashboard and inbox"
```

### Task 6: Settings, Wallet Summary, and Transaction History

**Files:**
- Create: `app/settings/page.tsx`, `features/settings/settings-panel.tsx`
- Create: `tests/flows/settings.test.tsx`
- Modify: `lib/mock-data.ts`, `lib/mock-store.tsx`

**Interfaces:**
- Consumes: current mock profile, wallet address, balance, and transactions from the store.
- Produces: a read-only wallet summary, profile overview, transaction history, and advanced-detail disclosure.

- [ ] **Step 1: Write the failing settings test**

Assert the panel displays `@idris`, `$2.00 USDC`, a shortened address such as `0x83…91A`, `$12.00` balance, and transaction rows with direction plus textual status. Assert the full address is hidden until the “Show wallet details” button is activated and that no seed-phrase or private-key text exists.

Run: `npm test -- tests/flows/settings.test.tsx`

Expected: FAIL because settings do not exist.

- [ ] **Step 2: Implement settings and transaction history**

Render profile and DM-price cards, a wallet card with copy-address feedback, an advanced-details disclosure, and a semantic transaction list. Label all wallet and transaction content as simulated. Use icons with `aria-hidden="true"` when adjacent text already supplies the accessible name.

- [ ] **Step 3: Verify and commit**

Run: `npm test -- tests/flows/settings.test.tsx && npm run lint && npm run typecheck`

Expected: PASS.

```powershell
git add app/settings features/settings lib/mock-data.ts lib/mock-store.tsx tests/flows/settings.test.tsx
git commit -m "feat: add mock wallet and settings"
```

### Task 7: End-to-End Flow, Accessibility Polish, and Documentation

**Files:**
- Create: `e2e/core-flows.spec.ts`, `README.md`
- Modify: any page or component with an issue found by verification

**Interfaces:**
- Consumes: the complete milestone UI from Tasks 1–6.
- Produces: browser-level coverage, verified responsive/accessibility behavior, and accurate handoff documentation.

- [ ] **Step 1: Write the browser smoke test**

```ts
// e2e/core-flows.spec.ts
import { expect, test } from "@playwright/test";

test("sender pays and creator reads and replies", async ({ page }) => {
  await page.goto("/@idris");
  await page.getByLabel("Private message").fill("Could you review my portfolio?");
  await page.getByRole("button", { name: "Pay & Send" }).click();
  await expect(page.getByRole("dialog")).toContainText("$2.00 USDC");
  await page.getByRole("button", { name: "Confirm simulated payment" }).click();
  await expect(page.getByText("Message delivered")).toBeVisible();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Messages" }).click();
  await page.getByText("Could you review my portfolio?").click();
  await page.getByLabel("Reply").fill("Absolutely — send it over.");
  await page.getByRole("button", { name: "Send reply" }).click();
  await expect(page.getByText("Reply sent")).toBeVisible();
});
```

- [ ] **Step 2: Run the smoke test and fix only observed failures**

Run: `npx playwright install chromium` then `npm run test:e2e`.

Expected: PASS at desktop and a configured 390-by-844 mobile viewport.

- [ ] **Step 3: Perform the accessibility and responsive checklist**

At widths 390, 768, and 1440 pixels, verify: no horizontal overflow; all controls are keyboard reachable; focus remains visible; dialogs trap focus and return it on close; labels remain visible; pending/success/error messages are announced; touch targets measure at least 44 by 44 pixels; status never relies on color alone; and text/background contrast meets WCAG AA.

- [ ] **Step 4: Document exact run and scope boundaries**

README sections must be: Overview, Current Mock Capabilities, Not Yet Live, Local Setup, Commands, Route Map, Architecture, Accessibility, Security Boundaries, and Next Milestones. “Not Yet Live” explicitly lists X OAuth, Supabase, embedded wallets, Robinhood Chain, contracts, payment verification, persistence, and deployment.

- [ ] **Step 5: Run the complete verification suite**

Run:

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Expected: every command exits with code 0 and no test is skipped.

- [ ] **Step 6: Commit**

```powershell
git add README.md e2e app components features lib tests playwright.config.ts
git commit -m "test: verify PaidDM milestone one"
```
