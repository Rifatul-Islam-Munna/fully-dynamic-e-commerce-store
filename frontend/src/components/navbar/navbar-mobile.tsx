"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { RiMenu4Fill } from "react-icons/ri";
import { LogIn, UserPlus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavbarItem } from "./navbar.types";

type NavbarMobileProps = {
  items: NavbarItem[];
};

function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="size-10 rounded-full border border-border/60 bg-white/70 text-primary shadow-[0_16px_40px_-32px_rgba(15,23,42,0.4)] transition-all duration-300 hover:bg-white"
      aria-label="Open mobile menu"
    >
      <RiMenu4Fill className="size-5" />
    </Button>
  );
}

function MobileNavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <Link
      href={href}
      className={cn("transition-colors duration-300 ease-out", className)}
      onClick={() => setOpenMobile(false)}
    >
      {children}
    </Link>
  );
}

export function NavbarMobile({ items }: NavbarMobileProps) {
  return (
    <div className="md:hidden">
      <SidebarProvider defaultOpen={false} className="min-h-0 w-auto">
        <MobileSidebarTrigger />
        <Sidebar
          side="right"
          collapsible="offcanvas"
          className="max-w-[88vw] border-l-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,249,249,0.96))] shadow-none [--sidebar-width:22rem]"
        >
          <SidebarHeader className="px-6 py-6">
            <MobileNavLink
              href="/"
              className="font-headline text-[1.7rem] font-semibold uppercase tracking-[0.18em] text-primary"
            >
              Menu
            </MobileNavLink>
            <p className="mt-2 font-body text-sm text-on-surface-variant">
              Explore collections, search products, manage account.
            </p>
          </SidebarHeader>

          <SidebarContent className="px-4 py-2">
            <SidebarGroup className="p-0">
              <SidebarMenu className="gap-1">
                {items.map((item) => {
                  const hasSubNav = item.subNav.length > 0;

                  return (
                    <SidebarMenuItem key={item.url} className="space-y-1">
                      <SidebarMenuButton
                        asChild
                        className="h-12 rounded-[18px] px-4 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant hover:bg-white hover:text-primary"
                      >
                        <MobileNavLink href={item.url}>
                          {item.title}
                        </MobileNavLink>
                      </SidebarMenuButton>

                      {hasSubNav && (
                        <SidebarMenuSub className="mt-1 border-l-0 pl-4">
                          {item.subNav.map((subItem) => (
                            <SidebarMenuSubItem
                              key={`${item.url}-${subItem.url}`}
                            >
                              <SidebarMenuSubButton
                                asChild
                                className="rounded-[16px] px-4 text-sm text-on-surface-variant hover:bg-white hover:text-primary"
                              >
                                <MobileNavLink href={subItem.url}>
                                  {subItem.title}
                                </MobileNavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-6 py-6">
            <div className="flex flex-col gap-3">
              <MobileNavLink
                href="/login"
                className="flex items-center justify-center gap-2 rounded-full border border-border/70 bg-white/80 px-5 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-white"
              >
                <LogIn className="size-4" />
                Sign In
              </MobileNavLink>
              <MobileNavLink
                href="/signup"
                className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-on-primary transition-opacity hover:opacity-90"
              >
                <UserPlus className="size-4" />
                Join
              </MobileNavLink>
            </div>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
