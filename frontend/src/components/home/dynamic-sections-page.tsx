import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  GalleryVerticalEnd,
  PanelsTopLeft,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { HeroSlider, type HeroSlideItem } from "@/components/home/hero-slider";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { normalizeHomeSectionVariant } from "@/lib/home-section-variants";
import { cn } from "@/lib/utils";

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
  variant?: string;
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

function buildHomeSettingsQuery(target?: {
  mainNavUrl?: string;
  subNavUrl?: string;
}) {
  const params = new URLSearchParams();
  if (target?.mainNavUrl) {
    params.set("mainNavUrl", target.mainNavUrl);
  }
  if (target?.subNavUrl) {
    params.set("subNavUrl", target.subNavUrl);
  }
  return params.toString();
}

function buildHomeSettingsUrl(target?: {
  mainNavUrl?: string;
  subNavUrl?: string;
}) {
  const query = buildHomeSettingsQuery(target);
  return query ? `/web-settings/home?${query}` : "/web-settings/home";
}

async function getHomeSettings(target?: {
  mainNavUrl?: string;
  subNavUrl?: string;
}) {
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

function SectionEyebrow({
  label,
  secondary,
  inverse = false,
}: {
  label: string;
  secondary?: string | null;
  inverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]",
        inverse ? "text-white/70" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "rounded-full px-3 py-1.5",
          inverse ? "bg-white/12 text-white" : "bg-background text-foreground",
        )}
      >
        {label}
      </span>
      {secondary ? <span>{secondary}</span> : null}
    </div>
  );
}

