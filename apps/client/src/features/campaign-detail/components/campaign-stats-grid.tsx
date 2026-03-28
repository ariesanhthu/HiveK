import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CampaignStatCard } from "@/features/campaign-detail/types";

const META_BADGE: Record<
  CampaignStatCard["metaVariant"],
  "success" | "warning" | "secondary"
> = {
  success: "success",
  warning: "warning",
  secondary: "secondary",
};

export type CampaignStatsGridProps = {
  stats: CampaignStatCard[];
};

export function CampaignStatsGrid({ stats }: CampaignStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <Card
          key={s.id}
          className="overflow-hidden rounded-2xl border-primary-soft shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex flex-col gap-3 p-4 md:p-5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {s.label}
              </span>
              <span
                className={cn(
                  "material-symbols-outlined rounded-lg bg-primary-soft p-1.5 text-xl text-primary"
                )}
                aria-hidden
              >
                {s.icon}
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
              {s.value}
            </p>
            <Badge variant={META_BADGE[s.metaVariant]} className="w-fit text-[10px] uppercase">
              {s.metaLabel}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
