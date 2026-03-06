import { ChangePasswordForm } from "@/components/profile/change-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="space-y-4">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Security settings
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          Change your password here when you want to improve account security or
          replace an older password.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}

