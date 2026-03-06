import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { Button } from "@/components/ui/button";
import { HeroSlider, type HeroSlideItem } from "@/components/home/hero-slider";
import { ProductCard } from "@/components/product/product-card";

type HomeSectionType =
  | "hero_slider"
  | "product_collection"
  | "discount_banner"
  | "custom_banner";

type ProductFlag =
  | "isHotSells"
  | "isWeeklySell"
  | "isSummerSell"
  | "isWinterSell"
  | "isBestSell";

type HomeSection = {
  id?: string;
  type: HomeSectionType;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  backgroundImageUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  productFlag?: ProductFlag;
  mainNavUrl?: string;
  subNavUrl?: string;
  productLimit?: number;
  sortOrder?: number;
  isActive?: boolean;
  slides?: Array<{
    title?: string;
    subtitle?: string;
    imageUrl: string;
    linkUrl?: string;
    buttonLabel?: string;
    sortOrder?: number;
    isActive?: boolean;
  }>;
};

type HomeSettingsResponse = {
  id: string;
  key?: string;
  mainNavUrl: string | null;
  subNavUrl: string | null;
  sections: HomeSection[];
  isActive: boolean;
};

type ProductListResponse = {
  mode: string;
  data: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string;
    price: number;
    discountPrice: number | null;
    mainNavUrl?: string | null;
    subNavUrl?: string | null;
  }>;
};

type NavbarResponse = {
  mainNav?: Array<{
    title?: string;
    url?: string;
    subNav?: Array<{
      title?: string;
      url?: string;
    }>;
  }>;
};

