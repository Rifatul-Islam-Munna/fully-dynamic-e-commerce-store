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
        "rounded-[24px] border px-4 py-4",
        inverse
          ? "border-white/12 bg-white/8 text-white"
          : "border-border/70 bg-background/82 text-foreground",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-9 items-center justify-center rounded-2xl",
            inverse ? "bg-white/12 text-white" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="space-y-1.5">
          <p
            className={cn(
              "text-sm font-semibold",
              inverse ? "text-white" : "text-foreground",
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "text-sm leading-6",
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
      <div className="rounded-[24px] bg-muted/25 px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No products found for this section filter.
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
  const sectionFlag =
    section.productFlag ? PRODUCT_FLAG_LABELS[section.productFlag] : null;
  const itemText = products.length > 0 ? `${products.length} items` : null;
  const metaText = [sectionFlag, itemText].filter(Boolean).join(" - ");
  const ctaLabel = section.buttonLabel || "View all products";
  const cta = (
    <SectionCta href={section.buttonUrl} label={ctaLabel} />
  );

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
        className="rounded-[32px] border border-border/70 bg-background p-4 shadow-[0_22px_60px_-50px_rgba(15,23,42,0.22)] sm:p-6"
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
        className="rounded-[32px] border border-border/70 bg-background p-4 shadow-[0_22px_60px_-50px_rgba(15,23,42,0.18)] sm:p-6"
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
        className="rounded-[32px] border border-border/70 bg-background p-4 shadow-[0_22px_60px_-50px_rgba(15,23,42,0.18)] sm:p-6"
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
              <SectionEyebrow label="Featured collection" secondary={metaText} />
              <SectionHeading title={title} copy={introCopy} />
            </div>
            {cta}
          </div>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SectionTagRow
              items={["Featured layout", sectionFlag, itemText]}
            />
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

  return (
    <section key={sectionKey} className="rounded-[34px] bg-muted/20 p-4 sm:p-6">
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
  const variant = normalizeHomeSectionVariant("discount_banner", section.variant);
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
          backgroundImage: backgroundImageUrl ? `url('${backgroundImageUrl}')` : undefined,
          backgroundSize: backgroundImageUrl ? "cover" : undefined,
          backgroundPosition: backgroundImageUrl ? "center" : undefined,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.88),rgba(30,41,59,0.72),rgba(79,70,229,0.58))]" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="rounded-[32px] border border-white/12 bg-white/10 px-6 py-8 text-center backdrop-blur-md">
            <SectionEyebrow label="Campaign poster" secondary={subtitle} inverse />
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
        className="rounded-[38px] border border-border/70 bg-background p-4 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.3)] sm:p-6"
      >
        <div className="grid gap-4 lg:grid-cols-[1.06fr_0.94fr] lg:items-stretch">
          <div className="rounded-[32px] bg-[linear-gradient(135deg,rgba(79,70,229,0.08),rgba(15,23,42,0.04),rgba(255,255,255,1))] px-5 py-6 sm:px-6">
            <SectionEyebrow label="Offer" secondary={subtitle} />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} />
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailTile
                  icon={BadgePercent}
                  title="Offer first"
                  text="Built for a strong promotion headline and a clean CTA."
                  className="bg-background/80"
                />
                <DetailTile
                  icon={PanelsTopLeft}
                  title="Readable split"
                  text="Message and image stay separate but visually balanced."
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
          backgroundImage: backgroundImageUrl ? `url('${backgroundImageUrl}')` : undefined,
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
              title="Premium overlay"
              text="Works best for seasonal drops and higher-impact campaign moments."
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
                  title="Offer-led layout"
                  text="The message stays prominent while the visual holds the edge."
                  className="bg-background/80"
                />
                <DetailTile
                  icon={GalleryVerticalEnd}
                  title="Campaign balance"
                  text={
                    imageUrl
                      ? "Image and CTA are kept in separate focal zones."
                      : "Use with or without a supporting image."
                  }
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
          <SectionCta
            href={section.buttonUrl}
            label={ctaLabel}
            inverse
          />
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
          backgroundImage: backgroundImageUrl ? `url('${backgroundImageUrl}')` : undefined,
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
                title="Image-led story"
                text="Best when the visual deserves more presence and the copy can stay focused."
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
                  title="Structured copy"
                  text="Adds more hierarchy without making the section feel heavy."
                  className="bg-muted/18"
                />
                <DetailTile
                  icon={Sparkles}
                  title="Professional framing"
                  text="Useful for category messaging, trust callouts, and value-led sections."
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
                  title="Second panel"
                  text="Use the companion surface for a visual, testimonial, or supporting proof point."
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
            <SectionEyebrow label="Featured section" secondary={subtitle} inverse />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} inverse />
              <DetailTile
                icon={PanelsTopLeft}
                title="Framed emphasis"
                text="Gives the media a stronger stage while keeping the copy neat and premium."
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
              title="Offset composition"
              text="Creates a more directional layout while keeping the section clean and easy to scan."
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
          backgroundImage: backgroundImageUrl ? `url('${backgroundImageUrl}')` : undefined,
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

  return (
    <section key={sectionKey} className="rounded-[38px] bg-primary/[0.05] p-5 sm:p-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-5">
          <SectionEyebrow
            label="Featured section"
            secondary={subtitle}
          />
          <SectionHeading title={title} copy={sectionCopy} />
          <SectionCta
            href={section.buttonUrl}
            label={ctaLabel}
          />
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

          return (
            <HeroSlider
              key={sectionKey}
              slides={slides}
              variant={normalizeHomeSectionVariant("hero_slider", section.variant)}
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
