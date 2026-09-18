import type { Profile, User } from "@/lib/domain";

export const FIXED_TIMESTAMPS = {
  paymentCreated: "2026-09-17T09:00:00.000Z",
  paymentConfirmed: "2026-09-17T09:00:00.600Z",
  replyCreated: "2026-09-17T09:01:00.000Z",
} as const;

export const mockUsers: User[] = [
  {
    id: "user-idris",
    username: "idris",
    displayName: "Idris Adeyemi",
    avatarUrl: "/avatars/idris.png",
    walletAddress: "0x1dR150000000000000000000000000000000000",
  },
  {
    id: "user-alex",
    username: "alex",
    displayName: "Alex Morgan",
    avatarUrl: "/avatars/alex.png",
    walletAddress: "0xA1eX000000000000000000000000000000000000",
  },
];

export const mockProfiles: Profile[] = [
  {
    id: "profile-idris",
    userId: "user-idris",
    slug: "idris",
    bio: "Designer and creator helping ambitious teams ship better work.",
    dmPrice: 2,
    currency: "USDC",
    active: true,
  },
];

export const mockCurrentUser = mockUsers[0];
export const mockBalance = 128.75;