type DynamicSectionsPageProps = {
  mainNavUrl?: string;
  subNavUrl?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

const PRODUCT_FLAG_LABELS: Record<ProductFlag, string> = {
  isHotSells: "Hot sells",
  isWeeklySell: "Weekly picks",
  isSummerSell: "Summer picks",
  isWinterSell: "Winter picks",
  isBestSell: "Best sellers",
};

function buildHomeSettingsQuery(target?: { mainNavUrl?: string; subNavUrl?: string }) {
  const params = new URLSearchParams();
  if (target?.mainNavUrl) {
    params.set("mainNavUrl", target.mainNavUrl);
  }
  if (target?.subNavUrl) {
    params.set("subNavUrl", target.subNavUrl);
  }
  return params.toString();
}

function buildHomeSettingsUrl(target?: { mainNavUrl?: string; subNavUrl?: string }) {
  const query = buildHomeSettingsQuery(target);
  return query ? `/web-settings/home?${query}` : "/web-settings/home";
}

async function getHomeSettings(target?: { mainNavUrl?: string; subNavUrl?: string }) {
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

async function getProductsForSection(section: HomeSection, sectionKey: string) {
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

function normalizeSections(sections: HomeSection[] | undefined) {
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

function normalizePath(value?: string | null) {
  const trimmed = value?.trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? trimmed.toLowerCase() : "";
}

function resolveSectionCopy(section: HomeSection) {
  return section.description?.trim() || section.subtitle?.trim() || "";
}

function isSectionVisibleForTarget(
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

export async function DynamicSectionsPage({
  mainNavUrl,
  subNavUrl,
  emptyTitle = "Page Not Configured",
  emptyDescription = "Create layout sections from Admin -> Home Settings for this page target.",
}: DynamicSectionsPageProps) {
  const home = await getHomeSettings({
    mainNavUrl,
    subNavUrl,
  });

  const sections = normalizeSections(home?.sections).filter((section) =>
    isSectionVisibleForTarget(section, mainNavUrl, subNavUrl),
  );

  const productSections = sections
    .map((section, index) => ({ section, key: section.id || `section-${index}` }))
    .filter(({ section }) => section.type === "product_collection");

  const productsBySection = new Map<string, ProductListResponse["data"]>();
  if (productSections.length > 0) {
    const results = await Promise.all(
      productSections.map(({ section, key }) => getProductsForSection(section, key)),
    );
    productSections.forEach(({ key }, index) => {
      productsBySection.set(key, results[index]);
    });
  }

  if (sections.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-muted/35 px-6 py-14 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{emptyTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      {sections.map((section, index) => {
        const sectionKey = section.id || `section-${index}`;

        if (section.type === "hero_slider") {
          const slides: HeroSlideItem[] = (section.slides || [])
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

          return <HeroSlider key={sectionKey} slides={slides} />;
        }

        if (section.type === "product_collection") {
          const products = productsBySection.get(sectionKey) || [];
          const sectionCopy = resolveSectionCopy(section);
          const sectionFlag =
            section.productFlag ? PRODUCT_FLAG_LABELS[section.productFlag] : null;

          return (
            <section key={sectionKey} className="rounded-[34px] bg-muted/30 p-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="rounded-full bg-background px-3 py-1.5">
                      Collection
                    </span>
                    {sectionFlag ? <span>{sectionFlag}</span> : null}
                    {products.length > 0 ? <span>{products.length} items</span> : null}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                    {section.title?.trim() || "Product Collection"}
                  </h2>
                  {sectionCopy ? (
                    <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                      {sectionCopy}
                    </p>
                  ) : null}
                </div>

                {section.buttonUrl?.trim() ? (
                  <Button
                    asChild
                    variant="default"
                    className="h-11 rounded-full px-5 text-sm font-semibold shadow-none"
                  >
                    <Link
                      href={section.buttonUrl}
                      className="inline-flex items-center gap-2"
                    >
                      <span>{section.buttonLabel?.trim() || "View all"}</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>

              <div className="mt-5 rounded-[28px] bg-background p-3 sm:p-4">
                {products.length === 0 ? (
                  <div className="rounded-[24px] bg-muted/25 px-4 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No products found for this section filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (section.type === "discount_banner") {
          const sectionCopy = resolveSectionCopy(section);
          const imageUrl = section.imageUrl?.trim() || "";
          const subtitleLabel = section.description?.trim() ? section.subtitle?.trim() : "";

          return (
            <section
              key={sectionKey}
              className="relative overflow-hidden rounded-[34px] bg-[#141518] text-white"
              style={{
                backgroundImage: section.backgroundImageUrl
                  ? `linear-gradient(120deg, rgba(20,21,24,.96), rgba(20,21,24,.78)), url('${section.backgroundImageUrl}')`
                  : undefined,
                backgroundSize: section.backgroundImageUrl ? "cover" : undefined,
                backgroundPosition: section.backgroundImageUrl ? "center" : undefined,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_32%)]" />

              <div className="relative z-10 grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_320px] lg:items-center">
                <div className="rounded-[30px] bg-white/[0.04] p-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                        Special offer
                      </span>
                      {subtitleLabel ? <span>{subtitleLabel}</span> : null}
                    </div>

                    <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-[2rem]">
                      {section.title?.trim() || "Special Discount"}
                    </h2>

                    {sectionCopy ? (
                      <p className="max-w-xl text-sm leading-6 text-white/74 sm:text-base">
                        {sectionCopy}
                      </p>
                    ) : null}

                  {section.buttonUrl?.trim() ? (
                    <Button
                      asChild
                      variant="default"
                      className="h-11 rounded-full px-5 text-sm font-semibold shadow-none"
                    >
                      <Link
                        href={section.buttonUrl}
                        className="inline-flex items-center gap-2"
                        >
                          <span>{section.buttonLabel?.trim() || "Shop now"}</span>
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>

                {imageUrl ? (
                  <div className="overflow-hidden rounded-[30px] bg-white/6 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={section.title || "Discount banner image"}
                      loading="lazy"
                      decoding="async"
                      className="h-56 w-full rounded-[22px] object-cover sm:h-64"
                    />
                  </div>
                ) : (
                  <div className="rounded-[30px] bg-white/6 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                      Limited drop
                    </p>
                    <p className="mt-3 text-3xl font-semibold">
                      {section.buttonLabel?.trim() || "Shop now"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      Fast checkout, cleaner navigation, and a direct route to the campaign.
                    </p>
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (section.type === "custom_banner") {
          const sectionCopy = resolveSectionCopy(section);
          const imageUrl = section.imageUrl?.trim() || "";
          const backgroundImageUrl = section.backgroundImageUrl?.trim() || "";
          const hasImage = Boolean(imageUrl);
          const subtitleLabel = section.description?.trim() ? section.subtitle?.trim() : "";

          return (
            <section
              key={sectionKey}
              className="relative overflow-hidden rounded-[40px] bg-primary/[0.06]"
            >
              {backgroundImageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={backgroundImageUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover opacity-14"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.06),transparent_32%)]" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.06),transparent_32%)]" />
              )}

              <div
                className={`relative z-10 grid gap-6 p-5 sm:p-8 lg:p-10 ${
                  hasImage ? "lg:grid-cols-[minmax(0,1.08fr)_420px] lg:items-center" : ""
                }`}
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <span className="rounded-full bg-primary/12 px-3 py-1.5 text-primary">
                      Featured section
                    </span>
                    {subtitleLabel ? <span>{subtitleLabel}</span> : null}
                  </div>
                  <div className="space-y-4">
                    <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      {section.title?.trim() || "Featured Section"}
                    </h2>
                    {sectionCopy ? (
                      <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-lg">
                        {sectionCopy}
                      </p>
                    ) : null}
                  </div>

                  {section.buttonUrl?.trim() ? (
                    <Button
                      asChild
                      variant="default"
                      className="h-12 rounded-full px-6 text-sm font-semibold shadow-none"
                    >
                      <Link
                        href={section.buttonUrl}
                        className="inline-flex items-center gap-2"
                      >
                        <span>{section.buttonLabel?.trim() || "Explore"}</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>

                {hasImage ? (
                  <div className="overflow-hidden rounded-[34px] bg-primary/[0.08] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={section.title || "Custom section image"}
                      loading="lazy"
                      decoding="async"
                      className="h-72 w-full rounded-[28px] object-cover sm:h-[420px]"
                    />
                  </div>
                ) : (
                  <div className="rounded-[34px] bg-primary/[0.08] p-8 text-base leading-8 text-muted-foreground">
                    Keep this section focused: one message, one action, and a clean route to the relevant catalog or campaign page.
                  </div>
                )}
              </div>
            </section>
          );
        }

        return null;
      })}
    </main>
  );
}
