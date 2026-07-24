import { KolRankingTable } from '@/features/kol-analysis/components/kol-ranking-table';
import { KpiOverview } from '@/features/kol-analysis/components/kpi-overview';
import type { KolAnalysisKpi, KolAnalysisProfile } from '@/features/kol-analysis/types';

type OverviewPanelProps = {
  kpis: KolAnalysisKpi[];
  ranking: KolAnalysisProfile[];
};

export function OverviewPanel({ kpis, ranking }: OverviewPanelProps) {
  return (
    <div className='space-y-6'>
      <KpiOverview kpis={kpis} />
      <KolRankingTable profiles={ranking} />
    </div>
  );
}
