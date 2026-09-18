import { describe, expect, it } from "vitest";
import { messageSchema, profileSchema } from "@/lib/validation";

describe("profileSchema", () => {
  it("normalizes a valid slug and accepts a two-decimal price", () => {
    expect(
      profileSchema.parse({ slug: " Idris ", bio: "Designer", dmPrice: "2.00" }),
    ).toMatchObject({ slug: "idris", dmPrice: 2 });
  });

  it("rejects a zero price", () => {
    expect(() =>
      profileSchema.parse({ slug: "idris", bio: "", dmPrice: "0" }),
    ).toThrow();
  });
});

it("rejects a blank private message", () => {
  expect(() => messageSchema.parse({ content: "   " })).toThrow();
});
