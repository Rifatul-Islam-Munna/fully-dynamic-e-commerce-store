"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeroSlideItem = {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonLabel?: string;
};

type HeroSliderProps = {
  slides: HeroSlideItem[];
  variant?: string;
};

export function HeroSlider({ slides, variant = "original" }: HeroSliderProps) {
  const normalizedSlides = useMemo(
    () => slides.filter((slide) => slide.imageUrl.trim()),
    [slides],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (normalizedSlides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % normalizedSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [normalizedSlides.length]);

  if (normalizedSlides.length === 0) {
    return null;
  }

  const resolvedIndex = activeIndex % normalizedSlides.length;
  const activeSlide = normalizedSlides[resolvedIndex];
  const hasCopy = Boolean(
    activeSlide.title?.trim() ||
    activeSlide.subtitle?.trim() ||
    activeSlide.linkUrl?.trim(),
  );
  const isLightCard =
    variant === "bottom_story" || variant === "editorial_frame";
  const slidePositionLabel = `${String(resolvedIndex + 1).padStart(2, "0")} / ${String(normalizedSlides.length).padStart(2, "0")}`;
  const actionHref = activeSlide.linkUrl?.trim();
  const actionLabel = activeSlide.buttonLabel?.trim() || "Explore";

  const renderActionButton = ({
    light = false,
    className,
  }: {
    light?: boolean;
    className?: string;
  } = {}) => {
    if (!actionHref) {
      return null;
    }

    return (
      <Button
        asChild
        variant={light ? "secondary" : "default"}
        className={cn(
          "h-12 rounded-full px-8 font-headline text-xs font-bold uppercase tracking-widest shadow-none transition-all duration-300",
          light ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-on-primary hover:opacity-90",
          className,
        )}
      >
        <Link href={actionHref} className="inline-flex items-center gap-2">
          <span>{actionLabel}</span>
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  };

  const renderCopyBlock = () => {
    if (!hasCopy) {
      return null;
    }

    if (variant === "split_panel") {
      return (
        <div className="w-full max-w-[520px]">
          <div className="rounded-2xl border border-white/12 bg-black/24 p-2 backdrop-blur-md sm:rounded-[30px]">
            <div className="rounded-xl bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(30,41,59,0.84))] px-4 py-5 text-white sm:rounded-[26px] sm:px-6 sm:py-7">
              <div className="flex flex-wrap items-center gap-3 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                {activeSlide.subtitle?.trim() ? (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                    {activeSlide.subtitle}
                  </span>
                ) : null}
                <span>{slidePositionLabel}</span>
              </div>
              <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                {activeSlide.title?.trim() ? (
                  <h2 className="font-headline text-3xl font-extrabold leading-tight tracking-tighter sm:text-4xl lg:text-5xl">
                    {activeSlide.title}
                  </h2>
                ) : null}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {renderActionButton({ light: true })}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (variant === "bottom_story") {
      return (
        <div className="w-full max-w-5xl rounded-2xl border border-border/70 bg-surface/94 p-1.5 shadow-[0_35px_110px_-70px_rgba(15,23,42,0.28)] backdrop-blur-md sm:rounded-[30px] sm:p-2">
          <div className="grid gap-4 rounded-xl bg-surface px-4 py-5 sm:rounded-[26px] sm:px-6 sm:py-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                {activeSlide.subtitle?.trim() ? (
                  <span className="rounded-full bg-surface-container px-3 py-1.5 text-on-surface">
                    {activeSlide.subtitle}
                  </span>
                ) : null}
                <span>{slidePositionLabel}</span>
              </div>
              {activeSlide.title?.trim() ? (
                <h2 className="mt-3 font-headline text-2xl font-extrabold leading-tight tracking-tighter text-primary sm:mt-4 sm:text-4xl lg:text-5xl">
                  {activeSlide.title}
                </h2>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {renderActionButton()}
            </div>
          </div>
        </div>
      );
    }

    if (variant === "center_stage") {
      return (
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/12 bg-black/22 p-1.5 text-white shadow-[0_35px_110px_-70px_rgba(15,23,42,0.52)] backdrop-blur-md sm:rounded-[32px] sm:p-2">
          <div className="rounded-xl bg-[linear-gradient(180deg,rgba(15,23,42,0.56),rgba(15,23,42,0.34))] px-5 py-6 sm:rounded-[28px] sm:px-8 sm:py-8">
            <div className="mx-auto flex max-w-fit flex-wrap items-center justify-center gap-3 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              {activeSlide.subtitle?.trim() ? (
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                  {activeSlide.subtitle}
                </span>
              ) : null}
              <span>{slidePositionLabel}</span>
            </div>
            {activeSlide.title?.trim() ? (
              <h2 className="mt-4 font-headline text-3xl font-extrabold leading-tight tracking-tighter sm:mt-5 sm:text-5xl lg:text-6xl">
                {activeSlide.title}
              </h2>
            ) : null}
            <div className="mt-5 flex flex-wrap justify-center gap-3 sm:mt-6">
              {renderActionButton({ light: true })}
            </div>
          </div>
        </div>
      );
    }

    if (variant === "editorial_frame") {
      return (
        <div className="max-w-xl rounded-2xl border border-black/6 bg-surface/96 p-1.5 shadow-[0_32px_90px_-64px_rgba(15,23,42,0.24)] sm:rounded-[32px] sm:p-2">
          <div className="rounded-xl border border-border/70 bg-surface px-4 py-5 text-on-surface sm:rounded-[28px] sm:px-6 sm:py-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant sm:pb-4">
              {activeSlide.subtitle?.trim() ? (
                <span>{activeSlide.subtitle}</span>
              ) : (
                <span>Featured</span>
              )}
              <span className="rounded-full bg-surface-container px-3 py-1.5 text-on-surface">
                {slidePositionLabel}
              </span>
            </div>
            <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
              {activeSlide.title?.trim() ? (
                <h2 className="text-xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                  {activeSlide.title}
                </h2>
              ) : null}
              {renderActionButton()}
            </div>
          </div>
        </div>
      );
    }

    /* ── minimal_overlay ── */
    if (variant === "minimal_overlay") {
      return (
        <div className="max-w-lg space-y-2 text-white">
          {activeSlide.title?.trim() ? (
            <h2 className="font-headline text-2xl font-extrabold leading-tight tracking-tighter sm:text-3xl lg:text-4xl">
              {activeSlide.title}
            </h2>
          ) : null}
          {activeSlide.subtitle?.trim() ? (
            <p className="text-sm leading-relaxed text-white/80 sm:text-base">
              {activeSlide.subtitle}
            </p>
          ) : null}
          {renderActionButton({
            light: true,
            className: "mt-2 h-9 px-4 text-xs sm:h-10 sm:px-5 sm:text-sm",
          })}
        </div>
      );
    }

    /* ── gradient_banner ── */
    if (variant === "gradient_banner") {
      return (
        <div className="w-full rounded-t-2xl bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-5 pt-10 sm:rounded-t-[28px] sm:px-6 sm:pb-6 sm:pt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              {activeSlide.title?.trim() ? (
                <h2 className="font-headline text-2xl font-extrabold tracking-tighter text-white sm:text-3xl lg:text-4xl">
                  {activeSlide.title}
                </h2>
              ) : null}
              {activeSlide.subtitle?.trim() ? (
                <p className="text-sm text-white/80 sm:text-base">
                  {activeSlide.subtitle}
                </p>
              ) : null}
            </div>
            {renderActionButton({ light: true, className: "h-9 sm:h-10" })}
          </div>
        </div>
      );
    }

    /* ── side_reveal ── */
    if (variant === "side_reveal") {
      return (
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-5 backdrop-blur-lg sm:rounded-[28px] sm:px-6 sm:py-6">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
              {slidePositionLabel}
            </span>
            {activeSlide.title?.trim() ? (
              <h2 className="mt-3 font-headline text-2xl font-extrabold leading-tight tracking-tighter text-white sm:text-3xl lg:text-4xl">
                {activeSlide.title}
              </h2>
            ) : null}
            {activeSlide.subtitle?.trim() ? (
              <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">
                {activeSlide.subtitle}
              </p>
            ) : null}
            <div className="mt-4">
              {renderActionButton({ light: true, className: "h-9 sm:h-10" })}
            </div>
          </div>
        </div>
      );
    }

    /* ── top_bar ── */
    if (variant === "top_bar") {
      return (
        <div className="w-full">
          <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md sm:rounded-[28px] sm:px-6 sm:py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                {activeSlide.title?.trim() ? (
                  <h2 className="truncate font-headline text-xl font-extrabold tracking-tighter text-primary sm:text-2xl">
                    {activeSlide.title}
                  </h2>
                ) : null}
                {activeSlide.subtitle?.trim() ? (
                  <p className="truncate text-sm text-on-surface-variant">
                    {activeSlide.subtitle}
                  </p>
                ) : null}
              </div>
              {renderActionButton({ className: "shrink-0 h-9 sm:h-10" })}
            </div>
          </div>
        </div>
      );
    }

    /* ── pill_float ── */
    if (variant === "pill_float") {
      return (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-full border border-white/15 bg-black/50 px-5 py-3 backdrop-blur-lg sm:px-7 sm:py-4">
            <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
              <div className="min-w-0 flex-1">
                {activeSlide.title?.trim() ? (
                  <p className="truncate font-headline text-base font-extrabold tracking-tighter text-white sm:text-lg">
                    {activeSlide.title}
                  </p>
                ) : null}
                {activeSlide.subtitle?.trim() ? (
                  <p className="truncate text-xs text-white/70 sm:text-sm">
                    {activeSlide.subtitle}
                  </p>
                ) : null}
              </div>
              {renderActionButton({
                light: true,
                className:
                  "shrink-0 h-8 px-4 text-xs sm:h-9 sm:px-5 sm:text-sm",
              })}
            </div>
          </div>
        </div>
      );
    }

    /* ── corner_card ── */
    if (variant === "corner_card") {
      return (
        <div className="w-full max-w-xs">
          <div className="rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-md sm:rounded-[24px] sm:p-5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              {slidePositionLabel}
            </span>
            {activeSlide.title?.trim() ? (
              <h2 className="mt-2 font-headline text-lg font-extrabold leading-snug tracking-tighter text-primary sm:text-xl">
                {activeSlide.title}
              </h2>
            ) : null}
            {activeSlide.subtitle?.trim() ? (
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant sm:text-sm">
                {activeSlide.subtitle}
              </p>
            ) : null}
            <div className="mt-3">
              {renderActionButton({
                className: "h-8 px-3.5 text-xs sm:h-9 sm:px-4 sm:text-sm",
              })}
            </div>
          </div>
        </div>
      );
    }

    /* ── original (default) ── */
    return (
      <div className="max-w-xl space-y-3 text-right text-white">
        {activeSlide.title?.trim() ? (
          <h2 className="font-headline text-3xl font-extrabold leading-tight tracking-tighter sm:text-4xl lg:text-5xl">
            {activeSlide.title}
          </h2>
        ) : null}

        {activeSlide.subtitle?.trim() ? (
          <p className="text-sm leading-6 text-white/88 sm:text-base lg:text-lg">
            {activeSlide.subtitle}
          </p>
        ) : null}

        {renderActionButton()}
      </div>
    );
  };

  /* ── Variant-specific gradient overlays ── */
  const getOverlayClass = () => {
    switch (variant) {
      case "center_stage":
        return "bg-[linear-gradient(180deg,rgba(15,23,42,0.38),rgba(15,23,42,0.48))]";
      case "split_panel":
        return "bg-[linear-gradient(90deg,rgba(15,23,42,0.76),rgba(15,23,42,0.42),rgba(15,23,42,0.12))]";
      case "original":
        return "bg-linear-to-r from-black/58 via-black/20 to-black/22";
      case "bottom_story":
        return "bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.22),rgba(15,23,42,0.56))]";
      case "editorial_frame":
        return "bg-[linear-gradient(90deg,rgba(15,23,42,0.46),rgba(15,23,42,0.18),rgba(15,23,42,0.04))]";
      case "minimal_overlay":
        return "bg-[linear-gradient(0deg,rgba(0,0,0,0.55),rgba(0,0,0,0.1)_50%,transparent)]";
      case "gradient_banner":
        return "bg-transparent";
      case "side_reveal":
        return "bg-[linear-gradient(270deg,rgba(15,23,42,0.6),rgba(15,23,42,0.2),transparent)]";
      case "top_bar":
        return "bg-[linear-gradient(180deg,rgba(15,23,42,0.35),transparent_40%,transparent)]";
      case "pill_float":
        return "bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.35))]";
      case "corner_card":
        return "bg-[linear-gradient(135deg,transparent_40%,rgba(15,23,42,0.35))]";
      default:
        return "bg-linear-to-r from-black/30 via-black/10 to-transparent";
    }
  };

  /* ── Variant-specific content positioning ── */
  const getPositionClass = () => {
    switch (variant) {
      case "center_stage":
      case "pill_float":
        return "items-center justify-center text-center";
      case "original":
        return "items-end justify-end";
      case "bottom_story":
      case "gradient_banner":
        return "items-end justify-center";
      case "top_bar":
        return "items-start justify-center";
      case "corner_card":
        return "items-end justify-end";
      case "side_reveal":
        return "items-center justify-end";
      case "minimal_overlay":
        return "items-end justify-start";
      default:
        return "items-center justify-start";
    }
  };

  return (
    <section className="relative overflow-hidden rounded-sm bg-surface-container-lowest">
      <div
        className={cn(
          "relative",
          variant === "bottom_story"
            ? "min-h-[320px] sm:min-h-[420px] lg:min-h-[540px]"
            : "min-h-[300px] sm:min-h-[420px] lg:min-h-[560px]",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSlide.imageUrl}
          alt={`Slide ${resolvedIndex + 1}`}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className={cn("absolute inset-0", getOverlayClass())} />

        <div
          className={cn(
            "relative z-10 flex min-h-[inherit] p-3 sm:p-6 lg:p-8",
            getPositionClass(),
          )}
        >
          {renderCopyBlock()}
        </div>

        {normalizedSlides.length > 1 ? (
          <>
            <button
              type="button"
              className={cn(
                "absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full p-1.5 transition-colors sm:left-3 sm:p-2",
                isLightCard
                  ? "bg-surface/92 text-on-surface hover:bg-surface"
                  : "bg-black/28 text-white hover:bg-black/44",
              )}
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === 0 ? normalizedSlides.length - 1 : prev - 1,
                )
              }
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              className={cn(
                "absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full p-1.5 transition-colors sm:right-3 sm:p-2",
                isLightCard
                  ? "bg-surface/92 text-on-surface hover:bg-surface"
                  : "bg-black/28 text-white hover:bg-black/44",
              )}
              onClick={() =>
                setActiveIndex((prev) => (prev + 1) % normalizedSlides.length)
              }
              aria-label="Next slide"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}
      </div>

      {normalizedSlides.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-4">
          {normalizedSlides.map((slide, index) => (
            <button
              key={`${slide.imageUrl}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === resolvedIndex
                  ? isLightCard
                    ? "w-7 bg-foreground"
                    : "w-7 bg-white"
                  : isLightCard
                    ? "w-3 bg-foreground/30"
                    : "w-3 bg-white/55",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
