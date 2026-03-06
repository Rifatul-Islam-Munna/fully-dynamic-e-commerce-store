"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="border-border/70 bg-background/95 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.22)]">
      <CardHeader className="border-b border-border/70">
        <CardTitle className="text-xl">Edit profile</CardTitle>
        <CardDescription>
          Keep your personal details up to date so account and checkout details
          stay accurate.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 rounded-[24px] bg-muted/18 p-4 sm:flex-row sm:items-center">
            {form.avatarUrl.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatarUrl}
                alt="Profile preview"
                className="size-16 rounded-3xl object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-lg font-semibold text-primary-foreground">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                Profile preview
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Add an avatar URL if you want your account menu and profile area to
                show a personal image.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-first-name">First name</Label>
              <Input
                id="profile-first-name"
                value={form.firstName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
                required
                minLength={2}
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-last-name">Last name</Label>
              <Input
                id="profile-last-name"
                value={form.lastName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, lastName: event.target.value }))
                }
                required
                minLength={2}
                maxLength={80}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={form.phoneNumber}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                }
                maxLength={30}
                placeholder="+8801700000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-avatar-url">Avatar URL</Label>
            <Input
              id="profile-avatar-url"
              value={form.avatarUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))
              }
              maxLength={500}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/profile")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                "Save profile"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

