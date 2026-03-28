"use client";

import React, { useMemo, useState } from "react";
import { CampaignCategoryChips } from "@/features/campaigns/components/campaign-category-chips";
import { CampaignsGrid } from "@/features/campaigns/components/campaigns-grid";
import { CampaignsPageHeader } from "@/features/campaigns/components/campaigns-page-header";
import { CAMPAIGN_FILTER_ALL } from "@/data/mock-data";
import type { CampaignListItem } from "@/features/campaigns/types";

type FilterKey = typeof CAMPAIGN_FILTER_ALL | string;

function collectCategories(items: CampaignListItem[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    set.add(item.category);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "vi"));
}

export type CampaignsListPageProps = {
  campaigns: CampaignListItem[];
};

export function CampaignsListPage({ campaigns }: CampaignsListPageProps) {
  const categories = useMemo(() => collectCategories(campaigns), [campaigns]);
  const [selected, setSelected] = useState<FilterKey>(CAMPAIGN_FILTER_ALL);

  const filtered = useMemo(() => {
    if (selected === CAMPAIGN_FILTER_ALL) {
      return campaigns;
    }
    return campaigns.filter((c) => c.category === selected);
  }, [campaigns, selected]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-8 md:px-10">
      <CampaignsPageHeader />

      <CampaignCategoryChips
        categories={categories}
        selected={selected}
        onSelect={setSelected}
      />

      <CampaignsGrid
        items={filtered}
        getItemHref={(item) => `/campaigns/${item.id}`}
      />

      <p className="text-center text-xs text-muted">
        Hiển thị {filtered.length} / {campaigns.length} chiến dịch
      </p>
    </div>
  );
}
