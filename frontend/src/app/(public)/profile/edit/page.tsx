import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { requireAccountProfile } from "@/lib/account";

export default async function EditProfilePage() {
  const profile = await requireAccountProfile();

  return (
    <div className="space-y-4">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Profile information
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          Update the core details people see across your account and checkout
          experience.
        </p>
      </div>

      <ProfileEditForm
        profile={{
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          avatarUrl: profile.avatarUrl,
        }}
      />
    </div>
  );
}

