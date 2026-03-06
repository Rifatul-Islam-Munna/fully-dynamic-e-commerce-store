"use client";

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
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { useSitePreferences } from "@/components/site/site-preferences-provider";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ProductVariant = {
  id: string;
  title: string;
  sku?: string | null;
  price: number;
  discountPrice: number | null;
  stock?: number;
  isActive?: boolean;
  sortOrder?: number;
};

type ProductDetails = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  imageUrls?: string[];
  price: number;
  discountPrice: number | null;
  richText?: string | null;
  mainNavUrl?: string | null;
  subNavUrl?: string | null;
  hasVariants?: boolean;
  variants?: ProductVariant[];
};

type RelatedProduct = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  price: number;
  discountPrice: number | null;
};

type ProductDetailsViewProps = {
  product: ProductDetails;
  gallery: string[];
  variants: ProductVariant[];
  relatedProducts: RelatedProduct[];
  mainNavUrl: string | null;
  subNavUrl: string | null;
  mainLabel: string | null;
  subLabel: string | null;
  relatedTitle: string;
};

type ViewState = ReturnType<typeof buildViewState>;

type ActionProduct = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  price: number;
  discountPrice: number | null;
  hasVariants?: boolean;
  variants: ProductVariant[];
};

type LayoutProps = ProductDetailsViewProps & {
  actionProduct: ActionProduct;
  view: ViewState;
};

function stripHtmlToText(html?: string | null) {
  if (!html) {
    return "";
  }

  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildViewState(product: ProductDetails, variants: ProductVariant[]) {
  const hasVariants = Boolean(product.hasVariants && variants.length > 0);
  const variantPrices = variants.map(
    (variant) => variant.discountPrice ?? variant.price,
  );
  const minVariantPrice =
    variantPrices.length > 0 ? Math.min(...variantPrices) : null;
  const maxVariantPrice =
    variantPrices.length > 0 ? Math.max(...variantPrices) : null;
  const baseCurrentPrice = product.discountPrice ?? product.price;
  const hasBaseDiscount =
    product.discountPrice !== null && product.discountPrice < product.price;
  const showDiscountBadge = !hasVariants && hasBaseDiscount && product.price > 0;
  const summary = stripHtmlToText(product.richText).slice(0, 220);
  const priceRangeText =
    hasVariants && minVariantPrice !== null
      ? maxVariantPrice !== null && minVariantPrice !== maxVariantPrice
        ? `${formatCurrency(minVariantPrice)} - ${formatCurrency(maxVariantPrice)}`
        : formatCurrency(minVariantPrice)
      : formatCurrency(baseCurrentPrice);
  const activeDiscountPercent =
    showDiscountBadge && product.price > 0
      ? Math.round(((product.price - baseCurrentPrice) / product.price) * 100)
      : 0;

  return {
    hasVariants,
    baseCurrentPrice,
    hasBaseDiscount,
    showDiscountBadge,
    priceRangeText,
    summary,
    activeDiscountPercent,
  };
}

function buildActionProduct(props: ProductDetailsViewProps): ActionProduct {
  return {
    id: props.product.id,
    slug: props.product.slug,
    title: props.product.title,
    thumbnailUrl: props.product.thumbnailUrl,
    price: props.product.price,
    discountPrice: props.product.discountPrice,
    hasVariants: props.product.hasVariants,
    variants: props.variants,
  };
}

export function ProductDetailsView(props: ProductDetailsViewProps) {
  const { productDetailsVariant } = useSitePreferences();
  const view = buildViewState(props.product, props.variants);
  const actionProduct = buildActionProduct(props);
  const layoutProps = { ...props, actionProduct, view };

  switch (productDetailsVariant) {
    case "original":
      return <OriginalDetails {...layoutProps} />;
    case "showcase":
      return <ShowcaseDetails {...layoutProps} />;
    case "streamlined":
      return <StreamlinedDetails {...layoutProps} />;
    case "gallery_first":
      return <GalleryFirstDetails {...layoutProps} />;
    case "buy_panel":
      return <BuyPanelDetails {...layoutProps} />;
    case "storyline":
      return <StorylineDetails {...layoutProps} />;
    case "immersive":
      return <ImmersiveDetails {...layoutProps} />;
    case "catalog":
      return <CatalogDetails {...layoutProps} />;
    case "commerce_stack":
      return <CommerceStackDetails {...layoutProps} />;
    case "spec_sheet":
      return <SpecSheetDetails {...layoutProps} />;
    case "media_rail":
      return <MediaRailDetails {...layoutProps} />;
    case "briefing":
      return <BriefingDetails {...layoutProps} />;
    case "showroom":
      return <ShowroomDetails {...layoutProps} />;
    case "retail_suite":
      return <RetailSuiteDetails {...layoutProps} />;
    case "overview_split":
      return <OverviewSplitDetails {...layoutProps} />;
    case "gallery_stack":
      return <GalleryStackDetails {...layoutProps} />;
    case "merchant_brief":
      return <MerchantBriefDetails {...layoutProps} />;
    default:
      return <ClassicDetails {...layoutProps} />;
  }
}

function OriginalDetails(props: LayoutProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8">
      <ProductImageGallery images={props.gallery} title={props.product.title} />

      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-[28px] bg-card p-5 sm:p-6">
          <Breadcrumbs
            mainNavUrl={props.mainNavUrl}
            subNavUrl={props.subNavUrl}
            mainLabel={props.mainLabel}
            subLabel={props.subLabel}
          />

          <div className="mt-4">
            <ProductHeader
              product={props.product}
              priceText={props.view.priceRangeText}
              hasVariants={props.view.hasVariants}
              hasBaseDiscount={props.view.hasBaseDiscount}
              baseCurrentPrice={props.view.baseCurrentPrice}
              showDiscountBadge={props.view.showDiscountBadge}
            />
          </div>

          {props.view.summary ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {props.view.summary}
            </p>
          ) : null}

          <div className="mt-5">
            <ProductDetailsActions product={props.actionProduct} />
          </div>

          <div className="mt-5">
            <InlineRichDescription richText={props.product.richText} />
          </div>
        </section>

        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
          compact
        />
        <TrustList />
      </div>
    </section>
  );
}

function ClassicDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8">
        <ProductImageGallery images={props.gallery} title={props.product.title} />
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <HeaderCluster {...props} />
          <PurchasePanel {...props} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.94fr]">
        <DescriptionSection richText={props.product.richText} />
        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
        />
      </section>
    </div>
  );
}

function ShowcaseDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr] xl:gap-8">
        <div className="space-y-4">
          <ProductImageGallery images={props.gallery} title={props.product.title} />
          <SupportStrip />
        </div>
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <HeaderCluster {...props} showCategoryLinks highlightSummary />
          <PurchasePanel {...props} emphasis="summary" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <DescriptionSection richText={props.product.richText} />
        <SupportNotes />
      </section>

      <RelatedProductsSection
        title={props.relatedTitle}
        products={props.relatedProducts}
      />
    </div>
  );
}

function StreamlinedDetails(props: LayoutProps) {
  return (
    <div className="space-y-6">
      <HeaderCluster {...props} />
      <section className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr] xl:gap-8">
        <div className="space-y-6">
          <ProductImageGallery images={props.gallery} title={props.product.title} />
          <DescriptionSection richText={props.product.richText} />
        </div>
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <PurchasePanel {...props} compact />
          <SupportNotes compact />
        </div>
      </section>

      <RelatedProductsSection
        title={props.relatedTitle}
        products={props.relatedProducts}
      />
    </div>
  );
}

function GalleryFirstDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <ProductImageGallery images={props.gallery} title={props.product.title} />

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr] xl:gap-8">
        <div className="space-y-6">
          <HeaderCluster {...props} showCategoryLinks />
          <DescriptionSection richText={props.product.richText} />
        </div>
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <PurchasePanel {...props} />
          <RelatedProductsSection
            title={props.relatedTitle}
            products={props.relatedProducts}
            compact
          />
        </div>
      </section>
    </div>
  );
}

