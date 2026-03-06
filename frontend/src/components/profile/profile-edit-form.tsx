"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditableProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
};

type ProfileEditFormProps = {
  profile: EditableProfile;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
};

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phoneNumber: profile.phoneNumber ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  });

  const initials = useMemo(
    () =>
      `${form.firstName?.trim()?.[0] ?? ""}${form.lastName?.trim()?.[0] ?? ""}`.toUpperCase() ||
      "U",
    [form.firstName, form.lastName],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await updateProfileAction({
        userId: profile.id,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        avatarUrl: form.avatarUrl,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to update profile.");
        return;
      }

      toast.success("Profile updated.");
      router.push("/profile");
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-background sm:rounded-2xl">
      <div className="border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Edit profile
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
          Keep your personal details up to date.
        </p>
      </div>

      <form className="p-4 sm:p-5" onSubmit={handleSubmit}>
        {/* ── Avatar preview ── */}
        <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 sm:p-4">
          {form.avatarUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.avatarUrl}
              alt="Profile preview"
              className="size-12 rounded-xl object-cover sm:size-14"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-base font-semibold text-primary-foreground sm:size-14">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              Profile preview
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add an avatar URL for a personal image.
            </p>
          </div>
        </div>

        {/* ── Name fields ── */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-first-name" className="text-xs sm:text-sm">
              First name
            </Label>
            <Input
              id="profile-first-name"
              value={form.firstName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, firstName: event.target.value }))
              }
              required
              minLength={2}
              maxLength={80}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-last-name" className="text-xs sm:text-sm">
              Last name
            </Label>
            <Input
              id="profile-last-name"
              value={form.lastName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, lastName: event.target.value }))
              }
              required
              minLength={2}
              maxLength={80}
              className="h-10"
            />
          </div>
        </div>

        {/* ── Contact fields ── */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-email" className="text-xs sm:text-sm">
              Email
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
              maxLength={160}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-phone" className="text-xs sm:text-sm">
              Phone
            </Label>
            <Input
              id="profile-phone"
              value={form.phoneNumber}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  phoneNumber: event.target.value,
                }))
              }
              maxLength={30}
              placeholder="+8801700000000"
              className="h-10"
            />
          </div>
        </div>

        {/* ── Avatar URL ── */}
        <div className="mt-4 space-y-1.5">
          <Label htmlFor="profile-avatar-url" className="text-xs sm:text-sm">
            Avatar URL
          </Label>
          <Input
            id="profile-avatar-url"
            value={form.avatarUrl}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))
            }
            maxLength={500}
            placeholder="https://example.com/avatar.jpg"
            className="h-10"
          />
        </div>

        {/* ── Actions ── */}
        <div className="mt-5 flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/profile")}
            disabled={isPending}
            className="order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="order-1 sm:order-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
