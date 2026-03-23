"use client";

import { DashboardKpiCards } from "@/features/business-dashboard/components/dashboard-kpi-cards";
import { DashboardPerformance } from "@/features/business-dashboard/components/dashboard-performance";
import { DashboardRecentActivities } from "@/features/business-dashboard/components/dashboard-recent-activities";
import { DashboardSidebar } from "@/features/business-dashboard/components/dashboard-sidebar";
import { DashboardTopbar } from "@/features/business-dashboard/components/dashboard-topbar";
import { useBusinessDashboardData } from "@/features/business-dashboard/hooks/use-business-dashboard-data";

export function BusinessDashboardPage() {
  const {
    period,
    setPeriod,
    navItems,
    metrics,
    campaignTrend,
    conversionTrend,
    activities,
  } = useBusinessDashboardData();

  const periodLabel = period === "weekly" ? "Weekly Overview" : "Monthly Overview";

  return (
    <main className="flex min-h-screen w-full bg-background-light">
      <DashboardSidebar items={navItems} />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar periodLabel={periodLabel} />

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Business Dashboard
            </h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Manage your creator partnerships and track campaign ROI in real-time.
            </p>
          </header>

          <DashboardKpiCards metrics={metrics} />
          <DashboardPerformance
            campaignTrend={campaignTrend}
            conversionTrend={conversionTrend}
            period={period}
            onPeriodChange={setPeriod}
          />
          <DashboardRecentActivities activities={activities} />
        </section>
      </div>
    </main>
  );
}
