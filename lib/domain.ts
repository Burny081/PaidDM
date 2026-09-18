export type PaymentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "insufficient_balance";

export type User = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  walletAddress: string;
};

export type Profile = {
  id: string;
  userId: string;
  slug: string;
  bio: string;
  dmPrice: number;
  currency: "USDC";
  active: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  creatorId: string;
  profileId: string;
  content: string;
  amount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  readAt?: string;
  repliedAt?: string;
};

export type Payment = {
  id: string;
  messageId: string;
  txHash?: string;
  chainLabel: "Robinhood Chain Testnet (simulated)";
  tokenSymbol: "USDC";
  amount: number;
  status: PaymentStatus;
  confirmedAt?: string;
};

export type Reply = {
  id: string;
  messageId: string;
  creatorId: string;
  content: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  direction: "in" | "out";
  amount: number;
  status: PaymentStatus;
  address: string;
  createdAt: string;
};

export type PaymentOutcome = Exclude<PaymentStatus, "pending">;
