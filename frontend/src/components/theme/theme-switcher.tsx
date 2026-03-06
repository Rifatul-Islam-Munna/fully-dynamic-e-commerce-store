"use client";

import { useSyncExternalStore } from "react";
import { Check, ChevronDown, Flame, Leaf, Moon, Palette, Sun, Waves } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_ITEMS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "sepia", label: "Sepia", Icon: Palette },
  { value: "blue", label: "Blue", Icon: Waves },
  { value: "orange", label: "Orange", Icon: Flame },
  { value: "green", label: "Green", Icon: Leaf },
] as const;

export function ThemeSwitcher() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { theme, setTheme } = useTheme();

  if (!isClient) {
    return <div className="h-9 w-40 rounded-md border border-border/55" />;
  }

  const activeTheme = THEME_ITEMS.find((item) => item.value === theme) ?? THEME_ITEMS[0];
  const ActiveIcon = activeTheme.Icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 border-border/60 bg-background shadow-none transition-colors duration-300 ease-out hover:bg-muted"
        >
          <ActiveIcon className="size-4" />
          <span className="text-sm">{activeTheme.label}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-40 border-border/60 bg-background shadow-none"
      >
        {THEME_ITEMS.map(({ value, label, Icon }) => {
          const isActive = theme === value;

          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                {label}
              </span>
              <Check
                className={cn(
                  "size-4",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
