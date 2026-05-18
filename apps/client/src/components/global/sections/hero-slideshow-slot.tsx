"use client";

import dynamic from "next/dynamic";

const HeroCardSlideshow = dynamic(
  () =>
    import("@/features/landing/components/hero-card-slideshow").then((m) => ({
      default: m.HeroCardSlideshow,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto min-h-120 w-full max-w-88 animate-pulse rounded-3xl border border-primary-soft bg-muted/50 sm:max-w-md lg:max-w-lg"
        aria-hidden
      />
    ),
  }
);

export function HeroSlideshowSlot() {
  return <HeroCardSlideshow />;
}
