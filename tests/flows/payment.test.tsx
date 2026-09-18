import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MessageComposer } from "@/features/profiles/message-composer";
import type { Profile } from "@/lib/domain";

const mocks = vi.hoisted(() => ({
  payForMessage: vi.fn(),
}));

vi.mock("@/lib/mock-store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/mock-store")>();

  return {
    ...actual,
    useMockStore: () => ({
      state: { currentUser: { id: "user-alex" } },
      payForMessage: mocks.payForMessage,
    }),
  };
});

const profile: Profile = {
  id: "profile-idris",
  userId: "user-idris",
  slug: "idris",
  bio: "Designer and creator helping ambitious teams ship better work.",
  dmPrice: 2,
  currency: "USDC",
  active: true,
};

function renderComposer() {
  return render(<MessageComposer profile={profile} />);
}

describe("MessageComposer", () => {
  it("shows an inline error for a whitespace-only message", async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.type(screen.getByLabelText("Private message"), "   ");
    await user.click(screen.getByRole("button", { name: "Pay & Send" }));

    expect(await screen.findByText("Write a message before continuing.")).toHaveAttribute(
      "role",
      "alert",
    );
  });

  it("opens a payment review with the creator price", async () => {
    const user = userEvent.setup();
    renderComposer();

    await user.type(screen.getByLabelText("Private message"), "Could you review my portfolio?");
    await user.click(screen.getByRole("button", { name: "Pay & Send" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("$2.00 USDC");
  });

  it("announces pending payment and only submits once when confirmation is clicked twice", async () => {
    const user = userEvent.setup();
    let resolvePayment: ((value: { paymentStatus: "confirmed" }) => void) | undefined;
    mocks.payForMessage.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePayment = resolve;
        }),
    );
    renderComposer();

    await user.type(screen.getByLabelText("Private message"), "Could you review my portfolio?");
    await user.click(screen.getByRole("button", { name: "Pay & Send" }));
    const confirm = screen.getByRole("button", { name: "Confirm simulated payment" });
    await user.dblClick(confirm);

    expect(screen.getByText("Processing your simulated payment.").closest("[aria-live='polite']")).toBeTruthy();
    expect(mocks.payForMessage).toHaveBeenCalledTimes(1);
    expect(mocks.payForMessage).toHaveBeenCalledWith(
      expect.objectContaining({ clientRequestId: "request-profile-idris-1" }),
      "confirmed",
    );

    resolvePayment?.({ paymentStatus: "confirmed" });
    expect(await screen.findByText("Message delivered")).toBeInTheDocument();
  });

  it.each([
    ["confirmed", "Message delivered"],
    ["rejected", "Payment was cancelled"],
    ["insufficient_balance", "You need more test tokens"],
  ] as const)("presents the %s payment outcome", async (outcome, expectedMessage) => {
    const user = userEvent.setup();
    mocks.payForMessage.mockResolvedValueOnce({ paymentStatus: outcome });
    renderComposer();

    await user.type(screen.getByLabelText("Private message"), "Could you review my portfolio?");
    await user.click(screen.getByRole("button", { name: "Pay & Send" }));
    await user.selectOptions(screen.getByLabelText("Simulated outcome"), outcome);
    await user.click(screen.getByRole("button", { name: "Confirm simulated payment" }));

    expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
  });
});
