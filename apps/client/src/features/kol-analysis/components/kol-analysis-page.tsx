"use client";

import { DashboardSidebar } from "@/features/business-dashboard/components/dashboard-sidebar";
import { useBusinessNavItems } from "@/features/business-dashboard/hooks/use-business-nav-items";
import { AnalyticsPanel } from "@/features/kol-analysis/components/analytics-panel";
import { KolAnalysisHeader } from "@/features/kol-analysis/components/kol-analysis-header";
import { KolAnalysisTabs } from "@/features/kol-analysis/components/kol-analysis-tabs";
import { OverviewPanel } from "@/features/kol-analysis/components/overview-panel";
import { PipelineGuidePanel } from "@/features/kol-analysis/components/pipeline-guide-panel";
import { useKolAnalysis } from "@/features/kol-analysis/hooks/use-kol-analysis";

export function KolAnalysisPage() {
  const navItems = useBusinessNavItems();
  const {
    activeTab,
    setActiveTab,
    profiles,
    ranking,
    kpis,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    radarMetrics,
    kolScoreHistogram,
    controversyHistogram,
    platformScores,
    nicheEngagement,
    scatterPoints,
    platformRisk,
    audienceTree,
  } = useKolAnalysis();

  return (
    <main className="flex min-h-screen w-full bg-background-light">
      <DashboardSidebar items={navItems} />

      <div className="flex min-w-0 flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 md:px-6 lg:px-8">
          <KolAnalysisHeader />
          <KolAnalysisTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "overview" ? (
            <OverviewPanel kpis={kpis} ranking={ranking} />
          ) : null}

          {activeTab === "analytics" ? (
            <AnalyticsPanel
              profiles={profiles}
              selectedProfile={selectedProfile}
              selectedProfileId={selectedProfileId}
              radarMetrics={radarMetrics}
              scoreHistogram={kolScoreHistogram}
              controversyHistogram={controversyHistogram}
              platformScores={platformScores}
              nicheEngagement={nicheEngagement}
              scatterPoints={scatterPoints}
              platformRisk={platformRisk}
              audienceTree={audienceTree}
              onSelectedProfileChange={setSelectedProfileId}
            />
          ) : null}

          {activeTab === "pipeline" ? <PipelineGuidePanel /> : null}
        </section>
      </div>
    </main>
  );
}

