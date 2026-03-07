"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/actions/auth";

type LoginState = {
  identity: string;
  password: string;
};

const INITIAL_STATE: LoginState = {
  identity: "",
  password: "",
};

export default function LoginPage() {
  const [form, setForm] = useState<LoginState>(INITIAL_STATE);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: (data: LoginState) => loginUser(data),
    onSuccess: (data) => {
      if (data?.data) {
        setSuccessMessage("Login successful. Redirecting...");
        setErrorMessage("");

        const role = data.role;
        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/profile");
        }
        return;
      }
      setErrorMessage(data?.error?.message || "Login failed.");
      setSuccessMessage("");
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
      setSuccessMessage("");
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    mutate({
      identity: form.identity,
      password: form.password,
    });
  }

  return (
    <AuthShell>
      <div className="flex flex-col space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your existing account credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-identity">Email or phone</Label>
            <Input
              id="login-identity"
              name="identity"
              value={form.identity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, identity: event.target.value }))
              }
              placeholder="you@example.com"
              required
              className="rounded-md shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              required
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
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Don&apos;t have an account?{" "}
          </span>
          <Link
            href="/signup"
            className="font-medium hover:underline underline-offset-4"
          >
            Create one
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
