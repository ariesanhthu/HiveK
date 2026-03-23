import React from "react";
import { HeroSection } from "@/components/global/sections/hero-section";
import { SectionSkeleton } from "@/components/global/sections/section-skeleton";
import { LazyPlatformBenefits } from "@/components/global/sections/lazy-platform-benefits";
import { LazyTopPerformers } from "@/components/global/sections/lazy-top-performers";
import { LazyActiveCampaigns } from "@/components/global/sections/lazy-active-campaigns";
import { LazyCta } from "@/components/global/sections/lazy-cta";

export const LandingPage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <LazyPlatformBenefits fallback={<SectionSkeleton variant="section" />} />
      <LazyTopPerformers fallback={<SectionSkeleton variant="table" />} />
      <LazyActiveCampaigns fallback={<SectionSkeleton variant="cards" />} />
      <LazyCta fallback={<SectionSkeleton variant="section" />} />
    </>
  );
};

