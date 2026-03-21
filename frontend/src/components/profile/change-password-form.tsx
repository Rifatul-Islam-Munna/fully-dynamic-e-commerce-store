"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { sileo } from "sileo";
import { changePasswordAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordForm() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.newPassword.length < 8) {
      sileo.error({ title: "Something went wrong", description: "New password must be at least 8 characters." });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      sileo.error({ title: "Something went wrong", description: "New password and confirm password do not match." });
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      if (!result.success) {
        sileo.error({ title: "Something went wrong", description: result.error || "Failed to change password." });
        return;
      }

      sileo.success({ title: "Success", description: "Password updated successfully." });
      setForm(INITIAL_STATE);
    });
  }

  return (
    <div className="rounded-xl border border-border/60 bg-surface sm:rounded-2xl">
      <div className="border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="text-base font-semibold text-on-surface sm:text-lg">
          Change password
        </h2>
        <p className="mt-0.5 text-xs text-on-surface-variant sm:text-sm">
          Update your sign-in password.
        </p>
      </div>

      <div className="p-4 sm:p-5">
        {/* ── Security tip ── */}
        <div className="flex items-start gap-3 rounded-xl bg-primary/6 p-3 sm:p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface">Password tips</p>
            <p className="mt-0.5 text-xs text-on-surface-variant sm:text-sm">
              Use at least 8 characters and choose something different from your
              current password.
            </p>
          </div>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="current-password" className="text-xs sm:text-sm">
              Current password
            </Label>
            <Input
              id="current-password"
              type="password"
              value={form.currentPassword}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  currentPassword: event.target.value,
                }))
              }
              required
              minLength={8}
              maxLength={100}
              className="h-10"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs sm:text-sm">
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={form.newPassword}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
                required
                minLength={8}
                maxLength={100}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs sm:text-sm">
                Confirm new password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                required
                minLength={8}
                maxLength={100}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save new password"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}



