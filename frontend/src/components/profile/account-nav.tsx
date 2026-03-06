"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, LayoutDashboard, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCOUNT_LINKS = [
  {
    href: "/profile",
    label: "Dashboard",
    description: "Orders and account overview",
    icon: LayoutDashboard,
  },
  {
    href: "/profile/edit",
    label: "Edit profile",
    description: "Name, email, phone, and avatar",
    icon: UserRound,
  },
  {
    href: "/profile/password",
    label: "Change password",
    description: "Security and sign-in details",
    icon: KeyRound,
  },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-2">
      {ACCOUNT_LINKS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-start gap-3 rounded-2xl border px-4 py-4 transition-colors",
              isActive
                ? "border-primary/25 bg-primary/[0.07]"
                : "border-border/70 bg-background hover:bg-muted/18",
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex size-10 items-center justify-center rounded-2xl",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-sm leading-5 text-muted-foreground">
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

