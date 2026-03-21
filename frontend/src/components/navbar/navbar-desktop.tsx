import Link from "next/link";
import { ChevronDown, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type NavbarDesktopProps = {
  items: NavbarItem[];
};

const MAX_VISIBLE_MAIN_ITEMS = 5;

function DesktopSubNavDropdown({
  item,
  triggerClassName,
}: {
  item: NavbarItem;
  triggerClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={triggerClassName}>
          <span className="truncate">{item.title}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 border-border/30 bg-background/95 shadow-lg shadow-primary/5 backdrop-blur-xl"
      >
        <DropdownMenuItem asChild>
          <Link href={item.url} className="cursor-pointer font-medium">
            View {item.title}
          </Link>
        </DropdownMenuItem>
        {item.subNav.map((subItem) => (
          <DropdownMenuItem key={`${item.url}-${subItem.url}`} asChild>
            <Link href={subItem.url} className="cursor-pointer">
              {subItem.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopOverflowMenu({ items }: { items: NavbarItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <li>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 px-3 font-headline text-sm font-bold uppercase tracking-tight text-on-surface-variant hover:text-primary transition-colors"
          >
            <Ellipsis className="size-4" />
            More
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-60 border-border/30 bg-background/95 shadow-lg shadow-primary/5 backdrop-blur-xl"
        >
          {items.map((item) => {
            const hasSubNav = item.subNav.length > 0;

            if (!hasSubNav) {
              return (
                <DropdownMenuItem key={item.url} asChild>
                  <Link href={item.url} className="cursor-pointer">
                    {item.title}
                  </Link>
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuSub key={item.url}>
                <DropdownMenuSubTrigger>{item.title}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56 border-border/30 bg-background/95 shadow-lg shadow-primary/5 backdrop-blur-xl">
                  <DropdownMenuItem asChild>
                    <Link href={item.url} className="cursor-pointer font-medium">
                      View {item.title}
                    </Link>
                  </DropdownMenuItem>
                  {item.subNav.map((subItem) => (
                    <DropdownMenuItem key={`${item.url}-${subItem.url}`} asChild>
                      <Link href={subItem.url} className="cursor-pointer">
                        {subItem.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

export function NavbarDesktop({ items }: NavbarDesktopProps) {
  const primaryItems = items.slice(0, MAX_VISIBLE_MAIN_ITEMS);
  const overflowItems = items.slice(MAX_VISIBLE_MAIN_ITEMS);

  return (
    <nav aria-label="Main navigation" className="hidden min-w-0 md:flex">
      <ul className="flex items-center gap-8">
        {primaryItems.map((item) => {
          const hasSubNav = item.subNav.length > 0;

          if (!hasSubNav) {
            return (
              <li key={item.url}>
                <Link
                  href={item.url}
                  className="inline-flex items-center font-headline text-sm font-bold uppercase tracking-tight text-on-surface-variant transition-colors hover:text-primary"
                >
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.url}>
              <DesktopSubNavDropdown
                item={item}
                triggerClassName="inline-flex items-center gap-1 font-headline text-sm font-bold uppercase tracking-tight text-on-surface-variant transition-colors hover:text-primary"
              />
            </li>
          );
        })}
        <DesktopOverflowMenu items={overflowItems} />
      </ul>
    </nav>
  );
}
