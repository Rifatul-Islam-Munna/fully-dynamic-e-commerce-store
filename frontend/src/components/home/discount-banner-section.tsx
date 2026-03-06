import {
  BadgePercent,
  GalleryVerticalEnd,
  PanelsTopLeft,
  Sparkles,
} from "lucide-react";
import { normalizeHomeSectionVariant } from "@/lib/home-section-variants";
import {
  type HomeSection,
  DetailTile,
  MediaFrame,
  resolveSectionCopy,
  SectionCta,
  SectionEyebrow,
  SectionHeading,
  SectionTagRow,
  SupportPanel,
} from "@/components/home/section-primitives";

export function renderDiscountBannerSection(
  section: HomeSection,
  sectionKey: string,
) {
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
              text="Premium savings on select products - limited availability."
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
                  text="Don't miss out - grab these savings while they last."
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

  if (variant === "hero_discount") {
    return (
      <section
        key={sectionKey}
        className="relative overflow-hidden rounded-2xl sm:rounded-[36px]"
        style={{
          backgroundImage: backgroundImageUrl
            ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${backgroundImageUrl}')`
            : "linear-gradient(135deg, #15171b 0%, #2d3748 100%)",
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
