import { Card, CardContent } from "@/components/ui/card";
import type { KolAnalysisKpi } from "@/features/kol-analysis/types";

type KpiOverviewProps = {
  kpis: KolAnalysisKpi[];
};

export function KpiOverview({ kpis }: KpiOverviewProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-bold text-foreground">KPI Overview</h2>
        <p className="text-sm text-foreground-muted">
          Portfolio-level snapshot converted from the Streamlit dashboard.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardContent className="flex h-full flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  {kpi.label}
                </p>
                <span className="material-symbols-outlined text-lg text-primary" aria-hidden>
                  {kpi.icon}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-foreground">{kpi.value}</div>
              <p className="text-xs leading-5 text-foreground-muted">{kpi.caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

