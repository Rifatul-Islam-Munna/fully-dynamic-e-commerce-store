import Link from "next/link";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { normalizeNavbar } from "./navbar-normalize";
import { NavbarDesktop } from "./navbar-desktop";
import { NavbarMobile } from "./navbar-mobile";
import { SearchDialog } from "./search-dialog";
import { NavbarAuth } from "./navbar-auth";
import { CartSheet } from "@/components/cart/cart-sheet";
import type { NavbarApiResponse } from "./navbar.types";

const NAVBAR_TAG = "web-settings-navbar";
const SITE_SETTINGS_TAG = "web-settings-site";

type SiteBrandResponse = {
  siteTitle?: string | null;
  logoUrl?: string | null;
};

function normalizeBrandValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

async function getNavbarData(key: string) {
  try {
    return await GetRequestNormal<NavbarApiResponse>(
      `/web-settings/navbar?key=${encodeURIComponent(key)}`,
      60,
      NAVBAR_TAG,
    );
  } catch {
    return null;
  }
}

async function getSiteBrandData(key: string) {
  try {
    return await GetRequestNormal<SiteBrandResponse>(
      `/web-settings/site?key=${encodeURIComponent(key)}`,
      0,
      SITE_SETTINGS_TAG,
    );
  } catch {
    return null;
  }
}

export async function Navbar({ settingKey = "default" }: { settingKey?: string }) {
  const [payload, siteBrand] = await Promise.all([
    getNavbarData(settingKey),
    getSiteBrandData(settingKey),
  ]);
  const items = normalizeNavbar(payload);
  const brandTitle = normalizeBrandValue(siteBrand?.siteTitle) ?? "ATELIER";
  const brandLogo = normalizeBrandValue(siteBrand?.logoUrl);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="commerce-container flex min-h-[72px] items-center gap-4 lg:gap-7">
        <Link
          href="/"
          className="commerce-interactive flex shrink-0 items-center gap-3 py-3"
          aria-label={`${brandTitle} home`}
        >
          {brandLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brandLogo}
              alt={brandTitle}
              className="h-9 w-auto max-w-36 object-contain lg:h-10"
            />
          ) : (
            <span className="font-headline text-xl font-semibold tracking-[0.08em] text-foreground uppercase lg:text-2xl">
              {brandTitle}
            </span>
          )}
        </Link>

        <NavbarDesktop items={items} />

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
          <SearchDialog />
          <CartSheet />
          <div className="hidden md:flex">
            <NavbarAuth />
          </div>
          <NavbarMobile items={items} />
        </div>
      </div>
    </header>
  );
}
