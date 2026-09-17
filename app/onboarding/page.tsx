"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ProfileForm } from "@/features/onboarding/profile-form";

export default function OnboardingPage() {
  const router = useRouter();
  return <main className="app-page"><AppHeader /><section className="onboarding-panel" aria-labelledby="onboarding-title"><p className="eyebrow">One small setup step</p><h1 id="onboarding-title">Set your message price.</h1><p>Give people a clear way to respect your time.</p><ProfileForm onComplete={(destination) => router.push(destination)} /></section></main>;
}
