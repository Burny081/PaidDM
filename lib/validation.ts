import { z } from "zod";

export const profileSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,20}$/),
  bio: z.string().trim().max(160),
  dmPrice: z.coerce.number().positive().multipleOf(0.01),
});

export const messageSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

export const replySchema = z.object({
  content: z.string().trim().min(1).max(1000),
});
