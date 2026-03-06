import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { type HeroSlideItem } from "@/components/home/hero-slider";
import {
  type HomeSection,
  type HomeSettingsResponse,
  type NavbarResponse,
  type ProductListResponse,
} from "@/components/home/section-primitives";

type NavTarget = {
  mainNavUrl?: string;
  subNavUrl?: string;
};

export type DynamicSectionsPageProps = {
  mainNavUrl?: string;
  subNavUrl?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

function buildHomeSettingsQuery(target?: NavTarget) {
  const params = new URLSearchParams();
  if (target?.mainNavUrl) {
    params.set("mainNavUrl", target.mainNavUrl);
  }
  if (target?.subNavUrl) {
    params.set("subNavUrl", target.subNavUrl);
  }
  return params.toString();
}

function buildHomeSettingsUrl(target?: NavTarget) {
  const query = buildHomeSettingsQuery(target);
  return query ? `/web-settings/home?${query}` : "/web-settings/home";
}

export async function getHomeSettings(target?: NavTarget) {
  const query = buildHomeSettingsQuery(target);
  try {
    return await GetRequestNormal<HomeSettingsResponse>(
      buildHomeSettingsUrl(target),
      0,
      `home-settings-public-${query || "root"}`,
    );
  } catch {
    return null;
  }
}

export async function getProductsForSection(
  section: HomeSection,
  sectionKey: string,
) {
  const params = new URLSearchParams({
    page: "1",
    limit: String(section.productLimit ?? 8),
  });

  if (section.productFlag) {
    params.set(section.productFlag, "true");
  }
  if (section.mainNavUrl?.trim()) {
    params.set("mainNavUrl", section.mainNavUrl.trim());
  }
  if (section.subNavUrl?.trim()) {
    params.set("subNavUrl", section.subNavUrl.trim());
  }

  try {
    const payload = await GetRequestNormal<ProductListResponse>(
      `/product/public?${params.toString()}`,
      0,
      `home-products-${sectionKey}`,
    );
    return payload.data ?? [];
  } catch {
    return [];
  }
}

export function normalizeSections(sections: HomeSection[] | undefined) {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections
    .filter((section) => section?.isActive !== false)
    .sort(
      (a, b) =>
        (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
    );
}

export function normalizePath(value?: string | null) {
  const trimmed = value?.trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? trimmed.toLowerCase() : "";
}

export function isSectionVisibleForTarget(
  section: HomeSection,
  targetMainNavUrl?: string,
  targetSubNavUrl?: string,
) {
  const targetMain = normalizePath(targetMainNavUrl);
  const targetSub = normalizePath(targetSubNavUrl);
  const sectionMain = normalizePath(section.mainNavUrl);
  const sectionSub = normalizePath(section.subNavUrl);

  if (sectionMain && sectionMain !== targetMain) {
    return false;
  }

  if (sectionSub && sectionSub !== targetSub) {
    return false;
  }

  return true;
}

export function mapHeroSlides(section: HomeSection): HeroSlideItem[] {
  return (section.slides || [])
    .filter((slide) => slide.isActive !== false)
    .sort(
      (a, b) =>
        (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
    )
    .map((slide) => ({
      title: slide.title,
      subtitle: slide.subtitle,
      imageUrl: slide.imageUrl,
      linkUrl: slide.linkUrl,
      buttonLabel: slide.buttonLabel,
    }));
}

export async function resolveNavTargetFromSlug(
  mainNavSlug: string,
  subNavSlug?: string,
) {
  const normalizedMainSlug = normalizePath(mainNavSlug);
  const normalizedSubSlug = normalizePath(subNavSlug);

  let navbarPayload: NavbarResponse | null = null;
  try {
    navbarPayload = await GetRequestNormal<NavbarResponse>(
      "/web-settings/navbar?key=default",
      0,
      "navbar-settings-public",
    );
  } catch {
    navbarPayload = null;
  }

  const mainNavList = Array.isArray(navbarPayload?.mainNav)
    ? navbarPayload.mainNav
    : [];

  const matchedMain =
    mainNavList.find((item) => normalizePath(item.url) === normalizedMainSlug) ||
    null;

  const resolvedMainNavUrl = matchedMain?.url?.trim() || `/${normalizedMainSlug}`;

  if (!subNavSlug) {
    return {
      mainNavUrl: resolvedMainNavUrl,
      subNavUrl: undefined,
      pageTitle: matchedMain?.title?.trim() || mainNavSlug,
    };
  }

  const fullSubPath = `${normalizedMainSlug}/${normalizedSubSlug}`;
  const matchedSub =
    matchedMain?.subNav?.find(
      (sub) =>
        normalizePath(sub.url) === fullSubPath ||
        normalizePath(sub.url).split("/").pop() === normalizedSubSlug,
    ) || null;

  return {
    mainNavUrl: resolvedMainNavUrl,
    subNavUrl: matchedSub?.url?.trim() || `/${fullSubPath}`,
    pageTitle: matchedSub?.title?.trim() || subNavSlug,
  };
}
