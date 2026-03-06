"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type HeroSlideItem = {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonLabel?: string;
};

export function HeroSlider({ slides }: { slides: HeroSlideItem[] }) {
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

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60">
      <div className="relative min-h-[360px] sm:min-h-[460px] lg:min-h-[560px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSlide.imageUrl}
          alt={`Slide ${resolvedIndex + 1}`}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className={`absolute inset-0 ${
            hasCopy
              ? "bg-gradient-to-r from-black/70 via-black/35 to-black/15"
              : "bg-black/25"
          }`}
        />

        <div className="relative z-10 flex min-h-[360px] items-end justify-end p-4 sm:min-h-[460px] sm:p-6 lg:min-h-[560px] lg:p-10">
          {hasCopy ? (
            <div className="max-w-xl space-y-3 text-right">
              {activeSlide.title?.trim() ? (
                <h2 className="text-xl font-bold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.6)] sm:text-3xl lg:text-4xl">
                  {activeSlide.title}
                </h2>
              ) : null}
              {activeSlide.subtitle?.trim() ? (
                <p className="text-sm text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,.6)] sm:text-base lg:text-lg">
                  {activeSlide.subtitle}
                </p>
              ) : null}
              {activeSlide.linkUrl?.trim() ? (
                <Button
                  asChild
                  variant="default"
                  className="mt-2 h-10 rounded-full px-5 text-sm font-semibold shadow-none"
                >
                  <Link
                    href={activeSlide.linkUrl}
                    className="inline-flex items-center gap-2"
                  >
                    <span>{activeSlide.buttonLabel?.trim() || "Explore"}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {normalizedSlides.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/40 bg-black/25 p-2 text-white transition-colors hover:bg-black/45"
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
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/40 bg-black/25 p-2 text-white transition-colors hover:bg-black/45"
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
              className={`h-1.5 rounded-full transition-all ${
                index === resolvedIndex ? "w-7 bg-white" : "w-3 bg-white/55"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
