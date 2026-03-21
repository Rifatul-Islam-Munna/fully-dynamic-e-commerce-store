"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavbarAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    setToken(stored);
    setChecking(false);
  }, []);

  if (checking) {
    return null;
  }

  if (token) {
    return (
      <div className="flex items-center gap-1">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-10 rounded-full text-[#001819] transition-all duration-300 hover:bg-[#eeeeee]"
        >
          <Link href="/profile" aria-label="Profile">
            <User className="size-[18px]" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full text-[#001819] transition-all duration-300 hover:bg-[#eeeeee]"
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }}
          aria-label="Sign out"
        >
          <LogOut className="size-[18px]" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="ghost"
        className="h-9 rounded-full px-4 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
      >
        <Link href="/login">Sign In</Link>
      </Button>
      <Button
        asChild
        className="h-9 rounded-full bg-primary px-5 font-label text-xs font-bold uppercase tracking-widest text-on-primary hover:opacity-90 transition-opacity"
      >
        <Link href="/signup">Join</Link>
      </Button>
    </div>
  );
}
