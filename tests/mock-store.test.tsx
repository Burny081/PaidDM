import { act, cleanup, render } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MockStoreProvider,
  type MockStoreApi,
  type PayForMessageInput,
  useMockStore,
} from "@/lib/mock-store";

let store: MockStoreApi | undefined;

function StoreProbe() {
  const api = useMockStore();

  useEffect(() => {
    store = api;
  }, [api]);

  return null;
}

function currentStore() {
  if (!store) {
    throw new Error("Mock store is unavailable");
  }

  return store;
}

const confirmedInput: PayForMessageInput = {
  clientRequestId: "request-confirmed-1",
  senderId: "user-alex",
  creatorId: "user-idris",
  profileId: "profile-idris",
  content: "Could you review my portfolio?",
  amount: 2,
};

describe("MockStoreProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    render(
      <MockStoreProvider>
        <StoreProbe />
      </MockStoreProvider>,
    );
  });

  afterEach(() => {
    cleanup();
    store = undefined;
    vi.useRealTimers();
  });

  it("delivers a confirmed request once and derives earnings and unread totals", async () => {
    const initialMessageCount = currentStore().state.messages.length;
    const initialEarned = currentStore().totalEarned;
    const initialUnread = currentStore().unreadCount;

    let request: Promise<Awaited<ReturnType<MockStoreApi["payForMessage"]>>>;
    let duplicateRequest: Promise<Awaited<ReturnType<MockStoreApi["payForMessage"]>>>;
    act(() => {
      request = currentStore().payForMessage(confirmedInput, "confirmed");
      duplicateRequest = currentStore().payForMessage(confirmedInput, "confirmed");
    });

    expect(duplicateRequest!).toBe(request!);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    const message = await request!;
    expect(currentStore().state.messages).toHaveLength(initialMessageCount + 1);

    expect(message.paymentStatus).toBe("confirmed");
    expect(currentStore().totalEarned).toBe(initialEarned + confirmedInput.amount);
    expect(currentStore().unreadCount).toBe(initialUnread + 1);

    act(() => currentStore().markRead(message.id));
    expect(currentStore().unreadCount).toBe(initialUnread);

    act(() => currentStore().replyToMessage(message.id, "I will take a look."));
    expect(
      currentStore().state.messages.find((entry) => entry.id === message.id)?.repliedAt,
    ).toBeDefined();
    expect(currentStore().state.replies).toHaveLength(1);
  });

  it.each([
    ["rejected", "request-rejected-1"],
    ["insufficient_balance", "request-insufficient-1"],
  ] as const)("does not add a %s payment to the creator inbox", async (outcome, clientRequestId) => {
    let request: Promise<Awaited<ReturnType<MockStoreApi["payForMessage"]>>>;
    act(() => {
      request = currentStore().payForMessage(
        { ...confirmedInput, clientRequestId },
        outcome,
      );
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    const message = await request!;
    expect(message.paymentStatus).toBe(outcome);
    expect(currentStore().state.messages).not.toContainEqual(
      expect.objectContaining({ id: message.id }),
    );
  });
});
