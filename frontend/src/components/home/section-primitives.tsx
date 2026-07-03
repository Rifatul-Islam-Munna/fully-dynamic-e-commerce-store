import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HomeSectionType =
  | "hero_slider"
  | "product_collection"
  | "discount_banner"
  | "custom_banner";

export type ProductFlag =
  | "isHotSells"
  | "isWeeklySell"
  | "isSummerSell"
  | "isWinterSell"
  | "isBestSell";

export type HomeSectionSlide = {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonLabel?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type HomeSection = {
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
  slides?: HomeSectionSlide[];
};

export type HomeSettingsResponse = {
  id: string;
  key?: string;
  mainNavUrl: string | null;
  subNavUrl: string | null;
  sections: HomeSection[];
  isActive: boolean;
};

export type ProductListResponse = {
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

export type NavbarResponse = {
  mainNav?: Array<{
    title?: string;
    url?: string;
    subNav?: Array<{
      title?: string;
      url?: string;
    }>;
  }>;
};

export const PRODUCT_FLAG_LABELS: Record<ProductFlag, string> = {
  isHotSells: "Hot sells",
  isWeeklySell: "Weekly picks",
  isSummerSell: "Summer picks",
  isWinterSell: "Winter picks",
  isBestSell: "Best sellers",
};

export function resolveSectionCopy(section: HomeSection) {
  return section.description?.trim() || section.subtitle?.trim() || "";
}

export function SectionEyebrow({
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
        "flex flex-wrap items-center gap-3 font-body text-[10px] font-bold uppercase tracking-[0.18em]",
        inverse ? "text-white/70" : "text-muted-foreground",
      )}
    >
      <span className={cn("h-px w-7", inverse ? "bg-white/45" : "bg-primary")} />
      <span>{label}</span>
      {secondary ? (
        <>
          <span className={cn("size-1", inverse ? "bg-white/45" : "bg-border")} />
          <span className="opacity-70">{secondary}</span>
        </>
      ) : null}
    </div>
  );
}

export function SectionHeading({
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
    <div className="space-y-3">
      <h2
        className={cn(
          "commerce-heading",
          compact
            ? "text-3xl sm:text-4xl"
            : "text-4xl sm:text-5xl lg:text-6xl",
          inverse ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {copy ? (
        <p
          className={cn(
            "max-w-2xl font-body leading-7",
            compact ? "text-sm" : "text-base sm:text-lg",
            inverse ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {copy}
        </p>
      ) : null}
    </div>
  );
}

export function SectionCta({
  href,
  label,
  inverse = false,
}: {
  href?: string;
  label?: string;
  inverse?: boolean;
}) {
  if (!href?.trim()) return null;

  return (
    <Button
      asChild
      variant={inverse ? "secondary" : "default"}
      className={cn(
        "commerce-interactive h-11 rounded-sm border px-6 font-body text-[11px] font-bold uppercase tracking-[0.13em]",
        inverse
          ? "border-white bg-white text-black hover:bg-white/90"
          : "border-primary bg-primary text-primary-foreground",
      )}
    >
      <Link href={href} className="inline-flex items-center gap-2.5">
        <span>{label?.trim() || "Explore"}</span>
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}

export function SectionTagRow({
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

  if (filtered.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filtered.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={cn(
            "border px-3 py-1.5 font-body text-[10px] font-bold uppercase tracking-[0.14em]",
            inverse
              ? "border-white/25 bg-black/15 text-white/75"
              : "border-border bg-background text-muted-foreground",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function DetailTile({
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
        "border p-5",
        inverse
          ? "border-white/20 bg-black/15 text-white"
          : "border-border bg-card text-foreground",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center border",
            inverse
              ? "border-white/25 text-white"
              : "border-border bg-muted/35 text-primary",
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="space-y-1.5">
          <p className="font-body text-sm font-semibold">{title}</p>
          <p
            className={cn(
              "font-body text-xs leading-5",
              inverse ? "text-white/65" : "text-muted-foreground",
            )}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  className,
}: {
  products: ProductListResponse["data"];
  className?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <p className="font-body text-sm text-muted-foreground">
          No products found for this section.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function MediaFrame({
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
  if (!src?.trim()) return null;

  return (
    <div
      className={cn(
        "commerce-media overflow-hidden border border-border bg-muted/20",
        frameClassName,
      )}
    >
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

export function SupportPanel({
  label = "Featured section",
  title,
  text,
}: {
  label?: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-primary bg-primary p-7 text-primary-foreground sm:p-8">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/65">
        {label}
      </p>
      <p className="mt-4 font-headline text-3xl font-semibold leading-tight tracking-tight">
        {title}
      </p>
      <p className="mt-3 font-body text-sm leading-6 text-primary-foreground/70">
        {text}
      </p>
    </div>
  );
}
