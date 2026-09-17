# PaidDM Milestone 1 Design

**Date:** 2026-09-17
**Status:** Approved in conversation

## Purpose

Build a polished, runnable frontend foundation for PaidDM using mock data. The milestone demonstrates the complete product experience without connecting X OAuth, Supabase, an embedded-wallet provider, or Robinhood Chain. Its structure must allow those live services to replace mocks in later milestones without rewriting the pages.

## Scope

Milestone 1 includes:

- A marketing landing page and Continue with X entry point.
- A simulated authenticated session.
- Profile onboarding with a public handle, biography, and one DM price.
- A public creator profile with a private-message composer.
- A simulated Pay & Send flow with pending, confirmed, rejected, and insufficient-balance outcomes.
- A creator dashboard with balance, earnings, received-message, and unread-message summaries.
- An inbox and message-detail experience with read state, transaction details, and replies.
- Settings with mock profile and wallet information.
- Responsive, accessible layouts and realistic loading, empty, success, and failure states.
- Automated tests for primary domain rules and user flows.
- Documentation that clearly labels simulated behavior and describes later integrations.

Milestone 1 excludes live authentication, database access, wallet creation, blockchain calls, smart contracts, deployment, and real funds.

## Architecture

Use a single Next.js application with the App Router, React, TypeScript, and Tailwind CSS. UI components consume typed application services and repository interfaces. An in-memory mock implementation supplies session, profile, wallet, message, payment, and transaction data.

The application is divided into four boundaries:

1. **Routes and page composition** render the product screens.
2. **Feature components** implement focused interactions such as onboarding, composing a message, payment progress, inbox reading, and replying.
3. **Domain models and services** define data shapes, validation, state transitions, and use-case contracts without depending on React.
4. **Mock repositories** implement those contracts and maintain session-local state.

Later milestones replace repository implementations with Supabase, X OAuth, an embedded-wallet provider, and verified blockchain services. Page and component contracts remain stable.

## Routes

- `/` — landing page.
- `/login` — Continue with X presentation and simulated sign-in.
- `/onboarding` — profile and DM-price setup.
- `/@idris` — representative public creator profile.
- `/dashboard` — creator overview and recent paid messages.
- `/dashboard/messages` — complete inbox with unread and paid states.
- `/dashboard/messages/[id]` — message detail, payment evidence, and reply composer.
- `/settings` — public profile, configured price, wallet address, and balance.

Route data may use deterministic seeded mock records so tests and screenshots are repeatable.

## Visual System

The interface uses modern minimalism rather than a conventional crypto-dashboard aesthetic:

- White and soft-neutral surfaces with charcoal text.
- One restrained green accent for primary actions and confirmed states.
- Strong, clean typography with generous whitespace.
- Subtle borders, minimal shadows, and limited decorative gradients.
- Familiar product language such as “Pay $2” rather than protocol terminology.
- Blockchain details are available in secondary disclosures and transaction links, not emphasized in the primary flow.

Layouts are mobile-first. Interactive targets are at least 44 by 44 pixels, focus states remain visible, form controls have persistent labels, status changes are announced accessibly, and color is never the only indicator of state.

## Data Model

The mock domain mirrors the future production entities without pretending that persistence already exists:

- `User`: stable application ID, X identity display fields, and wallet summary.
- `Profile`: owner, slug, biography, DM price, currency, and active state.
- `Message`: sender, creator, local mock content, amount, payment state, read state, and timestamps.
- `Payment`: transaction hash, chain label, token symbol, amount, and verification state.
- `Reply`: message relationship, author, content, and timestamp.
- `Transaction`: direction, amount, status, address summary, and timestamp.

Mock message content stays local to the application process. No content, identifiers, secrets, or keys are sent to an external service.

## Main User Flows

### New creator

The user selects Continue with X, enters a simulated signed-in state, completes profile setup, chooses a DM price, and sees the new public profile.

### Sender

The sender opens `/@idris`, writes a message, reviews the price, and starts Pay & Send. The mock payment service moves through pending and confirmed states. Only after confirmation does the message become paid and deliverable.

The demonstration also exposes controlled rejected-payment and insufficient-balance paths. These paths do not create a paid message.

### Creator

The creator opens the dashboard, sees summary metrics and a new-message indicator, reads the full paid message, views mock transaction evidence, and sends a reply. The session-local store updates read and replied states immediately.

## State and Data Flow

1. A mock session service identifies the current user.
2. Typed repositories return profiles, messages, payments, balances, and transactions.
3. Feature services validate commands and apply domain transitions.
4. Pay & Send first creates a pending record.
5. The payment simulator returns a deterministic pending, confirmed, rejected, or insufficient-balance result.
6. Only a confirmed result marks the message paid and adds it to the creator inbox.
7. Reading and replying update the mock store and refresh derived dashboard counts.

Frontend components never assign a paid state directly. They request a transition through the payment service, preserving the boundary needed for later server-side verification.

## Validation and Error Handling

- Profile slugs use a constrained, normalized format and cannot be blank.
- DM price must be positive and use at most the supported currency precision.
- Messages must contain non-whitespace content and respect a documented maximum length.
- Replies follow the same content rules.
- Buttons show progress and prevent duplicate submission while work is pending.
- Payment errors use plain language and provide a safe retry path.
- Missing records render a useful not-found state.
- Unexpected mock failures render a recoverable error state rather than exposing implementation details.

## Security Boundaries

- No private keys, seed phrases, wallet-signing secrets, API credentials, or real OAuth tokens exist in this milestone.
- No real blockchain network or unverified chain configuration is used.
- Private-message text is never represented as on-chain data.
- Mock paid status can only be changed through the application payment-service contract.
- Rendered user content is treated as text; no raw HTML injection is allowed.
- Milestone 1 uses no environment variables, so it does not require an `.env` file.

These boundaries shape the frontend but do not imply that the mock application is production-secure or audited.

## Testing and Completion Criteria

Domain tests cover:

- Profile and price validation.
- Message and reply validation.
- Allowed payment-state transitions.
- Duplicate-submission prevention.
- Inbox-derived unread and earnings totals.

Component and flow tests cover:

- Simulated sign-in and onboarding.
- Public-profile message composition.
- Pending and successful payment presentation.
- Rejected and insufficient-balance errors.
- Creator reading a message and sending a reply.
- Empty and not-found states.

Milestone 1 is complete when:

- All listed routes are implemented and responsive.
- The primary sender and creator journeys work with deterministic mock data.
- Accessibility checks are satisfied for labels, focus, keyboard use, status feedback, and contrast.
- Unit/component tests, linting, type checking, and the production build pass.
- The README distinguishes every mock capability from future live integrations.

## Future Milestones

1. Verify current official Robinhood Chain, X OAuth, and embedded-wallet documentation.
2. Add real X OAuth and secure session handling.
3. Add the Supabase schema, access policies, and persistent repositories.
4. Integrate a verified compatible embedded-wallet provider.
5. Configure verified Robinhood Chain testnet values and faucet assets.
6. Implement and test the minimal payment contract.
7. Add server-side payment verification and the real paid-message flow.
8. Complete two-account end-to-end testing and free-tier deployment.

Each live-integration milestone requires current official configuration research before implementation. No address, chain identifier, RPC endpoint, token, provider capability, or pricing assumption may be invented.
