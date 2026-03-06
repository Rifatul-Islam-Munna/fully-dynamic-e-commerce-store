import type { NavbarApiResponse, NavbarItem, NavbarMainNavItem, NavbarSubNavItem } from "./navbar.types";

const FALLBACK_NAVBAR: NavbarItem[] = [{ title: "Home", url: "/", subNav: [] }];

function normalizeTitle(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function normalizeUrl(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function normalizeSubNav(items?: NavbarSubNavItem[]) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item?.isActive !== false)
    .sort((a, b) => (a?.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b?.sortOrder ?? Number.MAX_SAFE_INTEGER))
    .map((item) => {
      const title = normalizeTitle(item?.title);
      const url = normalizeUrl(item?.url);

      if (!title || !url) {
        return null;
      }

      return { title, url };
    })
    .filter((item): item is { title: string; url: string } => item !== null);
}

function normalizeMainNav(items?: NavbarMainNavItem[]) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item?.isActive !== false)
    .sort((a, b) => (a?.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b?.sortOrder ?? Number.MAX_SAFE_INTEGER))
    .map((item) => {
      const title = normalizeTitle(item?.title);
      const url = normalizeUrl(item?.url);

      if (!title || !url) {
        return null;
      }

      return {
        title,
        url,
        subNav: normalizeSubNav(item.subNav),
      };
    })
    .filter((item): item is NavbarItem => item !== null);
}

export function normalizeNavbar(payload: NavbarApiResponse | null | undefined): NavbarItem[] {
  const normalized = normalizeMainNav(payload?.mainNav);
  return normalized.length > 0 ? normalized : FALLBACK_NAVBAR;
}