function SectionHeading({
  title,
  copy,
  inverse = false,
  compact = false,
}: {
  title: string;
  copy?: string;
  inverse?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="space-y-2">
      <h2
        className={cn(
          "font-semibold tracking-tight",
          compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-[2rem]",
          inverse ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {copy ? (
        <p
          className={cn(
            compact ? "text-sm leading-6" : "text-sm leading-7 sm:text-base",
            inverse ? "text-white/76" : "text-muted-foreground",
          )}
        >
          {copy}
        </p>
      ) : null}
    </div>
  );
}

function SectionCta({
  href,
  label,
  inverse = false,
}: {
  href?: string;
  label?: string;
  inverse?: boolean;
}) {
  if (!href?.trim()) {
    return null;
  }

  return (
    <Button
      asChild
      variant={inverse ? "secondary" : "default"}
      className={cn(
        "h-11 rounded-full px-5 text-sm font-semibold shadow-none",
        inverse ? "bg-white text-foreground hover:bg-white/92" : "",
      )}
    >
      <Link href={href} className="inline-flex items-center gap-2">
        <span>{label?.trim() || "Explore"}</span>
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}

function SectionTagRow({
  items,
  inverse = false,
  className,
}: {
  items: Array<string | null | undefined>;
  inverse?: boolean;
  className?: string;
}) {
  const filtered = items
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));

  if (filtered.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filtered.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={cn(
            "rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.02em]",
            inverse
              ? "border border-white/12 bg-white/8 text-white/80"
              : "border border-border/70 bg-background/82 text-muted-foreground",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function DetailTile({
  icon: Icon,
  title,
  text,
  inverse = false,
  className,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-3 sm:rounded-[24px] sm:px-4 sm:py-4",
        inverse
          ? "border-white/12 bg-white/8 text-white"
          : "border-border/70 bg-background/82 text-foreground",
        className,
      )}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-8 items-center justify-center rounded-xl sm:size-9 sm:rounded-2xl",
            inverse ? "bg-white/12 text-white" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-3.5 sm:size-4" />
        </div>
        <div className="space-y-1">
          <p
            className={cn(
              "text-[13px] font-semibold sm:text-sm",
              inverse ? "text-white" : "text-foreground",
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "text-xs leading-5 sm:text-sm sm:leading-6",
              inverse ? "text-white/72" : "text-muted-foreground",
            )}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProductGrid({
  products,
  className,
}: {
  products: ProductListResponse["data"];
  className?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl bg-muted/25 px-4 py-8 text-center sm:rounded-[24px] sm:py-10">
        <p className="text-sm text-muted-foreground">
          No products found for this section.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function MediaFrame({
  src,
  alt,
  className,
  frameClassName,
}: {
  src?: string;
  alt: string;
  className?: string;
  frameClassName?: string;
}) {
  if (!src?.trim()) {
    return null;
  }

  return (
    <div className={cn("overflow-hidden rounded-[28px]", frameClassName)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-cover", className)}
      />
    </div>
  );
}

function SupportPanel({
  label = "Featured section",
  title,
  text,
}: {
  label?: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[26px] bg-background px-5 py-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold text-foreground">{title}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function renderProductCollectionSection(
  section: HomeSection,
  products: ProductListResponse["data"],
  sectionKey: string,
) {
  const variant = normalizeHomeSectionVariant(
    "product_collection",
    section.variant,
  );
  const title = section.title?.trim() || "Product Collection";
  const sectionCopy = resolveSectionCopy(section);
  const introCopy =
    sectionCopy ||
    "Browse the products below or use the main button to open the full collection.";
  const guidanceText =
    products.length > 0
      ? "Open any product card to see details, price, and add-to-cart options."
      : "Use the main button to open the full collection.";
  const sectionFlag = section.productFlag
    ? PRODUCT_FLAG_LABELS[section.productFlag]
    : null;
  const itemText = products.length > 0 ? `${products.length} items` : null;
  const metaText = [sectionFlag, itemText].filter(Boolean).join(" - ");
  const ctaLabel = section.buttonLabel || "View all products";
  const cta = <SectionCta href={section.buttonUrl} label={ctaLabel} />;

  if (variant === "minimal_shelf") {
    return (
      <section key={sectionKey} className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <SectionEyebrow label="Collection" secondary={metaText} />
            <SectionHeading title={title} copy={introCopy} compact />
            <p className="text-sm leading-6 text-muted-foreground">
              {guidanceText}
            </p>
          </div>
          {cta}
        </div>
        <ProductGrid products={products} className="gap-4" />
      </section>
    );
  }

  if (variant === "compact_grid") {
    return (
      <section
        key={sectionKey}
        className="rounded-2xl border border-border/70 bg-background p-3 shadow-[0_22px_60px_-50px_rgba(15,23,42,0.22)] sm:rounded-[32px] sm:p-6"
      >
        <div className="flex flex-col gap-4 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <SectionEyebrow label="Quick browse" secondary={metaText} />
            <SectionHeading title={title} copy={introCopy} compact />
          </div>
          {cta}
        </div>
        <SectionTagRow
          items={["Quick compare", sectionFlag, itemText]}
          className="mt-4"
        />
        <div className="mt-5 rounded-[24px] bg-muted/18 p-3 sm:p-4">
          <p className="mb-4 text-sm leading-6 text-muted-foreground">
            {guidanceText}
          </p>
          <ProductGrid
            products={products}
            className="gap-3 lg:grid-cols-4 xl:grid-cols-5"
          />
        </div>
      </section>
    );
  }

  if (variant === "editorial_band") {
    return (
      <section
        key={sectionKey}
        className="rounded-2xl border border-border/70 bg-background p-3 shadow-[0_22px_60px_-50px_rgba(15,23,42,0.18)] sm:rounded-[32px] sm:p-6"
      >
        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <aside className="rounded-[26px] bg-muted/20 px-5 py-6 sm:px-6">
            <SectionEyebrow label="Guided browse" secondary={metaText} />
            <div className="mt-4 space-y-4">
              <SectionHeading title={title} copy={introCopy} />
              <SectionTagRow items={[sectionFlag, itemText]} />
              <p className="text-sm leading-6 text-muted-foreground">
                {guidanceText}
              </p>
              {cta}
            </div>
          </aside>
          <div className="rounded-[26px] border border-border/70 bg-background p-3 sm:p-4">
            <ProductGrid products={products} className="gap-4" />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "side_panel") {
    return (
      <section
        key={sectionKey}
        className="rounded-2xl border border-border/70 bg-background p-3 shadow-[0_22px_60px_-50px_rgba(15,23,42,0.18)] sm:rounded-[32px] sm:p-6"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="order-2 rounded-[26px] bg-muted/18 p-3 sm:p-4 lg:order-1">
            <div className="mb-4 flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionTagRow items={[sectionFlag, itemText]} />
              <span className="text-xs font-medium text-muted-foreground">
                Browse products
              </span>
            </div>
            <ProductGrid products={products} className="gap-4" />
          </div>
          <aside className="order-1 rounded-[26px] border border-border/70 bg-muted/10 px-5 py-6 lg:order-2">
            <div className="space-y-5">
              <SectionEyebrow label="Browse guide" secondary={metaText} />
              <SectionHeading title={title} copy={introCopy} compact />
              <p className="text-sm leading-6 text-muted-foreground">
                {guidanceText}
              </p>
              {cta}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  if (variant === "spotlight_board") {
    return (
      <section
        key={sectionKey}
        className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_24px_70px_-54px_rgba(15,23,42,0.2)]"
      >
        <div className="border-b border-border/70 bg-muted/18 px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <SectionEyebrow
                label="Featured collection"
                secondary={metaText}
              />
              <SectionHeading title={title} copy={introCopy} />
            </div>
            {cta}
          </div>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SectionTagRow items={["Featured layout", sectionFlag, itemText]} />
            <p className="text-sm leading-6 text-muted-foreground">
              {guidanceText}
            </p>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <ProductGrid products={products} className="gap-4" />
        </div>
      </section>
    );
  }

  /* ── banner_top ── */
  if (variant === "banner_top") {
    return (
      <section key={sectionKey}>
        <div className="rounded-2xl bg-primary px-4 py-5 text-primary-foreground sm:rounded-t-[32px] sm:rounded-b-none sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <SectionEyebrow label="Collection" secondary={metaText} inverse />
              <SectionHeading title={title} copy={introCopy} inverse compact />
            </div>
            <SectionCta href={section.buttonUrl} label={ctaLabel} inverse />
          </div>
        </div>
        <div className="rounded-b-2xl border border-t-0 border-border/70 bg-background p-3 sm:rounded-b-[32px] sm:p-5">
          <ProductGrid products={products} className="gap-3" />
        </div>
      </section>
    );
  }

  /* ── floating_header ── */
  if (variant === "floating_header") {
    return (
      <section key={sectionKey} className="relative pt-8 sm:pt-10">
        <div className="absolute inset-x-4 top-0 z-10 mx-auto max-w-lg rounded-2xl border border-border/60 bg-background px-4 py-4 shadow-lg sm:rounded-[24px] sm:px-6 sm:py-5">
          <SectionHeading title={title} copy={introCopy} compact />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SectionTagRow items={[sectionFlag, itemText]} />
            {cta}
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-muted/15 px-3 pb-3 pt-20 sm:rounded-[32px] sm:px-5 sm:pb-5 sm:pt-24">
          <ProductGrid products={products} className="gap-3" />
        </div>
      </section>
    );
  }

  /* ── split_intro ── */
  if (variant === "split_intro") {
    return (
      <section key={sectionKey} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 sm:rounded-[24px] sm:px-5 sm:py-5">
            <SectionEyebrow label="Collection" secondary={metaText} />
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h2>
          </div>
          <div className="flex items-center rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 sm:rounded-[24px] sm:px-5 sm:py-5">
            <div className="space-y-3">
              {introCopy ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {introCopy}
                </p>
              ) : null}
              {cta}
            </div>
          </div>
        </div>
        <ProductGrid products={products} className="gap-3" />
      </section>
    );
  }

  /* ── tab_shelf ── */
  if (variant === "tab_shelf") {
    return (
      <section key={sectionKey} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <SectionHeading title={title} compact />
            <div className="flex flex-wrap gap-1.5">
              {[sectionFlag, itemText].filter(Boolean).map((tag, i) => (
                <span
                  key={i}
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {cta}
        </div>
        <div className="rounded-2xl border border-border/70 bg-background p-3 sm:rounded-[28px] sm:p-4">
          <ProductGrid products={products} className="gap-3" />
        </div>
      </section>
    );
  }

  /* ── numbered_list ── */
  if (variant === "numbered_list") {
    return (
      <section
        key={sectionKey}
        className="rounded-2xl border border-border/70 bg-background p-3 sm:rounded-[32px] sm:p-5"
      >
        <div className="flex items-start gap-3 border-b border-border/70 pb-4 sm:gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary sm:size-14">
            {products.length}
          </div>
          <div className="min-w-0 flex-1">
            <SectionHeading title={title} copy={introCopy} compact />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SectionTagRow items={[sectionFlag]} />
              {cta}
            </div>
          </div>
        </div>
        <div className="pt-4">
          <ProductGrid products={products} className="gap-3" />
        </div>
      </section>
    );
  }

  return (
    <section
      key={sectionKey}
      className="rounded-2xl bg-muted/20 p-3 sm:rounded-[34px] sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <SectionEyebrow label="Collection" secondary={metaText} />
          <SectionHeading title={title} copy={sectionCopy} />
        </div>
        {cta}
      </div>
      <div className="mt-5 rounded-[28px] bg-background p-3 sm:p-4">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

function renderDiscountBannerSection(section: HomeSection, sectionKey: string) {
  const variant = normalizeHomeSectionVariant(
    "discount_banner",
    section.variant,
  );
  const title = section.title?.trim() || "Special Discount";
  const sectionCopy = resolveSectionCopy(section);
  const imageUrl = section.imageUrl?.trim() || "";
  const backgroundImageUrl = section.backgroundImageUrl?.trim() || "";
  const subtitle = section.subtitle?.trim();
  const ctaLabel = section.buttonLabel || "Shop now";

  if (variant === "strip") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(120deg,#0f172a,#1e293b_52%,#2563eb)] text-white"
      >
        <div className="absolute -right-8 top-0 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-20 w-20 rounded-full bg-sky-400/18 blur-3xl" />
        <div className="relative grid gap-4 px-5 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <SectionEyebrow label="Offer" secondary={subtitle} inverse />
            <SectionHeading title={title} copy={sectionCopy} inverse compact />
            <SectionTagRow
              items={[
                imageUrl ? "Visual included" : null,
                section.buttonUrl?.trim() ? "CTA ready" : null,
              ]}
              inverse
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {imageUrl ? (
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="h-20 w-24 rounded-[18px]"
                frameClassName="rounded-[22px] border border-white/12 bg-white/8 p-1.5"
              />
            ) : null}
            <SectionCta href={section.buttonUrl} label={ctaLabel} inverse />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "poster") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-[40px] border border-border/70 bg-[#0f172a] px-5 py-12 text-white sm:px-8"
        style={{
          backgroundImage: backgroundImageUrl
            ? `url('${backgroundImageUrl}')`
            : undefined,
          backgroundSize: backgroundImageUrl ? "cover" : undefined,
          backgroundPosition: backgroundImageUrl ? "center" : undefined,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(30,41,59,0.72),rgba(79,70,229,0.58))]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="rounded-[32px] border border-white/12 bg-white/10 px-6 py-8 text-center backdrop-blur-md">
            <SectionEyebrow
              label="Campaign poster"
              secondary={subtitle}
              inverse
            />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} inverse />
              <SectionTagRow
                items={[
                  "Centered message",
                  imageUrl ? "Visual accent" : null,
                  section.buttonUrl?.trim() ? "CTA visible" : null,
                ]}
                inverse
                className="justify-center"
              />
              <div className="flex justify-center">
                <SectionCta href={section.buttonUrl} label={ctaLabel} inverse />
              </div>
            </div>
          </div>
          {imageUrl ? (
            <div className="mt-6 flex justify-center">
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="h-56 w-full max-w-2xl rounded-[28px] object-cover"
                frameClassName="rounded-[32px] border border-white/12 bg-white/8 p-3"
              />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (variant === "split_offer") {
    return (
      <section
        key={sectionKey}
        className="rounded-2xl border border-border/70 bg-background p-3 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.3)] sm:rounded-[38px] sm:p-6"
      >
        <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr] lg:items-stretch">
          <div className="rounded-[32px] bg-[linear-gradient(135deg,rgba(79,70,229,0.08),rgba(15,23,42,0.04),rgba(255,255,255,1))] px-5 py-6 sm:px-6">
            <SectionEyebrow label="Offer" secondary={subtitle} />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} />
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailTile
                  icon={BadgePercent}
                  title="Special offer"
                  text="Take advantage of this limited-time deal before it ends."
                  className="bg-background/80"
                />
                <DetailTile
                  icon={PanelsTopLeft}
                  title="Easy savings"
                  text="Browse the selection and save on your favorite products."
                  className="bg-background/80"
                />
              </div>
              <SectionCta href={section.buttonUrl} label={ctaLabel} />
            </div>
          </div>
          {imageUrl ? (
            <MediaFrame
              src={imageUrl}
              alt={title}
              className="h-72 rounded-[28px] sm:h-full"
              frameClassName="rounded-[32px] border border-border/70 bg-muted/24 p-3"
            />
          ) : (
            <SupportPanel
              label="Offer support"
              title={ctaLabel}
              text="Use this layout when the campaign message should feel explicit and the visual should stay structured."
            />
          )}
        </div>
      </section>
    );
  }

  if (variant === "inset_card") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-[40px] border border-border/70 bg-[#0f172a] text-white"
        style={{
          backgroundImage: backgroundImageUrl
            ? `url('${backgroundImageUrl}')`
            : undefined,
          backgroundSize: backgroundImageUrl ? "cover" : undefined,
          backgroundPosition: backgroundImageUrl ? "center" : undefined,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(15,23,42,0.52),rgba(79,70,229,0.3))]" />
        <div className="relative z-10 grid gap-4 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="max-w-xl rounded-[32px] border border-white/12 bg-white/10 p-2 backdrop-blur-md">
            <div className="rounded-[28px] bg-black/32 px-5 py-6">
              <SectionEyebrow label="Offer" secondary={subtitle} inverse />
              <div className="mt-5 space-y-5">
                <SectionHeading title={title} copy={sectionCopy} inverse />
                <SectionTagRow
                  items={["Floating card", imageUrl ? "Visual paired" : null]}
                  inverse
                />
                <SectionCta href={section.buttonUrl} label={ctaLabel} inverse />
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            {imageUrl ? (
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="h-56 rounded-[28px] object-cover"
                frameClassName="rounded-[30px] border border-white/12 bg-white/8 p-3"
              />
            ) : null}
            <DetailTile
              icon={Sparkles}
              title="Exclusive deal"
              text="Premium savings on select products — limited availability."
              inverse
            />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "image_edge") {
    return (
      <section
        key={sectionKey}
        className="overflow-hidden rounded-[38px] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(238,242,255,0.9))]"
      >
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="px-5 py-6 sm:px-7 sm:py-8">
            <SectionEyebrow label="Offer" secondary={subtitle} />
            <div className="mt-5 max-w-2xl space-y-5">
              <SectionHeading title={title} copy={sectionCopy} />
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailTile
                  icon={BadgePercent}
                  title="Limited time"
                  text="Don't miss out — grab these savings while they last."
                  className="bg-background/80"
                />
                <DetailTile
                  icon={GalleryVerticalEnd}
                  title="Curated picks"
                  text="Handpicked products at special prices just for you."
                  className="bg-background/80"
                />
              </div>
              <SectionCta href={section.buttonUrl} label={ctaLabel} />
            </div>
          </div>
          <div className="relative min-h-[260px] bg-[#e2e8f0] p-4 sm:p-5">
            {imageUrl ? (
              <>
                <MediaFrame
                  src={imageUrl}
                  alt={title}
                  className="h-full min-h-[220px] rounded-[28px] object-cover"
                  frameClassName="h-full rounded-[32px] bg-background p-3 shadow-[0_28px_80px_-58px_rgba(15,23,42,0.28)]"
                />
                <div className="absolute left-8 top-8 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm">
                  Visual edge
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <SupportPanel
                  label="Offer support"
                  title="Visual edge"
                  text="Use this option when the image should support the message without taking over the banner."
                />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  /* ── ribbon_banner ── */
  if (variant === "ribbon_banner") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-2xl bg-primary sm:rounded-[32px]"
      >
        <div className="absolute -right-10 -top-10 size-40 rotate-12 rounded-[40px] bg-white/10 sm:size-60" />
        <div className="relative z-10 flex flex-col gap-4 p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-1.5">
            <SectionEyebrow
              label="Sale"
              secondary={section.subtitle?.trim()}
              inverse
            />
            <SectionHeading title={title} copy={sectionCopy} inverse compact />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {imageUrl ? (
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="size-16 rounded-xl sm:size-20 sm:rounded-2xl"
                frameClassName="rounded-xl sm:rounded-2xl"
              />
            ) : null}
            <SectionCta href={section.buttonUrl} label={ctaLabel} inverse />
          </div>
        </div>
      </section>
    );
  }

  /* ── glassmorphic ── */
  if (variant === "glassmorphic") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-2xl bg-cover bg-center sm:rounded-[34px]"
        style={{
          backgroundImage: backgroundImageUrl
            ? `url('${backgroundImageUrl}')`
            : `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))`,
        }}
      >
        <div className="flex min-h-48 items-center justify-center p-4 sm:min-h-64 sm:p-6">
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/15 px-5 py-5 text-center text-white backdrop-blur-xl sm:rounded-[28px] sm:px-8 sm:py-8">
            {section.subtitle?.trim() ? (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/75">
                {section.subtitle}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                {title}
              </h2>
            ) : null}
            {sectionCopy ? (
              <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
                {sectionCopy}
              </p>
            ) : null}
            <div className="mt-4">
              <SectionCta href={section.buttonUrl} label={ctaLabel} inverse />
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── countdown_style ── */
  if (variant === "countdown_style") {
    return (
      <section
        key={sectionKey}
        className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:rounded-[32px] sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            {section.subtitle?.trim() ? (
              <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {section.subtitle}
              </span>
            ) : null}
            {title ? (
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                {title}
              </h2>
            ) : null}
            {sectionCopy ? (
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {sectionCopy}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {imageUrl ? (
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="h-24 w-32 rounded-xl object-cover sm:h-28 sm:w-36"
                frameClassName="rounded-xl"
              />
            ) : null}
            <SectionCta href={section.buttonUrl} label={ctaLabel} />
          </div>
        </div>
      </section>
    );
  }

  /* ── minimal_bar ── */
  if (variant === "minimal_bar") {
    return (
      <section
        key={sectionKey}
        className="rounded-full border border-border/70 bg-background px-4 py-2.5 shadow-sm sm:px-6 sm:py-3"
      >
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
          {section.subtitle?.trim() ? (
            <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
              {section.subtitle}
            </span>
          ) : null}
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground sm:text-base">
            {title}
          </p>
          <SectionCta href={section.buttonUrl} label={ctaLabel} />
        </div>
      </section>
    );
  }

  /* ── hero_discount ── */
  if (variant === "hero_discount") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-2xl sm:rounded-[36px]"
        style={{
          backgroundImage: backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${backgroundImageUrl}')`
            : `linear-gradient(135deg, #15171b 0%, #2d3748 100%)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex min-h-52 flex-col items-center justify-center p-4 text-center text-white sm:min-h-72 sm:p-8">
          {section.subtitle?.trim() ? (
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
              {section.subtitle}
            </p>
          ) : null}
          {title ? (
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h2>
          ) : null}
          {sectionCopy ? (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              {sectionCopy}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <SectionCta href={section.buttonUrl} label={ctaLabel} inverse />
            {imageUrl ? (
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="h-16 w-24 rounded-xl object-cover sm:h-20 sm:w-28"
                frameClassName="rounded-xl"
              />
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      key={sectionKey}
      className="relative overflow-hidden rounded-[34px] bg-[#15171b] text-white"
      style={{
        backgroundImage: backgroundImageUrl
          ? `linear-gradient(120deg, rgba(21,23,27,.92), rgba(21,23,27,.78)), url('${backgroundImageUrl}')`
          : undefined,
        backgroundSize: backgroundImageUrl ? "cover" : undefined,
        backgroundPosition: backgroundImageUrl ? "center" : undefined,
      }}
    >
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px] lg:items-center">
        <div className="space-y-4">
          <SectionEyebrow
            label="Offer"
            secondary={section.subtitle?.trim()}
            inverse
          />
          <SectionHeading title={title} copy={sectionCopy} inverse />
          <SectionCta href={section.buttonUrl} label={ctaLabel} inverse />
        </div>
        {imageUrl ? (
          <MediaFrame
            src={imageUrl}
            alt={title}
            className="h-56 rounded-[22px] sm:h-64"
            frameClassName="rounded-[28px] bg-white/6 p-2"
          />
        ) : null}
      </div>
    </section>
  );
}

function renderCustomBannerSection(section: HomeSection, sectionKey: string) {
  const variant = normalizeHomeSectionVariant("custom_banner", section.variant);
  const title = section.title?.trim() || "Featured Section";
  const sectionCopy = resolveSectionCopy(section);
  const imageUrl = section.imageUrl?.trim() || "";
  const backgroundImageUrl = section.backgroundImageUrl?.trim() || "";
  const hasImage = Boolean(imageUrl);
  const subtitle = section.subtitle?.trim();
  const ctaLabel = section.buttonLabel || "Explore";

  if (variant === "campaign_strip") {
    return (
      <section
        key={sectionKey}
        className="rounded-[32px] border border-border/70 bg-[linear-gradient(120deg,rgba(79,70,229,0.08),rgba(255,255,255,1),rgba(15,23,42,0.03))] px-5 py-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <SectionEyebrow label="Featured section" secondary={subtitle} />
            <SectionHeading title={title} copy={sectionCopy} compact />
            <SectionTagRow
              items={[
                hasImage ? "Visual support" : null,
                section.buttonUrl?.trim() ? "Action ready" : null,
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {hasImage ? (
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="h-20 w-24 rounded-[18px]"
                frameClassName="rounded-[22px] border border-border/70 bg-background/88 p-1.5"
              />
            ) : null}
            <SectionCta href={section.buttonUrl} label={ctaLabel} />
          </div>
        </div>
      </section>
    );
  }

  if (variant === "statement_center") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-[42px] border border-border/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.06),rgba(79,70,229,0.12),rgba(255,255,255,0.95))] px-5 py-12 sm:px-8"
        style={{
          backgroundImage: backgroundImageUrl
            ? `url('${backgroundImageUrl}')`
            : undefined,
          backgroundSize: backgroundImageUrl ? "cover" : undefined,
          backgroundPosition: backgroundImageUrl ? "center" : undefined,
        }}
      >
        <div className="absolute inset-0 bg-background/72" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="rounded-[34px] bg-background/88 px-6 py-8 text-center shadow-[0_30px_90px_-65px_rgba(15,23,42,0.24)] backdrop-blur-md">
            <SectionEyebrow label="Featured section" secondary={subtitle} />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} />
              <SectionTagRow
                items={[
                  "Centered statement",
                  hasImage ? "Visual support" : null,
                ]}
                className="justify-center"
              />
              <div className="flex justify-center">
                <SectionCta href={section.buttonUrl} label={ctaLabel} />
              </div>
            </div>
          </div>
          {hasImage ? (
            <div className="mt-6 flex justify-center">
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="h-56 w-full max-w-2xl rounded-[28px] object-cover"
                frameClassName="rounded-[32px] border border-border/70 bg-background/88 p-3"
              />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (variant === "media_left") {
    return (
      <section
        key={sectionKey}
        className="rounded-[40px] border border-border/70 bg-background p-5 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.22)] sm:p-7"
      >
        <div className="grid gap-5 lg:grid-cols-[460px_minmax(0,1fr)] lg:items-center">
          {hasImage ? (
            <div className="relative">
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="h-80 rounded-[30px] sm:h-[430px]"
                frameClassName="rounded-[34px] bg-muted/20 p-3"
              />
              <div className="absolute left-6 top-6 rounded-full bg-background/92 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm">
                Media first
              </div>
            </div>
          ) : (
            <SupportPanel
              title="Visual-first layout"
              text="Use this option when the image should lead and the text should stay concise."
            />
          )}
          <div className="rounded-[32px] bg-[linear-gradient(135deg,rgba(79,70,229,0.08),rgba(15,23,42,0.03),rgba(255,255,255,1))] px-5 py-6 sm:px-6">
            <SectionEyebrow label="Featured section" secondary={subtitle} />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} />
              <DetailTile
                icon={GalleryVerticalEnd}
                title="Featured highlight"
                text="Explore this curated selection of our finest products and deals."
                className="bg-background/82"
              />
              <SectionCta href={section.buttonUrl} label={ctaLabel} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "feature_panel") {
    return (
      <section
        key={sectionKey}
        className="rounded-[40px] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.92),rgba(255,255,255,1))] p-5 sm:p-7"
      >
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="rounded-[32px] bg-background px-5 py-6 shadow-[0_28px_80px_-60px_rgba(15,23,42,0.22)] sm:px-6">
            <SectionEyebrow label="Featured section" secondary={subtitle} />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} />
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailTile
                  icon={PanelsTopLeft}
                  title="Quality guaranteed"
                  text="Every item is carefully selected and quality-checked for you."
                  className="bg-muted/18"
                />
                <DetailTile
                  icon={Sparkles}
                  title="Trusted selection"
                  text="Shop with confidence from our curated catalog of top-rated products."
                  className="bg-muted/18"
                />
              </div>
              <SectionCta href={section.buttonUrl} label={ctaLabel} />
            </div>
          </div>
          {hasImage ? (
            <MediaFrame
              src={imageUrl}
              alt={title}
              className="h-80 rounded-[28px] sm:h-[420px]"
              frameClassName="rounded-[34px] bg-background p-3 shadow-[0_28px_80px_-60px_rgba(15,23,42,0.24)]"
            />
          ) : (
            <SupportPanel
              title="Summary panel"
              text="This layout works well for service messaging, category highlights, and conversion support."
            />
          )}
        </div>
      </section>
    );
  }

  if (variant === "dual_panel") {
    return (
      <section
        key={sectionKey}
        className="rounded-[40px] border border-border/70 bg-muted/20 p-5 sm:p-7"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[32px] bg-background px-5 py-6 shadow-[0_26px_80px_-60px_rgba(15,23,42,0.22)] sm:px-6">
            <SectionEyebrow label="Featured section" secondary={subtitle} />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} />
              <SectionTagRow
                items={["Dual panel", hasImage ? "Visual support" : null]}
              />
              <SectionCta href={section.buttonUrl} label={ctaLabel} />
            </div>
          </div>
          <div className="rounded-[32px] bg-background px-4 py-4 shadow-[0_26px_80px_-60px_rgba(15,23,42,0.22)]">
            {hasImage ? (
              <div className="space-y-4">
                <MediaFrame
                  src={imageUrl}
                  alt={title}
                  className="h-80 rounded-[26px] sm:h-[380px]"
                />
                <DetailTile
                  icon={GalleryVerticalEnd}
                  title="What our customers say"
                  text="Thousands of happy customers trust us for quality and value."
                  className="bg-muted/18"
                />
              </div>
            ) : (
              <SupportPanel
                title="Secondary panel"
                text="Use the second panel for supporting visuals or a secondary message without adding clutter."
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "framed_media") {
    return (
      <section
        key={sectionKey}
        className="rounded-[42px] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.9),rgba(255,255,255,1))] p-5 sm:p-7"
      >
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          {hasImage ? (
            <MediaFrame
              src={imageUrl}
              alt={title}
              className="h-84 rounded-[30px] sm:h-[460px]"
              frameClassName="rounded-[36px] border border-border/70 bg-background p-4 shadow-[0_32px_90px_-62px_rgba(15,23,42,0.26)]"
            />
          ) : (
            <SupportPanel
              title="Framed visual"
              text="This option works best when you have a single image that deserves more space and simpler supporting copy."
            />
          )}
          <div className="rounded-[32px] bg-[#111827] px-6 py-6 text-white shadow-[0_32px_90px_-62px_rgba(15,23,42,0.5)]">
            <SectionEyebrow
              label="Featured section"
              secondary={subtitle}
              inverse
            />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} inverse />
              <DetailTile
                icon={PanelsTopLeft}
                title="Premium collection"
                text="Discover our most sought-after items, expertly curated for you."
                inverse
              />
              <SectionCta href={section.buttonUrl} label={ctaLabel} inverse />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "asymmetric") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-[42px] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(238,242,255,0.9),rgba(248,250,252,1))] p-5 sm:p-8"
      >
        <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <div className="space-y-5 rounded-[32px] bg-background px-5 py-6 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.24)] sm:px-6 lg:-mb-6">
            <SectionEyebrow label="Featured section" secondary={subtitle} />
            <SectionHeading title={title} copy={sectionCopy} />
            <DetailTile
              icon={Sparkles}
              title="Trending now"
              text="Explore what's popular — fresh picks and bestsellers updated regularly."
              className="bg-muted/18"
            />
            <SectionCta href={section.buttonUrl} label={ctaLabel} />
          </div>
          {hasImage ? (
            <div className="relative lg:ml-8">
              <MediaFrame
                src={imageUrl}
                alt={title}
                className="h-84 rounded-[30px] sm:h-[440px]"
                frameClassName="rounded-[34px] bg-background p-3 shadow-[0_32px_90px_-65px_rgba(15,23,42,0.26)]"
              />
              <div className="absolute bottom-6 left-6 rounded-[22px] bg-background/92 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Offset visual
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Stronger visual movement without losing clarity.
                </p>
              </div>
            </div>
          ) : (
            <SupportPanel
              title="Offset visual"
              text="The offset composition adds variation while still keeping the section restrained and easy to scan."
            />
          )}
        </div>
      </section>
    );
  }

  if (variant === "soft_poster") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-[44px] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(255,255,255,1),rgba(254,249,195,0.24))] px-5 py-12 sm:px-8"
        style={{
          backgroundImage: backgroundImageUrl
            ? `url('${backgroundImageUrl}')`
            : undefined,
          backgroundSize: backgroundImageUrl ? "cover" : undefined,
          backgroundPosition: backgroundImageUrl ? "center" : undefined,
        }}
      >
        <div className="absolute inset-0 bg-background/76" />
        <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center">
          <div className="rounded-[34px] bg-background/88 px-6 py-8 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.22)] backdrop-blur-md">
            <SectionEyebrow label="Featured section" secondary={subtitle} />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} />
              <SectionTagRow
                items={["Soft campaign", hasImage ? "Hero visual" : null]}
                className="justify-center"
              />
              <div className="flex justify-center">
                <SectionCta href={section.buttonUrl} label={ctaLabel} />
              </div>
            </div>
          </div>
          {hasImage ? (
            <MediaFrame
              src={imageUrl}
              alt={title}
              className="mx-auto h-72 max-w-2xl rounded-[30px] sm:h-[420px]"
              frameClassName="rounded-[34px] border border-border/70 bg-background/90 p-3"
            />
          ) : null}
        </div>
      </section>
    );
  }

  if (variant === "split_story") {
    return (
      <section
        key={sectionKey}
        className="rounded-[40px] border border-border/70 bg-background p-5 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.22)] sm:p-7"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_430px] lg:items-center">
          <div className="space-y-5 border-l-4 border-primary/18 pl-5 sm:pl-6">
            <SectionEyebrow label="Featured section" secondary={subtitle} />
            <SectionHeading title={title} copy={sectionCopy} />
            <SectionTagRow
              items={["Split story", hasImage ? "Media balance" : null]}
            />
            <SectionCta href={section.buttonUrl} label={ctaLabel} />
          </div>
          {hasImage ? (
            <MediaFrame
              src={imageUrl}
              alt={title}
              className="h-80 rounded-[28px] sm:h-[420px]"
              frameClassName="rounded-[34px] bg-muted/18 p-3"
            />
          ) : (
            <SupportPanel
              title="Split layout"
              text="Use this for a clean feature section where the copy and media should feel balanced."
            />
          )}
        </div>
      </section>
    );
  }

  /* ── info_strip ── */
  if (variant === "info_strip") {
    return (
      <section
        key={sectionKey}
        className="rounded-2xl border border-border/70 bg-background p-3 sm:rounded-[28px] sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {hasImage ? (
            <MediaFrame
              src={imageUrl}
              alt={title}
              className="h-16 w-24 shrink-0 rounded-xl object-cover sm:h-20 sm:w-28"
              frameClassName="rounded-xl shrink-0"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
              <Sparkles className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            {subtitle ? (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
            <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {title}
            </h2>
            {sectionCopy ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {sectionCopy}
              </p>
            ) : null}
          </div>
          <SectionCta href={section.buttonUrl} label={ctaLabel} />
        </div>
      </section>
    );
  }

  return (
    <section
      key={sectionKey}
      className="rounded-2xl bg-primary/5 p-3 sm:rounded-[38px] sm:p-8"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-5">
          <SectionEyebrow label="Featured section" secondary={subtitle} />
          <SectionHeading title={title} copy={sectionCopy} />
          <SectionCta href={section.buttonUrl} label={ctaLabel} />
        </div>
        {hasImage ? (
          <MediaFrame
            src={imageUrl}
            alt={title}
            className="h-72 rounded-[26px] sm:h-[420px]"
            frameClassName="rounded-[30px] bg-background p-3"
          />
        ) : (
          <SupportPanel
            title="Featured section"
            text="Keep this section for one message and one action so the homepage stays clean and easy to follow."
          />
        )}
      </div>
    </section>
  );
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
    mainNavList.find(
      (item) => normalizePath(item.url) === normalizedMainSlug,
    ) || null;

  const resolvedMainNavUrl =
    matchedMain?.url?.trim() || `/${normalizedMainSlug}`;

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
    .map((section, index) => ({
      section,
      key: section.id || `section-${index}`,
    }))
    .filter(({ section }) => section.type === "product_collection");

  const productsBySection = new Map<string, ProductListResponse["data"]>();
  if (productSections.length > 0) {
    const results = await Promise.all(
      productSections.map(({ section, key }) =>
        getProductsForSection(section, key),
      ),
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
          <p className="mt-2 text-sm text-muted-foreground">
            {emptyDescription}
          </p>
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

          return (
            <HeroSlider
              key={sectionKey}
              slides={slides}
              variant={normalizeHomeSectionVariant(
                "hero_slider",
                section.variant,
              )}
            />
          );
        }

        if (section.type === "product_collection") {
          return renderProductCollectionSection(
            section,
            productsBySection.get(sectionKey) || [],
            sectionKey,
          );
        }

        if (section.type === "discount_banner") {
          return renderDiscountBannerSection(section, sectionKey);
        }

        if (section.type === "custom_banner") {
          return renderCustomBannerSection(section, sectionKey);
        }

        return null;
      })}
    </main>
  );
}
