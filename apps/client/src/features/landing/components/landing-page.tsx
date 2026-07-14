import React from "react";
import { AiHeroSection } from "@/features/landing/components/ai-hero-demo/ai-hero-section";
import { SectionSkeleton } from "@/components/global/sections/section-skeleton";
import { FeatureShowcaseSection } from "@/features/landing/components/sections/feature-showcase-section";
import { LazyPlatformBenefits } from "@/components/global/sections/lazy-platform-benefits";
import { LazyActiveCampaigns } from "@/components/global/sections/lazy-active-campaigns";
import { LazyCta } from "@/components/global/sections/lazy-cta";

export const LandingPage: React.FC = () => {
  return (
    <>
      <AiHeroSection />
      <FeatureShowcaseSection />
      <LazyPlatformBenefits fallback={<SectionSkeleton variant="section" />} />
      {/* Leaderboard (KOL ranking / top performers) temporarily hidden. */}
      <LazyActiveCampaigns fallback={<SectionSkeleton variant="cards" />} />
      <LazyCta fallback={<SectionSkeleton variant="section" />} />
    </>
  );
};
