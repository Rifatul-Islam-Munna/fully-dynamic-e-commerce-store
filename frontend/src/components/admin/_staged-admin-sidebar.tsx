"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Boxes,
  Globe2,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Navigation,
  Package,
  PanelBottom,
  Settings,
  ShoppingBag,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPS = [
  {
    label: "Commerce",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Inventory", href: "/admin/stock-management", icon: Boxes },
      { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
      { label: "Customers", href: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Storefront",
    items: [
      { label: "Home builder", href: "/admin/home-settings", icon: LayoutTemplate },
      { label: "Navigation", href: "/admin/navbar-settings", icon: Navigation },
      { label: "Footer", href: "/admin/footer-settings", icon: PanelBottom },
      { label: "SEO & tracking", href: "/admin/seo-settings", icon: Globe2 },
      { label: "Site settings", href: "/admin/site-settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="commerce-interactive fixed left-4 top-4 z-[60] flex size-11 items-center justify-center border border-border bg-background lg:hidden"
        aria-label="Toggle administration menu"
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close administration menu"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[72px] items-center border-b border-border px-6">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="flex size-9 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">A</span>
            <span>
              <span className="block text-sm font-semibold">Store Admin</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Operations</span>
            </span>
          </Link>
        </div>

        <nav className="commerce-scrollbar-hidden flex-1 overflow-y-auto px-4 py-5" aria-label="Administration">
          <div className="space-y-7">
            {GROUPS.map((group) => (
              <section key={group.label}>
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{group.label}</p>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "commerce-interactive flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium",
                          active
                            ? "border-primary bg-muted text-foreground"
                            : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        <item.icon className="size-[18px] shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/"
            className="commerce-interactive flex items-center gap-3 border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-[18px]" />
            View storefront
          </Link>
        </div>
      </aside>
    </>
  );
}
