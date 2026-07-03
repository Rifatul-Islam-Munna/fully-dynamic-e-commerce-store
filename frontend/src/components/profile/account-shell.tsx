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
    <main className="account-root commerce-content py-6 sm:py-10">
      <section className="commerce-panel grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-4">
          {profile.avatarUrl?.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={fullName || "User avatar"}
              className="size-14 border border-border object-cover sm:size-16"
            />
          ) : (
            <div className="flex size-14 items-center justify-center bg-primary text-lg font-semibold text-primary-foreground sm:size-16">
              {initials || "U"}
            </div>
          )}
          <div className="min-w-0">
            <p className="commerce-eyebrow">Customer account</p>
            <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {fullName || "My Account"}
            </h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-sm px-3 py-1 capitalize">
            {profile.status}
          </Badge>
          <Badge variant="outline" className="rounded-sm px-3 py-1">
            Member since {formatMemberSince(profile.createdAt)}
          </Badge>
        </div>
      </section>

      <div className="mt-5 lg:hidden">
        <AccountNav />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-4">
            <AccountNav />
            <div className="commerce-panel-muted p-4">
              <p className="commerce-eyebrow">Account details</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd className="mt-0.5 font-medium">{profile.phoneNumber?.trim() || "Not added"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Role</dt>
                  <dd className="mt-0.5 font-medium capitalize">{profile.role}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email status</dt>
                  <dd className="mt-0.5 font-medium">{profile.isEmailVerified ? "Verified" : "Not verified"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
