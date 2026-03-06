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
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* ── Profile header ── */}
      <section className="rounded-2xl border border-border/60 bg-linear-to-br from-primary/4 via-background to-primary/2 p-4 sm:rounded-3xl sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          {profile.avatarUrl?.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={fullName || "User avatar"}
              className="size-12 rounded-2xl object-cover shadow-sm sm:size-14"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-sm sm:size-14 sm:text-lg">
              {initials || "U"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {fullName || "My Account"}
            </h1>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {profile.email}
            </p>
          </div>
          <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-1 text-[11px]"
            >
              {profile.status}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full px-2.5 py-1 text-[11px]"
            >
              Since {formatMemberSince(profile.createdAt)}
            </Badge>
          </div>
        </div>
      </section>

      {/* ── Mobile nav tabs ── */}
      <div className="mt-3 lg:hidden">
        <AccountNav />
      </div>

      {/* ── Content layout ── */}
      <div className="mt-4 grid gap-5 lg:mt-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Account
              </p>
              <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {profile.phoneNumber?.trim() || "Not added"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="mt-0.5 text-sm capitalize text-foreground">
                    {profile.role}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {profile.isEmailVerified ? "✓ Verified" : "Not verified"}
                  </p>
                </div>
              </div>
            </div>
            <AccountNav />
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
