"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { AuthShell } from "@/components/auth/auth-shell";
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
    <AuthShell
      title="Sign in to your account"
      description="Use your email or phone and password to continue."
    >
      <Card className="border-border/60 bg-background/90 shadow-none backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in with your existing account credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="login-identity">Email or phone</Label>
              <Input
                id="login-identity"
                name="identity"
                value={form.identity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, identity: event.target.value }))
                }
                placeholder="you@example.com or +123..."
                required
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
                placeholder="Enter your password"
                required
              />
            </div>

            {errorMessage ? (
              <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="rounded-md border border-emerald-300/50 bg-emerald-100/60 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                {successMessage}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
