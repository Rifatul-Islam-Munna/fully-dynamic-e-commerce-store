import type { HomeSectionType } from "@/actions/admin-actions";
import { cn } from "@/lib/utils";

const PRODUCT_ITEMS = Array.from({ length: 6 }, (_, index) => index);

export function SectionDesignPreview({
  type,
  variant,
  title,
  subtitle,
  compact = false,
}: {
  type: HomeSectionType;
  variant: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const previewTitle = title?.trim() || previewTitleFor(type);
  const previewSubtitle = subtitle?.trim() || previewSubtitleFor(type);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-background text-foreground",
        compact ? "h-32" : "min-h-[360px]",
      )}
    >
      {type === "hero_slider" ? (
        <HeroPreview
          variant={variant}
          title={previewTitle}
          subtitle={previewSubtitle}
          compact={compact}
        />
      ) : null}
      {type === "product_collection" ? (
        <ProductCollectionPreview
          variant={variant}
          title={previewTitle}
          subtitle={previewSubtitle}
          compact={compact}
        />
      ) : null}
      {type === "discount_banner" ? (
        <DiscountPreview
          variant={variant}
          title={previewTitle}
          subtitle={previewSubtitle}
          compact={compact}
        />
      ) : null}
      {type === "custom_banner" ? (
        <CustomPreview
          variant={variant}
          title={previewTitle}
          subtitle={previewSubtitle}
          compact={compact}
        />
      ) : null}
    </div>
  );
}

