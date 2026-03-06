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

export function SectionCta({
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
        "h-10 rounded-full px-5 text-sm font-semibold shadow-none",
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

export function ProductGrid({
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
    <div className="rounded-[26px] bg-background px-5 py-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold text-foreground">{title}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
