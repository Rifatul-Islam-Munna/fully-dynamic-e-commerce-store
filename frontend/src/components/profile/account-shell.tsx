import { Badge } from "@/components/ui/badge";
import { AccountNav } from "@/components/profile/account-nav";
import type { AccountProfile } from "@/lib/account";

function getInitials(profile: AccountProfile) {
  return `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase();
}

function formatMemberSince(createdAt: string) {
  return new Intl.DateTimeFormat("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(createdAt));
}

export function AccountShell({
  profile,
  children,
}: {
  profile: AccountProfile;
  children: React.ReactNode;
}) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = getInitials(profile);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(255,255,255,1),rgba(239,246,255,0.8))] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            {profile.avatarUrl?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={fullName || "User avatar"}
                className="size-16 rounded-3xl object-cover shadow-sm"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
                {initials || "U"}
              </div>
            )}
            <div className="space-y-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                My account
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Welcome back, {profile.firstName}
                </h1>
                <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
                  Track orders, update your profile, and keep your account secure
                  from one place.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1.5">
              {profile.status}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1.5">
              Member since {formatMemberSince(profile.createdAt)}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1.5">
              {profile.isEmailVerified ? "Email verified" : "Email not verified"}
            </Badge>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-[28px] border border-border/70 bg-background p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.22)]">
            <p className="text-sm font-semibold text-foreground">{fullName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
            <div className="mt-4 grid gap-3 border-t border-border/70 pt-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Phone
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {profile.phoneNumber?.trim() || "Not added yet"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Role
                </p>
                <p className="mt-1 text-sm capitalize text-foreground">
                  {profile.role}
                </p>
              </div>
            </div>
          </div>
          <AccountNav />
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}

