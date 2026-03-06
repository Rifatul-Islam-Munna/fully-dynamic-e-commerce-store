import { ProductDetailsActions } from "@/components/product/product-details-actions";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import {
  Breadcrumbs,
  CommerceFacts,
  DescriptionSection,
  HeaderCluster,
  InlineRichDescription,
  ProductHeader,
  PurchasePanel,
  RelatedProductsSection,
  SupportNotes,
  SupportStrip,
  TrustList,
} from "@/components/product/product-details-view.shared";
import type { LayoutProps } from "@/components/product/product-details-view.types";

export function renderProductDetailsLayout(
  productDetailsVariant: string,
  props: LayoutProps,
) {
  switch (productDetailsVariant) {
    case "original":
      return <OriginalDetails {...props} />;
    case "showcase":
      return <ShowcaseDetails {...props} />;
    case "streamlined":
      return <StreamlinedDetails {...props} />;
    case "gallery_first":
      return <GalleryFirstDetails {...props} />;
    case "buy_panel":
      return <BuyPanelDetails {...props} />;
    case "storyline":
      return <StorylineDetails {...props} />;
    case "immersive":
      return <ImmersiveDetails {...props} />;
    case "catalog":
      return <CatalogDetails {...props} />;
    case "commerce_stack":
      return <CommerceStackDetails {...props} />;
    case "spec_sheet":
      return <SpecSheetDetails {...props} />;
    case "media_rail":
      return <MediaRailDetails {...props} />;
    case "briefing":
      return <BriefingDetails {...props} />;
    case "showroom":
      return <ShowroomDetails {...props} />;
    case "retail_suite":
      return <RetailSuiteDetails {...props} />;
    case "overview_split":
      return <OverviewSplitDetails {...props} />;
    case "gallery_stack":
      return <GalleryStackDetails {...props} />;
    case "merchant_brief":
      return <MerchantBriefDetails {...props} />;
    default:
      return <ClassicDetails {...props} />;
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
