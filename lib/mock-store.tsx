"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { z } from "zod";
import type {
  Message,
  Payment,
  PaymentOutcome,
  Profile,
  Reply,
  Transaction,
  User,
} from "@/lib/domain";
import {
  FIXED_TIMESTAMPS,
  mockBalance,
  mockCurrentUser,
  mockProfiles,
} from "@/lib/mock-data";
import { messageSchema, profileSchema, replySchema } from "@/lib/validation";

export type PayForMessageInput = {
  clientRequestId: string;
  senderId: string;
  creatorId: string;
  profileId: string;
  content: string;
  amount: number;
};

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
  totalEarned: number;
  unreadCount: number;
  signIn(): void;
  saveProfile(input: { slug: string; bio: string; dmPrice: number }): void;
  payForMessage(input: PayForMessageInput, outcome: PaymentOutcome): Promise<Message>;
  markRead(messageId: string): void;
  replyToMessage(messageId: string, content: string): void;
};

const paymentOutcomeSchema = z.enum([
  "confirmed",
  "rejected",
  "insufficient_balance",
]);

const messageIdSchema = z.string().trim().min(1);

const payForMessageSchema = z.object({
  clientRequestId: z.string().trim().min(1),
  senderId: z.string().trim().min(1),
  creatorId: z.string().trim().min(1),
  profileId: z.string().trim().min(1),
  content: messageSchema.shape.content,
  amount: z.coerce.number().positive().multipleOf(0.01),
});

type StoreAction =
  | { type: "signed-in" }
  | { type: "profile-saved"; profile: Profile }
  | { type: "payment-completed"; message: Message; payment: Payment; transaction: Transaction }
  | { type: "message-read"; messageId: string }
  | { type: "reply-sent"; messageId: string; reply: Reply };

function createInitialState(): MockState {
  return {
    signedIn: false,
    currentUser: mockCurrentUser,
    profiles: mockProfiles.map((profile) => ({ ...profile })),
    messages: [],
    payments: [],
    replies: [],
    transactions: [],
    balance: mockBalance,
  };
}

function mockStoreReducer(state: MockState, action: StoreAction): MockState {
  switch (action.type) {
    case "signed-in":
      return { ...state, signedIn: true };
    case "profile-saved":
      return {
        ...state,
        profiles: state.profiles.map((profile) =>
          profile.userId === state.currentUser.id ? action.profile : profile,
        ),
      };
    case "payment-completed": {
      const confirmed = action.message.paymentStatus === "confirmed";

      return {
        ...state,
        messages: confirmed ? [...state.messages, action.message] : state.messages,
        payments: [...state.payments, action.payment],
        transactions: [...state.transactions, action.transaction],
        balance: confirmed ? state.balance + action.message.amount : state.balance,
      };
    }
    case "message-read":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.messageId && !message.readAt
            ? { ...message, readAt: FIXED_TIMESTAMPS.paymentConfirmed }
            : message,
        ),
      };
    case "reply-sent":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.messageId
            ? { ...message, repliedAt: action.reply.createdAt }
            : message,
        ),
        replies: [...state.replies, action.reply],
      };
  }
}

function getMessageId(clientRequestId: string): string {
  return `message-${clientRequestId}`;
}

function createPaymentResult(
  input: z.output<typeof payForMessageSchema>,
  outcome: PaymentOutcome,
): { message: Message; payment: Payment; transaction: Transaction } {
  const messageId = getMessageId(input.clientRequestId);
  const confirmed = outcome === "confirmed";
  const message: Message = {
    id: messageId,
    senderId: input.senderId,
    creatorId: input.creatorId,
    profileId: input.profileId,
    content: input.content,
    amount: input.amount,
    paymentStatus: outcome,
    createdAt: FIXED_TIMESTAMPS.paymentCreated,
    ...(confirmed ? { paidAt: FIXED_TIMESTAMPS.paymentConfirmed } : {}),
  };
  const payment: Payment = {
    id: `payment-${input.clientRequestId}`,
    messageId,
    ...(confirmed ? { txHash: `0xsimulated${input.clientRequestId}` } : {}),
    chainLabel: "Robinhood Chain Testnet (simulated)",
    tokenSymbol: "USDC",
    amount: input.amount,
    status: outcome,
    ...(confirmed ? { confirmedAt: FIXED_TIMESTAMPS.paymentConfirmed } : {}),
  };
  const transaction: Transaction = {
    id: `transaction-${input.clientRequestId}`,
    direction: confirmed ? "in" : "out",
    amount: input.amount,
    status: outcome,
    address: input.senderId,
    createdAt: FIXED_TIMESTAMPS.paymentConfirmed,
  };

  return { message, payment, transaction };
}

