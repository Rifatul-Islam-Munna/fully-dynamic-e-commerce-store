"use client";

import { useSyncExternalStore } from "react";
import {
  Check,
  ChevronDown,
  Flame,
  Leaf,
  Moon,
  Palette,
  Sun,
  Waves,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SITE_THEME_OPTIONS,
  type SiteThemeName,
} from "@/lib/site-appearance";

function renderThemeIcon(theme: SiteThemeName, className?: string) {
  switch (theme) {
    case "light":
      return <Sun className={className} />;
    case "cobalt":
      return <Waves className={className} />;
    case "emerald":
      return <Leaf className={className} />;
    case "rose":
      return <Flame className={className} />;
    case "amber":
      return <Sun className={className} />;
    case "teal":
      return <Waves className={className} />;
    case "slate":
      return <Moon className={className} />;
    case "berry":
      return <Palette className={className} />;
    case "coral":
      return <Flame className={className} />;
    case "violet":
      return <Palette className={className} />;
    case "navy":
      return <Moon className={className} />;
    case "ruby":
      return <Flame className={className} />;
    case "olive":
      return <Leaf className={className} />;
    case "sky":
      return <Waves className={className} />;
    case "graphite":
      return <Moon className={className} />;
    case "sand":
      return <Sun className={className} />;
    case "ocean":
      return <Waves className={className} />;
    case "orchid":
      return <Palette className={className} />;
    case "forest":
      return <Leaf className={className} />;
    case "crimson":
      return <Flame className={className} />;
    case "denim":
      return <Waves className={className} />;
    case "sage":
      return <Leaf className={className} />;
    case "plum":
      return <Palette className={className} />;
    case "espresso":
      return <Moon className={className} />;
    case "sunset":
      return <Flame className={className} />;
    default:
      return <Palette className={className} />;
  }
}

export function ThemeSwitcher() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { theme, setTheme, forcedTheme } = useTheme();

  if (!isClient) {
    return <div className="h-9 w-40 rounded-md border border-border/55" />;
  }

  const lockedTheme = forcedTheme as SiteThemeName | undefined;
  const activeTheme =
    SITE_THEME_OPTIONS.find((item) => item.value === (lockedTheme ?? theme)) ??
    SITE_THEME_OPTIONS[0];

  if (lockedTheme) {
    return (
      <div className="inline-flex h-9 items-center gap-2 rounded-md bg-surface px-3 text-sm text-on-surface-variant">
        {renderThemeIcon(activeTheme.value, "size-4 text-primary")}
        <span>Theme: {activeTheme.label}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 border-border/60 bg-surface shadow-none transition-colors duration-300 ease-out hover:bg-surface-container"
        >
          {renderThemeIcon(activeTheme.value, "size-4")}
          <span className="text-sm">{activeTheme.label}</span>
          <ChevronDown className="size-4 text-on-surface-variant" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-40 border-border/60 bg-surface shadow-none"
      >
        {SITE_THEME_OPTIONS.map(({ value, label }) => {
          const isActive = theme === value;

          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                {renderThemeIcon(value, "size-4")}
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
