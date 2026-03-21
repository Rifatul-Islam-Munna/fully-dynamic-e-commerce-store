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
    <header className="fixed top-0 z-50 w-full bg-[#f9f9f9]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full items-center justify-between px-8 py-6">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-opacity duration-300 ease-out hover:opacity-80"
          >
            {brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element -- Admin-configured logo can come from any external domain.
              <img
                src={brandLogo}
                alt={brandTitle}
                className="h-8 w-auto max-w-28 object-contain"
              />
            ) : (
              <span className="text-2xl font-black tracking-tighter text-[#001819]">
                {brandTitle}
              </span>
            )}
          </Link>
          <NavbarDesktop items={items} />
        </div>

        {/* Right: Search + Cart + Auth + Mobile Menu */}
        <div className="flex items-center gap-6">
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
