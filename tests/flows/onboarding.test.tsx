import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { ProfileForm } from "@/features/onboarding/profile-form";
import {
  MockStoreProvider,
  type MockStoreApi,
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

describe("ProfileForm", () => {
  it("shows an inline price error and saves a normalized valid creator profile", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <MockStoreProvider>
        <StoreProbe />
        <ProfileForm onComplete={onComplete} />
      </MockStoreProvider>,
    );

    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(await screen.findByText(/must be greater than 0/i)).toBeInTheDocument();
    expect(store?.state.profiles.find((profile) => profile.userId === "user-idris")).toMatchObject({
      slug: "idris",
      dmPrice: 2,
    });

    await user.clear(screen.getByLabelText(/your paiddm handle/i));
    await user.type(screen.getByLabelText(/your paiddm handle/i), " Idris ");
    await user.type(screen.getByLabelText(/short bio/i), "Designer • AI • YouTube");
    await user.clear(screen.getByLabelText(/price per message/i));
    await user.type(screen.getByLabelText(/price per message/i), "2.00");
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(store?.state.profiles.find((profile) => profile.userId === "user-idris")).toMatchObject({
      slug: "idris",
      bio: "Designer • AI • YouTube",
      dmPrice: 2,
    });
    expect(onComplete).toHaveBeenCalledWith("/dashboard");
  });
});
