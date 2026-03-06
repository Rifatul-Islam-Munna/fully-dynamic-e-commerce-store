"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/actions/profile";
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
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to change password.");
        return;
      }

      toast.success("Password updated successfully.");
      setForm(INITIAL_STATE);
    });
  }

  return (
    <Card className="border-border/70 bg-background/95 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.22)]">
      <CardHeader className="border-b border-border/70">
        <CardTitle className="text-xl">Change password</CardTitle>
        <CardDescription>
          Update your sign-in password and keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex items-start gap-4 rounded-[24px] bg-muted/18 p-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Password tips
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Use at least 8 characters and choose something different from your
              current password.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
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
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
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
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-border/70 pt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Save new password"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

