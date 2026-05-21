"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser, logOutUser } from "@/actions/auth";

export function NavbarAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Cast user to any to safely access the role property without TS errors
      const user: any = await getUser();
      setIsAuthenticated(!!user);
      setUserRole(user?.role || null);
    } catch {
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Listen for cross-tab or same-tab auth changes
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
    };
  }, [checkAuth]);

  if (checking) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-10 rounded-full border border-border/60 bg-white/72 text-[#001819] shadow-[0_14px_36px_-28px_rgba(15,23,42,0.4)] transition-all duration-300 hover:bg-white"
        >
          <Link href={userRole === "admin" ? "/admin" : "/profile"} aria-label={userRole === "admin" ? "Admin Panel" : "Profile"}>
            <User className="size-4.5" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full border border-border/60 bg-white/72 text-[#001819] shadow-[0_14px_36px_-28px_rgba(15,23,42,0.4)] transition-all duration-300 hover:bg-white"
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
      <Button
        asChild
        variant="ghost"
        className="h-10 rounded-full border border-border/60 bg-white/72 px-4 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant shadow-[0_14px_36px_-28px_rgba(15,23,42,0.35)] transition-colors hover:bg-white hover:text-primary"
      >
        <Link href="/login">Sign In</Link>
      </Button>
      <Button
        asChild
        className="h-10 rounded-full bg-primary px-5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-on-primary hover:opacity-90 transition-opacity"
      >
        <Link href="/signup">Join</Link>
      </Button>
    </div>
  );
}
