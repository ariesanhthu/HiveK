import React from "react";
import { CampaignDetailHeader } from "@/features/campaign-detail/components/campaign-detail-header";
import { CampaignStatsGrid } from "@/features/campaign-detail/components/campaign-stats-grid";
import { CampaignKpiSection } from "@/features/campaign-detail/components/campaign-kpi-section";
import { CampaignActiveCreatorsTable } from "@/features/campaign-detail/components/campaign-active-creators-table";
import { CampaignBriefCard } from "@/features/campaign-detail/components/campaign-brief-card";
import { CampaignRecentContentList } from "@/features/campaign-detail/components/campaign-recent-content-list";
import type { CampaignDetail } from "@/features/campaign-detail/types";

export type CampaignDetailViewProps = {
  detail: CampaignDetail;
};

export function CampaignDetailView({ detail }: CampaignDetailViewProps) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 pb-16 pt-8 md:px-10">
      <CampaignDetailHeader
        title={detail.title}
        status={detail.status}
        externalIdLabel={detail.externalIdLabel}
        createdByLabel={detail.createdByLabel}
      />

      <CampaignStatsGrid stats={detail.stats} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <CampaignKpiSection kpis={detail.kpis} />
          <CampaignActiveCreatorsTable creators={detail.creators} />
        </div>
        <aside className="space-y-6 lg:col-span-4">
          <CampaignBriefCard brief={detail.brief} />
          <CampaignRecentContentList
            items={detail.recentContent}
            totalContentCount={detail.totalContentCount}
          />
        </aside>
      </div>
    </div>
  );
}
