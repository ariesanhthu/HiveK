import React from "react";
import { CampaignCard } from "@/features/campaigns/components/campaign-card";
import type { CampaignListItem } from "@/features/campaigns/types";

export type CampaignsGridProps = {
  items: CampaignListItem[];
  getItemHref?: (item: CampaignListItem) => string | undefined;
};

export function CampaignsGrid({ items, getItemHref }: CampaignsGridProps) {
  if (items.length === 0) {
    return (
      <div
        className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/30 px-6 py-16 text-center transition-all animate-in fade-in duration-500"
        role="status"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <span className="material-symbols-outlined text-3xl text-muted-foreground">search_off</span>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">Không tìm thấy chiến dịch</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Không có chiến dịch nào khớp với bộ lọc hiện tại. Thử chọn &quot;Tất cả&quot; hoặc một danh mục khác để xem thêm.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.id}>
          <CampaignCard {...item} href={getItemHref?.(item)} />
        </li>
      ))}
    </ul>
  );
}
