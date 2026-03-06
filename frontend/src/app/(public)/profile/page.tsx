import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { GetRequestNormal } from "@/api-hooks/api-hooks";

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
};

async function getProfile() {
  try {
    return await GetRequestNormal<UserProfile>("/user/me", 0, "user-profile");
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-2xl font-bold">
              {profile.firstName?.[0]}
              {profile.lastName?.[0]}
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-base font-semibold">Account Info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoField label="First Name" value={profile.firstName} />
            <InfoField label="Last Name" value={profile.lastName} />
            <InfoField label="Email" value={profile.email} />
            <InfoField label="Phone" value={profile.phoneNumber || "Not set"} />
            <InfoField label="Role" value={profile.role} />
            <InfoField label="Status" value={profile.status} />
            <InfoField
              label="Email Verified"
              value={profile.isEmailVerified ? "Yes" : "No"}
            />
            <InfoField
              label="Phone Verified"
              value={profile.isPhoneVerified ? "Yes" : "No"}
            />
          </div>
          <div className="pt-2 text-xs text-muted-foreground">
            Member since {new Date(profile.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
