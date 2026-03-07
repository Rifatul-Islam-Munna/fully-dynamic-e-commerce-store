import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetailsActions } from "@/components/product/product-details-actions";
import type {
  LayoutProps,
  ProductDetails,
  ProductVariant,
  RelatedProduct,
  ViewState,
} from "@/components/product/product-details-view.types";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  mainNavUrl,
  subNavUrl,
  mainLabel,
  subLabel,
}: {
  mainNavUrl: string | null;
  subNavUrl: string | null;
  mainLabel: string | null;
  subLabel: string | null;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
    >
      <Link href="/" className="hover:text-foreground">
        Home
      </Link>
      {mainNavUrl && mainLabel ? (
        <>
          <ArrowRight className="size-3" />
          <Link href={mainNavUrl} className="hover:text-foreground">
            {mainLabel}
          </Link>
        </>
      ) : null}
      {subNavUrl && subLabel ? (
        <>
          <ArrowRight className="size-3" />
          <Link href={subNavUrl} className="hover:text-foreground">
            {subLabel}
          </Link>
        </>
      ) : null}
    </nav>
  );
}

export function ProductHeader({
  product,
  priceText,
  hasVariants,
  hasBaseDiscount,
  baseCurrentPrice,
  showDiscountBadge,
}: {
  product: ProductDetails;
  priceText: string;
  hasVariants: boolean;
  hasBaseDiscount: boolean;
  baseCurrentPrice: number;
  showDiscountBadge: boolean;
}) {
  const activeDiscountPercent =
    showDiscountBadge && product.price > 0
      ? Math.round(((product.price - baseCurrentPrice) / product.price) * 100)
      : 0;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
        {product.title}
      </h1>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl font-semibold text-foreground">
          {hasVariants ? `From ${priceText}` : priceText}
        </span>
        {!hasVariants && hasBaseDiscount ? (
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(product.price)}
          </span>
        ) : null}
        {showDiscountBadge && activeDiscountPercent > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-xs font-medium text-emerald-600">
            <BadgePercent className="size-3.5" />
            Save {activeDiscountPercent}%
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function HeaderCluster({
  product,
  view,
  mainNavUrl,
  subNavUrl,
  mainLabel,
  subLabel,
  showCategoryLinks = false,
  highlightSummary = false,
  wide = false,
  emphasis = "default",
}: LayoutProps & {
  showCategoryLinks?: boolean;
  highlightSummary?: boolean;
  wide?: boolean;
  emphasis?: "default" | "brutalist" | "luxury" | "tech" | "glass" | "minimal";
}) {
  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        wide ? "xl:p-8" : "",
        emphasis === "brutalist"
          ? "border-b-4 border-primary bg-background pb-8"
          : emphasis === "luxury"
            ? "border-b border-border/40 bg-transparent pb-10"
            : emphasis === "tech"
              ? "rounded-none border-l-2 border-primary/50 bg-linear-to-r from-primary/5 to-transparent pl-6"
              : emphasis === "glass"
                ? "rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl"
                : emphasis === "minimal"
                  ? "bg-transparent p-0 sm:p-0"
                  : "rounded-[28px] bg-muted/18",
      )}
    >
      <Breadcrumbs
        mainNavUrl={mainNavUrl}
        subNavUrl={subNavUrl}
        mainLabel={mainLabel}
        subLabel={subLabel}
      />

      {showCategoryLinks ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          {mainLabel && mainNavUrl ? (
            <Link
              href={mainNavUrl}
              className="rounded-full bg-background px-3 py-1 text-foreground"
            >
              {mainLabel}
            </Link>
          ) : null}
          {subLabel && subNavUrl ? (
            <Link
              href={subNavUrl}
              className="rounded-full bg-background px-3 py-1 text-muted-foreground"
            >
              {subLabel}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        <ProductHeader
          product={product}
          priceText={view.priceRangeText}
          hasVariants={view.hasVariants}
          hasBaseDiscount={view.hasBaseDiscount}
          baseCurrentPrice={view.baseCurrentPrice}
          showDiscountBadge={view.showDiscountBadge}
        />

        {view.summary ? (
          <p
            className={cn(
              "max-w-3xl text-sm leading-6 text-muted-foreground",
              highlightSummary ? "text-foreground/78" : "",
            )}
          >
            {view.summary}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function PurchasePanel({
  actionProduct,
  view,
  variants,
  compact = false,
  emphasis = "default",
}: LayoutProps & {
  compact?: boolean;
  emphasis?:
    | "default"
    | "summary"
    | "order"
    | "glass"
    | "brutalist"
    | "luxury"
    | "tech";
}) {
  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        emphasis === "brutalist"
          ? "border-4 border-primary bg-background shadow-[8px_8px_0_0_var(--color-primary)]"
          : emphasis === "luxury"
            ? "rounded-sm border border-border/50 bg-background/50 backdrop-blur-xl shadow-sm"
            : emphasis === "tech"
              ? "rounded-lg border border-primary/20 bg-background/95 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)] ring-1 ring-primary/10"
              : emphasis === "glass"
                ? "rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl"
                : emphasis === "order"
                  ? "rounded-[28px] bg-background"
                  : emphasis === "summary"
                    ? "rounded-[28px] bg-muted/22"
                    : "rounded-[28px] bg-card",
      )}
    >
      <div className="space-y-4">
        <ProductDetailsActions product={actionProduct} />
        <CommerceFactsRow view={view} variants={variants} compact={compact} />
        <TrustList compact={compact} />
      </div>
    </section>
  );
}

export function CommerceFacts(props: LayoutProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <FactCard
        label="Pricing"
        value={
          props.view.hasVariants
            ? `From ${props.view.priceRangeText}`
            : props.view.priceRangeText
        }
      />
      <FactCard
        label="Options"
        value={
          props.view.hasVariants
            ? `${props.variants.length} variants`
            : "Single option"
        }
      />
      <FactCard
        label="Offer"
        value={
          props.view.showDiscountBadge && props.view.activeDiscountPercent > 0
            ? `${props.view.activeDiscountPercent}% off`
            : "Regular price"
        }
      />
    </section>
  );
}

export function CommerceFactsRow({
  view,
  variants,
  compact = false,
}: {
  view: ViewState;
  variants: ProductVariant[];
  compact?: boolean;
}) {
  return (
    <div
      className={cn("grid gap-2", compact ? "grid-cols-1" : "sm:grid-cols-3")}
    >
      <FactCard
        label="Pricing"
        value={
          view.hasVariants ? `From ${view.priceRangeText}` : view.priceRangeText
        }
      />
      <FactCard
        label="Options"
        value={
          view.hasVariants ? `${variants.length} variants` : "Single option"
        }
      />
      <FactCard
        label="Offer"
        value={
          view.showDiscountBadge && view.activeDiscountPercent > 0
            ? `${view.activeDiscountPercent}% off`
            : "Regular price"
        }
      />
    </div>
  );
}

export function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background px-3 py-3 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function SupportStrip() {
  return (
    <div className="grid gap-2 rounded-[24px] bg-muted/18 p-4 sm:grid-cols-3">
      <ServicePill
        icon={<Truck className="size-4" />}
        title="Fast delivery"
        text="Dispatch-ready for confirmed orders."
      />
      <ServicePill
        icon={<ShieldCheck className="size-4" />}
        title="Secure checkout"
        text="Protected order flow and address verification."
      />
      <ServicePill
        icon={<PackageCheck className="size-4" />}
        title="Live stock"
        text="Availability follows tracked product inventory."
      />
    </div>
  );
}

export function SupportNotes({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rounded-[24px] bg-muted/18 p-4">
      <div className={cn("grid gap-3", compact ? "" : "sm:grid-cols-3")}>
        <NoteLine
          icon={<Truck className="size-4" />}
          title="Delivery support"
          text="Prepared for fast dispatch after confirmation."
        />
        <NoteLine
          icon={<ShieldCheck className="size-4" />}
          title="Protected purchase"
          text="Secure checkout and verified order details."
        />
        <NoteLine
          icon={<PackageCheck className="size-4" />}
          title="Inventory aware"
          text="Product availability follows live stock setup."
        />
      </div>
    </section>
  );
}

export function TrustList({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-2 text-sm", compact ? "" : "")}>
      <TrustLine
        icon={<Truck className="size-4" />}
        text="Fast delivery support after order confirmation"
      />
      <TrustLine
        icon={<ShieldCheck className="size-4" />}
        text="Secure checkout and customer information handling"
      />
      <TrustLine
        icon={<PackageCheck className="size-4" />}
        text="Stock-aware fulfillment before dispatch"
      />
    </div>
  );
}

export function TrustLine({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  );
}

export function ServicePill({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-background px-3 py-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

export function NoteLine({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

export function InlineRichDescription({
  richText,
}: {
  richText?: string | null;
}) {
  return richText?.trim() ? (
    <article
      className="product-rich-content prose prose-sm max-w-none text-foreground"
      dangerouslySetInnerHTML={{ __html: richText }}
    />
  ) : (
    <p className="text-sm text-muted-foreground">
      Detailed description will be added soon.
    </p>
  );
}

export function DescriptionSection({
  richText,
  emphasis = "default",
}: {
  richText?: string | null;
  emphasis?: "default" | "brutalist" | "luxury" | "tech" | "minimal";
}) {
  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        emphasis === "brutalist"
          ? "border-4 border-primary bg-background shadow-[8px_8px_0_0_var(--color-primary)]"
          : emphasis === "luxury"
            ? "border-t border-border/40 bg-transparent pt-8 p-0 sm:p-0"
            : emphasis === "tech"
              ? "rounded-lg border border-primary/20 bg-background/50 font-mono text-sm"
              : emphasis === "minimal"
                ? "bg-transparent p-0 sm:p-0"
                : "rounded-[28px] bg-card",
      )}
    >
      <h2 className="text-base font-semibold tracking-tight">
        Product Details
      </h2>
      {richText?.trim() ? (
        <div className="mt-4 overflow-x-auto">
          <article
            className={cn(
              "product-rich-content prose prose-sm max-w-none text-foreground",
              emphasis === "luxury"
                ? "prose-headings:font-serif prose-p:leading-relaxed"
                : "",
            )}
            dangerouslySetInnerHTML={{ __html: richText }}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Detailed description will be added soon.
        </p>
      )}
    </section>
  );
}

export function RelatedProductsSection({
  title,
  products,
  compact = false,
}: {
  title: string;
  products: RelatedProduct[];
  compact?: boolean;
}) {
  return (
    <section className="rounded-[28px] bg-card p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </div>
      {products.length > 0 ? (
        <div
          className={cn(
            "grid gap-3",
            compact
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
          )}
        >
          {products.map((related) => (
            <ProductCard key={related.id} product={related} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No related products available for this category yet.
        </p>
      )}
    </section>
  );
}
