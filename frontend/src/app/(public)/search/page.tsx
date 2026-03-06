import type { Metadata } from "next";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { normalizeNavbar } from "@/components/navbar/navbar-normalize";
import type { NavbarApiResponse } from "@/components/navbar/navbar.types";
import { SearchPageShell } from "@/components/search/search-page-shell";

export const metadata: Metadata = {
  title: "Search Catalog",
  description:
    "Search the storefront and refine products by navigation, pricing, and campaign collections.",
};

async function getNavbarItems() {
  try {
    const payload = await GetRequestNormal<NavbarApiResponse>(
      "/web-settings/navbar?key=default",
      60,
      "web-settings-navbar-search",
    );
    return normalizeNavbar(payload);
  } catch {
    return normalizeNavbar(null);
  }
}

export default async function SearchPage() {
  const navbarItems = await getNavbarItems();

  return <SearchPageShell navbarItems={navbarItems} />;
}
