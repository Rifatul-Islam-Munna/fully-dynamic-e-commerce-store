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

export async function Navbar({
  settingKey = "default",
}: {
  settingKey?: string;
}) {
  const [payload, siteBrand] = await Promise.all([
    getNavbarData(settingKey),
    getSiteBrandData(settingKey),
  ]);
  const items = normalizeNavbar(payload);

  const brandTitle = normalizeBrandValue(siteBrand?.siteTitle) ?? "ATELIER";
  const brandLogo = normalizeBrandValue(siteBrand?.logoUrl);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="storefront-panel mx-auto flex w-full max-w-[1500px] items-center justify-between rounded-[24px] px-3 py-3 sm:rounded-[28px] sm:px-5 sm:py-4 lg:px-8">
        <div className="min-w-0 flex items-center gap-3 sm:gap-6 lg:gap-12">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-2.5 transition-opacity duration-300 ease-out hover:opacity-80"
          >
            {brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element -- Admin-configured logo can come from any external domain.
              <img
                src={brandLogo}
                alt={brandTitle}
                className="h-8 w-auto max-w-24 object-contain sm:h-9 sm:max-w-32"
              />
            ) : (
              <span className="truncate font-headline text-[1.15rem] font-semibold tracking-[0.16em] text-[#111827] uppercase sm:text-[1.55rem] lg:text-[1.8rem]">
                {brandTitle}
              </span>
            )}
          </Link>
          <NavbarDesktop items={items} />
        </div>

        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 lg:gap-4">
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
