"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser, logOutUser } from "@/actions/auth";

export function NavbarAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const user = (await getUser()) as { role?: string } | null;
      setIsAuthenticated(Boolean(user));
      setUserRole(user?.role ?? null);
    } catch {
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, [checkAuth]);

  if (checking) return <div className="h-10 w-20 animate-pulse bg-muted" aria-hidden="true" />;

  if (isAuthenticated) {
    const accountHref = userRole === "admin" ? "/admin" : "/profile";
    return (
      <div className="flex items-center gap-1.5">
        <Button asChild variant="ghost" size="icon" className="commerce-interactive size-10 rounded-sm border border-border bg-background">
          <Link href={accountHref} aria-label={userRole === "admin" ? "Admin panel" : "My account"}>
            <User className="size-4.5" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="commerce-interactive size-10 rounded-sm border border-border bg-background"
          onClick={async () => {
            await logOutUser();
            window.dispatchEvent(new Event("auth-change"));
            window.location.href = "/login";
          }}
          aria-label="Sign out"
        >
          <LogOut className="size-4.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" className="commerce-interactive h-10 rounded-sm border border-border px-4 text-xs font-semibold uppercase tracking-[0.1em]">
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild className="h-10 rounded-sm px-5 text-xs font-semibold uppercase tracking-[0.1em]">
        <Link href="/signup">Create account</Link>
      </Button>
    </div>
  );
}
