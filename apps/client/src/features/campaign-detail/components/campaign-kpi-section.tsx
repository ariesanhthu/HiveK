import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CampaignKpiDonut } from "@/features/campaign-detail/components/campaign-kpi-donut";
import type { CampaignKpiDonut as KpiModel } from "@/features/campaign-detail/types";

export type CampaignKpiSectionProps = {
  kpis: KpiModel[];
};

export function CampaignKpiSection({ kpis }: CampaignKpiSectionProps) {
  return (
    <Card className="rounded-2xl border-primary-soft shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-primary-soft/60 py-4">
        <h2 className="text-lg font-bold text-foreground">KPI Performance</h2>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          View Analytics
        </Link>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-center gap-8 py-8 md:justify-around">
        {kpis.map((k) => (
          <CampaignKpiDonut
            key={k.id}
            label={k.label}
            valueLabel={k.valueLabel}
            percent={k.percent}
            strokeClass={k.strokeClass}
          />
        ))}
      </CardContent>
    </Card>
  );
}
