import Link from "next/link";
import { ChevronDown, Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavbarItem } from "./navbar.types";

const MAX_VISIBLE_MAIN_ITEMS = 5;

const triggerClassName =
  "commerce-interactive inline-flex h-11 items-center gap-1.5 border-b-2 border-transparent px-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:border-primary hover:text-foreground";

function SubNavigation({ item }: { item: NavbarItem }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={triggerClassName}>
          <span className="max-w-28 truncate">{item.title}</span>
          <ChevronDown className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 rounded-md border-border bg-background p-1.5"
      >
        <DropdownMenuItem asChild className="rounded-sm">
          <Link href={item.url} className="cursor-pointer font-semibold">
            Shop all {item.title}
          </Link>
        </DropdownMenuItem>
        {item.subNav.map((subItem) => (
          <DropdownMenuItem key={`${item.url}-${subItem.url}`} asChild className="rounded-sm">
            <Link href={subItem.url} className="cursor-pointer">
              {subItem.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OverflowNavigation({ items }: { items: NavbarItem[] }) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={triggerClassName} aria-label="More navigation">
          <Ellipsis className="size-4" />
          <span>More</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-md border-border bg-background p-1.5">
        {items.map((item) =>
          item.subNav.length === 0 ? (
            <DropdownMenuItem key={item.url} asChild className="rounded-sm">
              <Link href={item.url}>{item.title}</Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuSub key={item.url}>
              <DropdownMenuSubTrigger className="rounded-sm">{item.title}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-60 rounded-md border-border bg-background p-1.5">
                <DropdownMenuItem asChild className="rounded-sm">
                  <Link href={item.url} className="font-semibold">Shop all {item.title}</Link>
                </DropdownMenuItem>
                {item.subNav.map((subItem) => (
                  <DropdownMenuItem key={`${item.url}-${subItem.url}`} asChild className="rounded-sm">
                    <Link href={subItem.url}>{subItem.title}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavbarDesktop({ items }: { items: NavbarItem[] }) {
  const primaryItems = items.slice(0, MAX_VISIBLE_MAIN_ITEMS);
  const overflowItems = items.slice(MAX_VISIBLE_MAIN_ITEMS);

  return (
    <nav aria-label="Main navigation" className="hidden min-w-0 lg:flex">
      <ul className="flex items-center gap-0.5">
        {primaryItems.map((item) => (
          <li key={item.url}>
            {item.subNav.length > 0 ? (
              <SubNavigation item={item} />
            ) : (
              <Link href={item.url} className={triggerClassName}>
                <span className="max-w-28 truncate">{item.title}</span>
              </Link>
            )}
          </li>
        ))}
        <li>
          <OverflowNavigation items={overflowItems} />
        </li>
      </ul>
    </nav>
  );
}
