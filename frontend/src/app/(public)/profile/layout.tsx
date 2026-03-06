import { AccountShell } from "@/components/profile/account-shell";
import { requireAccountProfile } from "@/lib/account";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAccountProfile();

  return <AccountShell profile={profile}>{children}</AccountShell>;
}

