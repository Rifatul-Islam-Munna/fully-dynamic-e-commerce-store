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
        "flex flex-wrap items-center gap-3 font-body text-[10px] font-semibold uppercase tracking-[0.2em]",
        inverse ? "text-white/60" : "text-on-surface-variant",
      )}
    >
      <span>{label}</span>
      {secondary ? <span className="opacity-60">{secondary}</span> : null}
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
          "font-headline font-extrabold tracking-tighter",
          compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl lg:text-5xl",
          inverse ? "text-white" : "text-primary",
        )}
      >
        {title}
      </h2>
      {copy ? (
        <p
          className={cn(
            "max-w-2xl font-body leading-relaxed",
            compact ? "text-xs sm:text-sm" : "text-sm sm:text-base",
            inverse ? "text-white/60" : "text-on-surface-variant",
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
        "h-12 rounded-full px-8 font-headline text-xs font-bold uppercase tracking-widest shadow-none transition-all duration-300",
        inverse ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-on-primary hover:opacity-90",
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
            "rounded-full px-4 py-2 font-body text-[10px] font-semibold uppercase tracking-widest",
            inverse
              ? "bg-white/10 text-white/70"
              : "bg-surface-container text-on-surface-variant",
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
        "rounded-sm p-5",
        inverse
          ? "bg-white/5 text-white"
          : "bg-surface-container text-on-surface",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            inverse ? "bg-white/10 text-white" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="space-y-1.5">
          <p
            className={cn(
              "font-headline text-sm font-bold",
              inverse ? "text-white" : "text-primary",
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "font-body text-xs leading-relaxed",
              inverse ? "text-white/60" : "text-on-surface-variant",
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
      <div className="rounded-sm bg-surface-container px-6 py-12 text-center">
        <p className="font-body text-sm text-on-surface-variant">
          No products found for this section.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4", className)}>
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
    <div className={cn("overflow-hidden rounded-sm", frameClassName)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-cover transition-transform duration-700 hover:scale-105", className)}
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
    <div className="rounded-sm bg-primary p-8 text-on-primary">
      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
        {label}
      </p>
      <p className="mt-4 font-headline text-2xl font-extrabold tracking-tighter text-white">
        {title}
      </p>
      <p className="mt-3 font-body text-sm leading-relaxed text-white/60">
        {text}
      </p>
    </div>
  );
}
