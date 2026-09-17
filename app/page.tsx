import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="PaidDM home">
          PaidDM
        </Link>
        <Link className="text-link" href="/login">
          Sign in
        </Link>
      </header>

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
    </main>
  );
}
