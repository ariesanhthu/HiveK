"use client";

import dynamic from "next/dynamic";

const CampaignPlanningClient = dynamic(
  () =>
    import("@/features/campaign-planning/components/campaign-planning-client").then(
      (mod) => mod.CampaignPlanningClient
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center text-sm font-semibold text-foreground-muted">
        Đang tải campaign planner...
      </div>
    ),
  }
);

export default function CampaignPlanningPage() {
  return <CampaignPlanningClient />;
}
