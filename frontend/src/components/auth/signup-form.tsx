"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCommonMutationApi } from "@/api-hooks/use-api-mutation";

type SignupState = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

const INITIAL_STATE: SignupState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
};

export function SignupForm() {
  const [form, setForm] = useState<SignupState>(INITIAL_STATE);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { mutate, isPending: isSubmitting } = useCommonMutationApi({
    url: "/user/signup",
    method: "POST",
    onSuccess: () => {
      setSuccessMessage("Account created successfully.");
      setErrorMessage("");
      setForm(INITIAL_STATE);
    },
    onError: (error) => {
      setErrorMessage(error.message);
      setSuccessMessage("");
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim() || undefined,
      password: form.password,
    };
    mutate(payload);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signup-first-name">First name</Label>
          <Input
            id="signup-first-name"
            value={form.firstName}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                firstName: event.target.value,
              }))
            }
            required
            minLength={2}
            maxLength={80}
            className="rounded-md shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-last-name">Last name</Label>
          <Input
            id="signup-last-name"
            value={form.lastName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, lastName: event.target.value }))
            }
            required
            minLength={2}
            maxLength={80}
            className="rounded-md shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          required
          maxLength={160}
          className="rounded-md shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-phone">
          Phone{" "}
          <span className="text-muted-foreground text-xs font-normal ml-1">
            (Optional)
          </span>
        </Label>
        <Input
          id="signup-phone"
          value={form.phoneNumber}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              phoneNumber: event.target.value,
            }))
          }
          maxLength={30}
          className="rounded-md shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          required
          minLength={8}
          maxLength={100}
          className="rounded-md shadow-sm"
        />
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          {successMessage}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full rounded-md shadow-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Sign up"
        )}
      </Button>

      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          href="/login"
          className="font-medium hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}
