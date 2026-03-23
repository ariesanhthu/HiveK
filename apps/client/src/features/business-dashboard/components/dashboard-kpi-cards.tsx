import { type DashboardMetric } from "@/features/business-dashboard/types";

type DashboardKpiCardsProps = {
  metrics: DashboardMetric[];
};

export function DashboardKpiCards({ metrics }: DashboardKpiCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.id}
          className="rounded-2xl border border-primary-soft bg-card p-4 transition-colors hover:bg-primary-soft"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground-muted">{metric.label}</p>
            <span className="material-symbols-outlined text-base text-primary">{metric.icon}</span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{metric.value}</p>
          <p
            className={`mt-1 text-xs font-semibold ${
              metric.trendDirection === "up" ? "text-success" : "text-primary"
            }`}
          >
            {metric.trendValue}
          </p>
        </article>
      ))}
    </section>
  );
}
