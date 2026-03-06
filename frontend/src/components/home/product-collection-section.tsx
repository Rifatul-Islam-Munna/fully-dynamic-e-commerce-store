import { normalizeHomeSectionVariant } from "@/lib/home-section-variants";
import {
  type HomeSection,
  type ProductListResponse,
  PRODUCT_FLAG_LABELS,
  ProductGrid,
  resolveSectionCopy,
  SectionCta,
  SectionEyebrow,
  SectionHeading,
  SectionTagRow,
} from "@/components/home/section-primitives";

export function renderProductCollectionSection(
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

  if (variant === "tab_shelf") {
    return (
      <section key={sectionKey} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <SectionHeading title={title} compact />
            <div className="flex flex-wrap gap-1.5">
              {[sectionFlag, itemText].filter(Boolean).map((tag, index) => (
                <span
                  key={index}
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
