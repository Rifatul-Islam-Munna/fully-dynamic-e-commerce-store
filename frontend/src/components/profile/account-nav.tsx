"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  KeyRound,
  LayoutDashboard,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCOUNT_LINKS = [
  {
    href: "/profile",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/profile/orders",
    label: "Orders",
    icon: ClipboardList,
  },
  {
    href: "/profile/edit",
    label: "Profile",
    icon: UserRound,
  },
  {
    href: "/profile/password",
    label: "Password",
    icon: KeyRound,
  },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile: horizontal scrollable tabs ── */}
      <nav
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none lg:hidden"
        aria-label="Account navigation"
      >
        {ACCOUNT_LINKS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container/60 text-on-surface-variant hover:bg-surface-container",
              )}
            >
              <Icon className="size-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Desktop: vertical sidebar nav ── */}
      <nav className="hidden lg:grid lg:gap-1" aria-label="Account navigation">
        {ACCOUNT_LINKS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/[0.08] text-primary"
                  : "text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
