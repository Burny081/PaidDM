"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMockStore } from "@/lib/mock-store";

export function LoginPanel() {
  const router = useRouter();
  const { signIn } = useMockStore();

  function continueWithX() {
    signIn();
    router.push("/onboarding");
  }

  return (
    <section className="auth-panel" aria-labelledby="login-title">
      <p className="eyebrow">Creator access</p>
      <h1 id="login-title">Start with your creator page.</h1>
      <p>Sign-in is simulated in this testnet MVP preview. No account is connected.</p>
      <Button className="button-wide" onClick={continueWithX}>
        Continue with X (simulated)
      </Button>
    </section>
  );
}
