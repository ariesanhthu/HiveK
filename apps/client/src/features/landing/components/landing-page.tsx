import React from "react";
import { AiHeroSection } from "@/features/landing/components/ai-hero-demo/ai-hero-section";
import { SectionSkeleton } from "@/components/global/sections/section-skeleton";
import { FeatureShowcaseSection } from "@/features/landing/components/sections/feature-showcase-section";
import { LazyPlatformBenefits } from "@/components/global/sections/lazy-platform-benefits";
// [ICP Tutor X] Chiến dịch cũ tạm ẩn — giữ nguyên import để rollback khi cần
// import { LazyActiveCampaigns } from "@/components/global/sections/lazy-active-campaigns";
import { LazyTutorXCampaigns } from "@/components/global/sections/lazy-tutor-x-campaigns";
import { LazyCta } from "@/components/global/sections/lazy-cta";

export const LandingPage: React.FC = () => {
  return (
    <>
      <AiHeroSection />
      <FeatureShowcaseSection />
      <LazyPlatformBenefits fallback={<SectionSkeleton variant="section" />} />
      {/* Leaderboard (KOL ranking / top performers) temporarily hidden. */}
      {/* [ICP Tutor X] Chiến dịch cũ tạm ẩn */}
      {/* <LazyActiveCampaigns fallback={<SectionSkeleton variant="cards" />} /> */}
      <LazyTutorXCampaigns fallback={<SectionSkeleton variant="cards" />} />
      <LazyCta fallback={<SectionSkeleton variant="section" />} />
    </>
  );
};