function HeroPreview({
  variant,
  title,
  subtitle,
  compact,
}: PreviewProps) {
  const centered = ["center_stage", "minimal_overlay", "gradient_banner", "top_bar"].includes(variant);
  const rightAligned = ["side_reveal", "corner_card"].includes(variant);
  const split = ["split_panel", "editorial_frame"].includes(variant);
  const bottom = ["bottom_story", "pill_float"].includes(variant);

  if (split) {
    return (
      <div className="grid h-full grid-cols-2">
        <PreviewImage className="h-full min-h-[130px]" />
        <div className={cn("flex flex-col justify-center bg-surface-container-low p-4", !compact && "p-10")}>
          <PreviewEyebrow />
          <PreviewHeading title={title} compact={compact} />
          <PreviewCopy subtitle={subtitle} compact={compact} />
          <PreviewButton compact={compact} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[130px] bg-gradient-to-br from-primary/15 via-surface-container to-primary/30">
      <PreviewImage className="absolute inset-0 h-full w-full opacity-75" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
      <div
        className={cn(
          "relative flex h-full min-h-[130px] flex-col justify-center p-4 text-white",
          !compact && "min-h-[360px] p-10 sm:p-14",
          centered && "items-center bg-black/20 text-center",
          rightAligned && "ml-auto items-end bg-gradient-to-l from-black/65 to-transparent text-right",
          bottom && "justify-end",
        )}
      >
        <PreviewEyebrow light />
        <PreviewHeading title={title} compact={compact} />
        <PreviewCopy subtitle={subtitle} compact={compact} />
        <PreviewButton compact={compact} light />
      </div>
    </div>
  );
}

function ProductCollectionPreview({
  variant,
  title,
  subtitle,
  compact,
}: PreviewProps) {
  const sidePanel = ["side_panel", "split_intro"].includes(variant);
  const list = variant === "numbered_list";
  const banner = ["editorial_band", "banner_top", "spotlight_board"].includes(variant);
  const productCount = compact ? 4 : 6;

  if (sidePanel) {
    return (
      <div className={cn("grid h-full grid-cols-[0.8fr_1.2fr] gap-3 p-3", !compact && "gap-6 p-8")}>
        <div className="flex flex-col justify-center rounded-lg bg-primary p-4 text-primary-foreground">
          <PreviewEyebrow light />
          <PreviewHeading title={title} compact={compact} />
          <PreviewCopy subtitle={subtitle} compact={compact} />
          <PreviewButton compact={compact} light />
        </div>
        <ProductGrid compact={compact} count={productCount} dense={variant === "compact_grid"} />
      </div>
    );
  }

  if (list) {
    return (
      <div className={cn("space-y-2 p-3", !compact && "space-y-4 p-8")}>
        <PreviewSectionHeader title={title} subtitle={subtitle} compact={compact} />
        {PRODUCT_ITEMS.slice(0, compact ? 3 : 5).map((item) => (
          <div key={item} className="grid grid-cols-[32px_54px_1fr_auto] items-center gap-3 border-t py-2">
            <span className="text-xs font-bold text-primary">0{item + 1}</span>
            <PreviewImage className={cn("h-9 rounded-md", !compact && "h-14")} />
            <div className="space-y-1"><div className="h-2.5 w-2/3 rounded bg-foreground/20" /><div className="h-2 w-1/3 rounded bg-foreground/10" /></div>
            <div className="h-3 w-10 rounded bg-primary/30" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 p-3", !compact && "space-y-6 p-8")}>
      {banner ? (
        <div className="rounded-lg bg-primary p-3 text-primary-foreground">
          <PreviewSectionHeader title={title} subtitle={subtitle} compact={compact} light />
        </div>
      ) : (
        <PreviewSectionHeader title={title} subtitle={subtitle} compact={compact} />
      )}
      <ProductGrid compact={compact} count={productCount} dense={variant === "compact_grid" || variant === "minimal_shelf"} />
    </div>
  );
}

function ProductGrid({ compact, count, dense }: { compact: boolean; count: number; dense: boolean }) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", !compact && "grid-cols-3 gap-5", dense && !compact && "grid-cols-4")}>
      {PRODUCT_ITEMS.slice(0, count).map((item) => (
        <div key={item} className="space-y-2">
          <PreviewImage className={cn("h-14 rounded-md", !compact && "h-36 rounded-lg", dense && !compact && "h-28")} />
          <div className="h-2.5 w-4/5 rounded bg-foreground/20" />
          <div className="h-2 w-1/2 rounded bg-primary/30" />
        </div>
      ))}
    </div>
  );
}

function DiscountPreview({ variant, title, subtitle, compact }: PreviewProps) {
  const split = ["split_offer", "image_edge", "inset_card"].includes(variant);
  const minimal = ["strip", "minimal_bar", "ribbon_banner"].includes(variant);
  const dramatic = ["poster", "hero_discount", "countdown_style"].includes(variant);

  if (minimal) {
    return (
      <div className="flex h-full min-h-[130px] items-center justify-between gap-4 bg-primary px-5 text-primary-foreground">
        <div><PreviewEyebrow light /><PreviewHeading title={title} compact={compact} /></div>
        <div className="hidden flex-1 sm:block"><PreviewCopy subtitle={subtitle} compact={compact} /></div>
        <PreviewButton compact={compact} light />
      </div>
    );
  }

  if (split) {
    return (
      <div className="grid h-full grid-cols-[1.15fr_0.85fr]">
        <div className={cn("flex flex-col justify-center bg-primary p-4 text-primary-foreground", !compact && "p-12")}>
          <PreviewEyebrow light /><PreviewHeading title={title} compact={compact} /><PreviewCopy subtitle={subtitle} compact={compact} /><PreviewButton compact={compact} light />
        </div>
        <PreviewImage className="h-full min-h-[130px]" />
      </div>
    );
  }

  return (
    <div className={cn("relative flex h-full min-h-[130px] flex-col justify-center overflow-hidden bg-gradient-to-br from-primary to-primary/65 p-4 text-primary-foreground", !compact && "min-h-[360px] p-14", dramatic && "items-center text-center")}>
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 left-1/4 size-48 rounded-full bg-white/10" />
      <div className="relative"><PreviewEyebrow light /><PreviewHeading title={title} compact={compact} /><PreviewCopy subtitle={subtitle} compact={compact} /><PreviewButton compact={compact} light /></div>
    </div>
  );
}

function CustomPreview({ variant, title, subtitle, compact }: PreviewProps) {
  const split = ["original", "split_story", "media_left", "shoppable_story"].includes(variant);
  const centered = ["statement_center", "brand_manifesto", "soft_poster"].includes(variant);
  const mosaic = ["commerce_mosaic", "category_portal", "asymmetric", "dual_panel"].includes(variant);
  const strip = ["campaign_strip", "info_strip", "compact_feature", "image_marquee"].includes(variant);

  if (strip) {
    return (
      <div className="flex h-full min-h-[130px] items-center gap-4 bg-surface-container-low p-4">
        <PreviewImage className="h-20 w-1/3 rounded-lg" />
        <div className="flex-1"><PreviewEyebrow /><PreviewHeading title={title} compact={compact} /><PreviewCopy subtitle={subtitle} compact={compact} /></div>
        <PreviewButton compact={compact} />
      </div>
    );
  }

  if (mosaic) {
    return (
      <div className={cn("grid h-full grid-cols-2 gap-2 p-3", !compact && "gap-5 p-8")}>
        <PreviewImage className="h-full min-h-[110px] rounded-lg" />
        <div className="grid grid-rows-2 gap-2">
          <div className="rounded-lg bg-primary p-3 text-primary-foreground"><PreviewHeading title={title} compact={compact} /></div>
          <div className="rounded-lg bg-surface-container p-3"><PreviewCopy subtitle={subtitle} compact={compact} /><PreviewButton compact={compact} /></div>
        </div>
      </div>
    );
  }

  if (centered) {
    return (
      <div className={cn("flex h-full min-h-[130px] flex-col items-center justify-center bg-surface-container-low p-4 text-center", !compact && "min-h-[360px] p-14")}>
        <PreviewEyebrow /><PreviewHeading title={title} compact={compact} /><PreviewCopy subtitle={subtitle} compact={compact} /><PreviewButton compact={compact} />
      </div>
    );
  }

  if (split) {
    return (
      <div className="grid h-full grid-cols-2">
        <div className={cn("flex flex-col justify-center p-4", !compact && "p-10")}><PreviewEyebrow /><PreviewHeading title={title} compact={compact} /><PreviewCopy subtitle={subtitle} compact={compact} /><PreviewButton compact={compact} /></div>
        <PreviewImage className="h-full min-h-[130px]" />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full min-h-[130px] p-3", !compact && "min-h-[360px] p-8")}>
      <PreviewImage className="absolute inset-3 rounded-xl" />
      <div className="absolute inset-3 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="relative flex h-full min-h-[106px] flex-col justify-end p-4 text-white"><PreviewHeading title={title} compact={compact} /><PreviewCopy subtitle={subtitle} compact={compact} /></div>
    </div>
  );
}

type PreviewProps = {
  variant: string;
  title: string;
  subtitle: string;
  compact: boolean;
};

function PreviewImage({ className }: { className?: string }) {
  return <div className={cn("bg-gradient-to-br from-primary/15 via-surface-container to-primary/35", className)} />;
}

function PreviewEyebrow({ light = false }: { light?: boolean }) {
  return <div className={cn("mb-2 h-2 w-14 rounded-full bg-primary/35", light && "bg-white/45")} />;
}

function PreviewHeading({ title, compact }: { title: string; compact: boolean }) {
  return <h3 className={cn("max-w-xl font-bold leading-tight", compact ? "text-xs" : "text-3xl sm:text-4xl")}>{title}</h3>;
}

function PreviewCopy({ subtitle, compact }: { subtitle: string; compact: boolean }) {
  if (compact) return <div className="mt-2 h-1.5 w-2/3 rounded-full bg-current opacity-25" />;
  return <p className="mt-3 max-w-lg text-sm opacity-75">{subtitle}</p>;
}

function PreviewButton({ compact, light = false }: { compact: boolean; light?: boolean }) {
  return <div className={cn("mt-3 w-fit rounded-full bg-primary px-4 py-2 text-[10px] font-semibold text-primary-foreground", !compact && "mt-5 px-5 py-2.5 text-xs", light && "bg-white text-black")} >Shop now</div>;
}

function PreviewSectionHeader({ title, subtitle, compact, light = false }: { title: string; subtitle: string; compact: boolean; light?: boolean }) {
  return <div className={cn("flex items-end justify-between gap-3", light && "text-primary-foreground")}><div><PreviewEyebrow light={light} /><PreviewHeading title={title} compact={compact} />{!compact ? <PreviewCopy subtitle={subtitle} compact={false} /> : null}</div><div className="h-7 w-16 rounded-full border border-current opacity-30" /></div>;
}

function previewTitleFor(type: HomeSectionType) {
  if (type === "hero_slider") return "New season, made for everyday";
  if (type === "product_collection") return "Popular products";
  if (type === "discount_banner") return "Save 30% this weekend";
  return "Tell your brand story";
}

function previewSubtitleFor(type: HomeSectionType) {
  if (type === "hero_slider") return "A premium campaign area with clear messaging and strong shopping actions.";
  if (type === "product_collection") return "A polished product presentation designed for modern retail discovery.";
  if (type === "discount_banner") return "Create urgency with a focused promotional message and conversion action.";
  return "Combine imagery, editorial content, and commerce in a flexible branded section.";
}
