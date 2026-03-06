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
      className="size-10 rounded-md border border-border/55 bg-background shadow-none transition-colors duration-300 ease-out hover:bg-muted/70"
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
          className="border-l border-border/55 bg-background shadow-none"
        >
          <SidebarHeader className="border-b border-border/50 px-4 py-3">
            <MobileNavLink
              href="/"
              className="text-base font-semibold tracking-tight"
            >
              Menu
            </MobileNavLink>
          </SidebarHeader>

          <SidebarContent className="px-4 py-4">
            <SidebarGroup className="p-0">
              <SidebarMenu className="gap-3">
                {items.map((item) => {
                  const hasSubNav = item.subNav.length > 0;

                  return (
                    <SidebarMenuItem key={item.url} className="space-y-1">
                      <SidebarMenuButton
                        asChild
                        className="h-9 rounded-md px-2 text-sm font-medium hover:bg-muted/70"
                      >
                        <MobileNavLink href={item.url}>
                          {item.title}
                        </MobileNavLink>
                      </SidebarMenuButton>

                      {hasSubNav && (
                        <SidebarMenuSub className="mt-1 border-l border-border/45 pl-3">
                          {item.subNav.map((subItem) => (
                            <SidebarMenuSubItem
                              key={`${item.url}-${subItem.url}`}
                            >
                              <SidebarMenuSubButton
                                asChild
                                className="rounded-md px-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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

          {/* Auth links in mobile sidebar */}
          <SidebarFooter className="border-t border-border/50 px-4 py-4">
            <div className="flex flex-col gap-2">
              <MobileNavLink
                href="/login"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-muted/70"
              >
                <LogIn className="size-4" />
                Login
              </MobileNavLink>
              <MobileNavLink
                href="/signup"
                className="flex items-center gap-2 rounded-md bg-primary px-2 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <UserPlus className="size-4" />
                Sign Up
              </MobileNavLink>
            </div>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
