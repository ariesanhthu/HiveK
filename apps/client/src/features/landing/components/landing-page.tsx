import { LazyActiveCampaigns } from '@/components/global/sections/lazy-active-campaigns';
import { LazyCta } from '@/components/global/sections/lazy-cta';
import { LazyPlatformBenefits } from '@/components/global/sections/lazy-platform-benefits';
import { SectionSkeleton } from '@/components/global/sections/section-skeleton';
import { AiHeroSection } from '@/features/landing/components/ai-hero-demo/ai-hero-section';
import { FeatureShowcaseSection } from '@/features/landing/components/sections/feature-showcase-section';
import React from 'react';

export const LandingPage: React.FC = () => {
  return (
    <>
      <AiHeroSection />
      <FeatureShowcaseSection />
      <LazyPlatformBenefits fallback={<SectionSkeleton variant='section' />} />
      {/* Leaderboard (KOL ranking / top performers) temporarily hidden. */}
      <LazyActiveCampaigns fallback={<SectionSkeleton variant='cards' />} />
      <LazyCta fallback={<SectionSkeleton variant='section' />} />
    </>
  );
};
