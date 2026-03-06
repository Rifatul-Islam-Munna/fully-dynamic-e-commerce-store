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

export function HeroSlider({
  slides,
  variant = "original",
}: HeroSliderProps) {
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
          "h-10 rounded-full px-5 text-sm font-semibold shadow-none",
          light ? "bg-white text-foreground hover:bg-white/92" : "",
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
          <div className="rounded-[30px] border border-white/12 bg-black/24 p-2 backdrop-blur-md">
            <div className="rounded-[26px] bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(30,41,59,0.84))] px-5 py-6 text-white sm:px-6 sm:py-7">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                  Featured release
                </span>
                <span>{slidePositionLabel}</span>
              </div>
              <div className="mt-5 space-y-4">
                {activeSlide.title?.trim() ? (
                  <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.9rem]">
                    {activeSlide.title}
                  </h2>
                ) : null}
                {activeSlide.subtitle?.trim() ? (
                  <p className="max-w-xl text-sm leading-6 text-white/78 sm:text-base lg:text-lg">
                    {activeSlide.subtitle}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {renderActionButton({ light: true })}
                  <span className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-medium text-white/72">
                    Premium hero
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (variant === "bottom_story") {
      return (
        <div className="w-full max-w-5xl rounded-[30px] border border-border/70 bg-background/94 p-2 shadow-[0_35px_110px_-70px_rgba(15,23,42,0.28)] backdrop-blur-md">
          <div className="grid gap-5 rounded-[26px] bg-background px-5 py-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-6 lg:py-7">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span className="rounded-full bg-muted px-3 py-1.5 text-foreground">
                  Seasonal story
                </span>
                <span>{slidePositionLabel}</span>
              </div>
              {activeSlide.title?.trim() ? (
                <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.6rem]">
                  {activeSlide.title}
                </h2>
              ) : null}
              {activeSlide.subtitle?.trim() ? (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base lg:text-lg">
                  {activeSlide.subtitle}
                </p>
              ) : null}
            </div>
            <div className="space-y-3 lg:text-right">
              {renderActionButton()}
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <span className="rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                  Campaign ready
                </span>
                <span className="rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                  Strong readability
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (variant === "center_stage") {
      return (
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/12 bg-black/22 p-2 text-white shadow-[0_35px_110px_-70px_rgba(15,23,42,0.52)] backdrop-blur-md">
          <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(15,23,42,0.56),rgba(15,23,42,0.34))] px-6 py-8 sm:px-8">
            <div className="mx-auto flex max-w-fit flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-white">
                New collection
              </span>
              <span>{slidePositionLabel}</span>
            </div>
            {activeSlide.title?.trim() ? (
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[3.35rem]">
                {activeSlide.title}
              </h2>
            ) : null}
            {activeSlide.subtitle?.trim() ? (
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/82 sm:text-base lg:text-lg">
                {activeSlide.subtitle}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {renderActionButton({ light: true })}
              <span className="rounded-full border border-white/12 px-3 py-2 text-[11px] font-medium text-white/72">
                Focused landing moment
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (variant === "editorial_frame") {
      return (
        <div className="max-w-xl rounded-[32px] border border-black/6 bg-background/96 p-2 shadow-[0_32px_90px_-64px_rgba(15,23,42,0.24)]">
          <div className="rounded-[28px] border border-border/70 bg-background px-5 py-6 text-foreground sm:px-6 sm:py-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <span>Editorial spotlight</span>
              <span className="rounded-full bg-muted px-3 py-1.5 text-foreground">
                {slidePositionLabel}
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {activeSlide.title?.trim() ? (
                <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                  {activeSlide.title}
                </h2>
              ) : null}
              {activeSlide.subtitle?.trim() ? (
                <p className="text-sm leading-6 text-muted-foreground sm:text-base lg:text-lg">
                  {activeSlide.subtitle}
                </p>
              ) : null}
              {renderActionButton()}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-xl space-y-3 text-right text-white">
        {activeSlide.title?.trim() ? (
          <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
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

  return (
    <section className="relative overflow-hidden rounded-[30px] bg-card">
      <div
        className={cn(
          "relative",
          variant === "bottom_story"
            ? "min-h-[380px] sm:min-h-[460px] lg:min-h-[540px]"
            : "min-h-[360px] sm:min-h-[460px] lg:min-h-[560px]",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSlide.imageUrl}
          alt={`Slide ${resolvedIndex + 1}`}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div
          className={cn(
            "absolute inset-0",
            variant === "center_stage"
              ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.38),rgba(15,23,42,0.48))]"
              : variant === "split_panel"
                ? "bg-[linear-gradient(90deg,rgba(15,23,42,0.76),rgba(15,23,42,0.42),rgba(15,23,42,0.12))]"
              : variant === "original"
                ? "bg-gradient-to-r from-black/58 via-black/20 to-black/22"
                : variant === "bottom_story"
                  ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.22),rgba(15,23,42,0.56))]"
                  : variant === "editorial_frame"
                    ? "bg-[linear-gradient(90deg,rgba(15,23,42,0.46),rgba(15,23,42,0.18),rgba(15,23,42,0.04))]"
                : "bg-gradient-to-r from-black/30 via-black/10 to-transparent",
          )}
        />

        <div
          className={cn(
            "relative z-10 flex min-h-[inherit] p-4 sm:p-6 lg:p-8",
            variant === "center_stage"
              ? "items-center justify-center text-center"
              : variant === "original"
                ? "items-end justify-end"
                : variant === "bottom_story"
                  ? "items-end justify-center"
                  : "items-center justify-start",
          )}
        >
          {renderCopyBlock()}
        </div>

        {normalizedSlides.length > 1 ? (
          <>
            <button
              type="button"
              className={cn(
                "absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 transition-colors",
                isLightCard
                  ? "bg-background/92 text-foreground hover:bg-background"
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
                "absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 transition-colors",
                isLightCard
                  ? "bg-background/92 text-foreground hover:bg-background"
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
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
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
