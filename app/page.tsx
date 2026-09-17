import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const steps = ["Set your price", "Receive a message", "Get paid"];

export default function HomePage() {
  return (
    <main className="landing-page">
      <AppHeader />

      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">Paid messages for creators</p>
        <h1 id="hero-title">Messages worth opening.</h1>
        <p className="hero-copy">
          Let the right people reach you, set a price for your time, and keep
          every conversation intentional.
        </p>
        <Link className="primary-action" href="/login">
          Create your PaidDM
        </Link>
      </section>

      <section className="landing-section" aria-labelledby="how-it-works-title">
        <p className="eyebrow">How it works</p>
        <h2 id="how-it-works-title">A clearer path to your inbox.</h2>
        <ol className="steps">
          {steps.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">0{index + 1}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section creator-section" aria-labelledby="creator-title">
        <div>
          <p className="eyebrow">Creator preview</p>
          <h2 id="creator-title">Built around a real boundary.</h2>
          <p className="section-copy">
            Make your availability visible before a conversation starts.
          </p>
        </div>
        <Card className="creator-card">
          <Avatar src="/avatars/idris.png" alt="" />
          <div>
            <p className="creator-name">Idris Adeyemi</p>
            <p className="creator-handle">@idris</p>
          </div>
          <p className="creator-bio">
            Designer and creator helping ambitious teams ship better work.
          </p>
          <p className="creator-price">$2.00 USDC / message</p>
        </Card>
      </section>

      <aside className="security-note" aria-label="Privacy note">
        <strong>Private by design.</strong> Message content stays off-chain.
      </aside>
      <footer className="site-footer">PaidDM is a testnet MVP preview.</footer>
    </main>
  );
}