function BuyPanelDetails(props: LayoutProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr] xl:gap-8">
      <div className="space-y-6">
        <HeaderCluster {...props} showCategoryLinks highlightSummary />
        <ProductImageGallery images={props.gallery} title={props.product.title} />
        <DescriptionSection richText={props.product.richText} />
      </div>

      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <PurchasePanel {...props} emphasis="order" />
        <SupportNotes compact />
        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
          compact
        />
      </div>
    </section>
  );
}

function StorylineDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <HeaderCluster {...props} showCategoryLinks highlightSummary wide />

      <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:gap-8">
        <ProductImageGallery images={props.gallery} title={props.product.title} />
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <PurchasePanel {...props} />
          <SupportStrip />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.94fr]">
        <DescriptionSection richText={props.product.richText} />
        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
        />
      </section>
    </div>
  );
}

function ImmersiveDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr] xl:gap-8">
        <div className="space-y-6">
          <ProductImageGallery images={props.gallery} title={props.product.title} />
          <CommerceFacts {...props} />
        </div>
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <HeaderCluster {...props} showCategoryLinks />
          <PurchasePanel {...props} emphasis="summary" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.94fr]">
        <DescriptionSection richText={props.product.richText} />
        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
        />
      </section>
    </div>
  );
}

function CatalogDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <CommerceFacts {...props} />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:gap-8">
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <HeaderCluster {...props} />
          <PurchasePanel {...props} compact />
        </div>
        <div className="space-y-6">
          <ProductImageGallery images={props.gallery} title={props.product.title} />
          <DescriptionSection richText={props.product.richText} />
        </div>
      </section>

      <RelatedProductsSection
        title={props.relatedTitle}
        products={props.relatedProducts}
      />
    </div>
  );
}

function CommerceStackDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <HeaderCluster {...props} showCategoryLinks />
      <PurchasePanel {...props} compact />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:gap-8">
        <ProductImageGallery images={props.gallery} title={props.product.title} />
        <div className="space-y-6">
          <DescriptionSection richText={props.product.richText} />
          <SupportNotes />
        </div>
      </section>

      <RelatedProductsSection
        title={props.relatedTitle}
        products={props.relatedProducts}
      />
    </div>
  );
}

function SpecSheetDetails(props: LayoutProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr] xl:gap-8">
      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <HeaderCluster {...props} />
        <PurchasePanel {...props} compact emphasis="order" />
      </div>

      <div className="space-y-6">
        <ProductImageGallery images={props.gallery} title={props.product.title} />
        <DescriptionSection richText={props.product.richText} />
        <SupportStrip />
        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
        />
      </div>
    </section>
  );
}

function MediaRailDetails(props: LayoutProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.24fr_0.76fr] xl:gap-8">
      <div className="space-y-6">
        <HeaderCluster {...props} showCategoryLinks />
        <ProductImageGallery images={props.gallery} title={props.product.title} />
        <DescriptionSection richText={props.product.richText} />
      </div>

      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <PurchasePanel {...props} emphasis="summary" />
        <SupportNotes compact />
        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
          compact
        />
      </div>
    </section>
  );
}

function BriefingDetails(props: LayoutProps) {
  return (
    <div className="space-y-6">
      <HeaderCluster {...props} />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr] xl:gap-8">
        <ProductImageGallery images={props.gallery} title={props.product.title} />

        <div className="space-y-4">
          <PurchasePanel {...props} compact />
          <DescriptionSection richText={props.product.richText} />
        </div>
      </section>

      <RelatedProductsSection
        title={props.relatedTitle}
        products={props.relatedProducts}
      />
    </div>
  );
}

function ShowroomDetails(props: LayoutProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:gap-8">
      <div className="space-y-6">
        <ProductImageGallery images={props.gallery} title={props.product.title} />
        <DescriptionSection richText={props.product.richText} />
      </div>

      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <HeaderCluster {...props} showCategoryLinks highlightSummary />
        <PurchasePanel {...props} emphasis="order" />
        <SupportStrip />
        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
          compact
        />
      </div>
    </section>
  );
}

function RetailSuiteDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <CommerceFacts {...props} />

      <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:gap-8">
        <div className="space-y-6">
          <HeaderCluster {...props} showCategoryLinks />
          <ProductImageGallery images={props.gallery} title={props.product.title} />
          <DescriptionSection richText={props.product.richText} />
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <PurchasePanel {...props} emphasis="order" />
          <SupportNotes compact />
          <RelatedProductsSection
            title={props.relatedTitle}
            products={props.relatedProducts}
            compact
          />
        </div>
      </section>
    </div>
  );
}

function OverviewSplitDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr] xl:gap-8">
        <HeaderCluster {...props} showCategoryLinks highlightSummary wide />
        <PurchasePanel {...props} emphasis="summary" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8">
        <ProductImageGallery images={props.gallery} title={props.product.title} />
        <div className="space-y-6">
          <DescriptionSection richText={props.product.richText} />
          <SupportNotes />
        </div>
      </section>

      <RelatedProductsSection
        title={props.relatedTitle}
        products={props.relatedProducts}
      />
    </div>
  );
}

function GalleryStackDetails(props: LayoutProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr] xl:gap-8">
        <HeaderCluster {...props} showCategoryLinks />
        <PurchasePanel {...props} compact />
      </section>

      <ProductImageGallery images={props.gallery} title={props.product.title} />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.94fr]">
        <DescriptionSection richText={props.product.richText} />
        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
        />
      </section>
    </div>
  );
}

function MerchantBriefDetails(props: LayoutProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr] xl:gap-8">
      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <HeaderCluster {...props} showCategoryLinks />

        <section className="rounded-[28px] bg-card p-5 sm:p-6">
          <ProductDetailsActions product={props.actionProduct} />
          <div className="mt-5">
            <InlineRichDescription richText={props.product.richText} />
          </div>
        </section>

        <SupportNotes compact />
      </div>

      <div className="space-y-6">
        <ProductImageGallery images={props.gallery} title={props.product.title} />
        <RelatedProductsSection
          title={props.relatedTitle}
          products={props.relatedProducts}
        />
      </div>
    </section>
  );
}

function Breadcrumbs({
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

function ProductHeader({
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

function HeaderCluster({
  product,
  view,
  mainNavUrl,
  subNavUrl,
  mainLabel,
  subLabel,
  showCategoryLinks = false,
  highlightSummary = false,
  wide = false,
}: LayoutProps & {
  showCategoryLinks?: boolean;
  highlightSummary?: boolean;
  wide?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] bg-muted/18 p-5 sm:p-6",
        wide ? "xl:p-7" : "",
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

function PurchasePanel({
  actionProduct,
  view,
  variants,
  compact = false,
  emphasis = "default",
}: LayoutProps & {
  compact?: boolean;
  emphasis?: "default" | "summary" | "order";
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] p-5 sm:p-6",
        emphasis === "order"
          ? "bg-background"
          : emphasis === "summary"
            ? "bg-muted/22"
            : "bg-card",
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

function CommerceFacts(props: LayoutProps) {
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

function CommerceFactsRow({
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
      className={cn(
        "grid gap-2",
        compact ? "grid-cols-1" : "sm:grid-cols-3",
      )}
    >
      <FactCard
        label="Pricing"
        value={view.hasVariants ? `From ${view.priceRangeText}` : view.priceRangeText}
      />
      <FactCard
        label="Options"
        value={view.hasVariants ? `${variants.length} variants` : "Single option"}
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

function FactCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-background px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SupportStrip() {
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

function SupportNotes({ compact = false }: { compact?: boolean }) {
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

function TrustList({ compact = false }: { compact?: boolean }) {
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

function TrustLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function ServicePill({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-background px-3 py-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function NoteLine({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
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

function InlineRichDescription({ richText }: { richText?: string | null }) {
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

function DescriptionSection({ richText }: { richText?: string | null }) {
  return (
    <section className="rounded-[28px] bg-card p-5 sm:p-6">
      <h2 className="text-base font-semibold tracking-tight">Product Details</h2>
      {richText?.trim() ? (
        <div className="mt-4 overflow-x-auto">
          <article
            className="product-rich-content prose prose-sm max-w-none text-foreground"
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

function RelatedProductsSection({
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
        <div className={cn("grid gap-3", compact ? "" : "sm:grid-cols-2")}>
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