const MockStoreContext = createContext<MockStoreApi | null>(null);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mockStoreReducer, undefined, createInitialState);
  const paymentRequests = useRef(new Map<string, Promise<Message>>());

  const signIn = useCallback(() => {
    dispatch({ type: "signed-in" });
  }, []);

  const saveProfile = useCallback(
    (input: { slug: string; bio: string; dmPrice: number }) => {
      const parsed = profileSchema.parse(input);
      const currentProfile = state.profiles.find(
        (profile) => profile.userId === state.currentUser.id,
      );

      if (!currentProfile) {
        throw new Error("Current user profile is unavailable");
      }

      dispatch({
        type: "profile-saved",
        profile: { ...currentProfile, ...parsed },
      });
    },
    [state.currentUser.id, state.profiles],
  );

  const payForMessage = useCallback(
    (input: PayForMessageInput, outcome: PaymentOutcome): Promise<Message> => {
      const parsedInput = payForMessageSchema.parse(input);
      const parsedOutcome = paymentOutcomeSchema.parse(outcome);
      const existingRequest = paymentRequests.current.get(parsedInput.clientRequestId);

      if (existingRequest) {
        return existingRequest;
      }

      const request = new Promise<Message>((resolve) => {
        window.setTimeout(() => {
          const result = createPaymentResult(parsedInput, parsedOutcome);
          dispatch({ type: "payment-completed", ...result });
          resolve(result.message);
        }, 600);
      });

      paymentRequests.current.set(parsedInput.clientRequestId, request);
      return request;
    },
    [],
  );

  const markRead = useCallback((messageId: string) => {
    dispatch({ type: "message-read", messageId: messageIdSchema.parse(messageId) });
  }, []);

  const replyToMessage = useCallback((messageId: string, content: string) => {
    const parsedMessageId = messageIdSchema.parse(messageId);
    const parsedReply = replySchema.parse({ content });
    const reply: Reply = {
      id: `reply-${parsedMessageId}`,
      messageId: parsedMessageId,
      creatorId: state.currentUser.id,
      content: parsedReply.content,
      createdAt: FIXED_TIMESTAMPS.replyCreated,
    };

    if (state.messages.some((message) => message.id === parsedMessageId)) {
      dispatch({ type: "reply-sent", messageId: parsedMessageId, reply });
    }
  }, [state.currentUser.id, state.messages]);

  const totalEarned = useMemo(
    () =>
      state.messages
        .filter((message) => message.paymentStatus === "confirmed")
        .reduce((total, message) => total + message.amount, 0),
    [state.messages],
  );
  const unreadCount = useMemo(
    () =>
      state.messages.filter(
        (message) => message.paymentStatus === "confirmed" && !message.readAt,
      ).length,
    [state.messages],
  );
  const value = useMemo<MockStoreApi>(
    () => ({
      state,
      totalEarned,
      unreadCount,
      signIn,
      saveProfile,
      payForMessage,
      markRead,
      replyToMessage,
    }),
    [
      markRead,
      payForMessage,
      replyToMessage,
      saveProfile,
      signIn,
      state,
      totalEarned,
      unreadCount,
    ],
  );

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore(): MockStoreApi {
  const store = useContext(MockStoreContext);

  if (!store) {
    throw new Error("useMockStore must be used within MockStoreProvider");
  }

  return store;
}
