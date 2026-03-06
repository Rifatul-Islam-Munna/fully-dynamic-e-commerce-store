import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { requireAccountProfile } from "@/lib/account";

export default async function EditProfilePage() {
  const profile = await requireAccountProfile();

  return (
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
  );
}
