import {
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

export function renderCustomBannerSection(
  section: HomeSection,
  sectionKey: string,
) {
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
          backgroundImage: backgroundImageUrl
            ? `url('${backgroundImageUrl}')`
            : undefined,
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
                title="Featured highlight"
                text="Explore this curated selection of our finest products and deals."
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
                  title="Quality guaranteed"
                  text="Every item is carefully selected and quality-checked for you."
                  className="bg-muted/18"
                />
                <DetailTile
                  icon={Sparkles}
                  title="Trusted selection"
                  text="Shop with confidence from our curated catalog of top-rated products."
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
                  title="What our customers say"
                  text="Thousands of happy customers trust us for quality and value."
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
            <SectionEyebrow
              label="Featured section"
              secondary={subtitle}
              inverse
            />
            <div className="mt-5 space-y-5">
              <SectionHeading title={title} copy={sectionCopy} inverse />
              <DetailTile
                icon={PanelsTopLeft}
                title="Premium collection"
                text="Discover our most sought-after items, expertly curated for you."
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
              title="Trending now"
              text="Explore what's popular - fresh picks and bestsellers updated regularly."
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
          backgroundImage: backgroundImageUrl
            ? `url('${backgroundImageUrl}')`
            : undefined,
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

  if (variant === "info_strip") {
    return (
      <section
        key={sectionKey}
        className="rounded-2xl border border-border/70 bg-background p-3 sm:rounded-[28px] sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {hasImage ? (
            <MediaFrame
              src={imageUrl}
              alt={title}
              className="h-16 w-24 shrink-0 rounded-xl object-cover sm:h-20 sm:w-28"
              frameClassName="rounded-xl shrink-0"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
              <Sparkles className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            {subtitle ? (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
            <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {title}
            </h2>
            {sectionCopy ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {sectionCopy}
              </p>
            ) : null}
          </div>
          <SectionCta href={section.buttonUrl} label={ctaLabel} />
        </div>
      </section>
    );
  }

  return (
    <section
      key={sectionKey}
      className="rounded-2xl bg-primary/5 p-3 sm:rounded-[38px] sm:p-8"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-5">
          <SectionEyebrow label="Featured section" secondary={subtitle} />
          <SectionHeading title={title} copy={sectionCopy} />
          <SectionCta href={section.buttonUrl} label={ctaLabel} />
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
