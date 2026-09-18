import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { MessageComposer } from "@/features/profiles/message-composer";
import { mockProfiles, mockUsers } from "@/lib/mock-data";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = mockProfiles.find((candidate) => candidate.slug === handle.replace(/^@/, "").toLowerCase());
  const creator = profile
    ? mockUsers.find((candidate) => candidate.id === profile.userId)
    : undefined;

  if (!profile || !creator) notFound();

  const initials = creator.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="app-page public-profile-page">
      <AppHeader />
      <div className="public-profile-layout">
        <section aria-labelledby="profile-name" className="profile-intro">
          <span aria-label={`${creator.displayName} avatar`} className="avatar avatar-initials" role="img">
            {initials}
          </span>
          <p className="eyebrow">PaidDM for creators</p>
          <h1 id="profile-name">{creator.displayName}</h1>
          <p className="profile-handle">@{profile.slug}</p>
          <p className="profile-bio">{profile.bio}</p>
          <Card className="profile-price-card">
            <strong>${profile.dmPrice} USDC</strong>
            <span> per message</span>
          </Card>
          <p className="wallet-free-copy">No wallet connection needed for this simulated test payment.</p>
        </section>
        <MessageComposer profile={profile} />
      </div>
    </main>
  );
}
