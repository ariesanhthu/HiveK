'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformNicheAnalytics } from '@/features/kol-analysis/components/platform-niche-analytics';
import { ProfileRadarChart } from '@/features/kol-analysis/components/profile-radar-chart';
import { ScoreDistributionCharts } from '@/features/kol-analysis/components/score-distribution-charts';
import { SelectedProfileCard } from '@/features/kol-analysis/components/selected-profile-card';
import type {
  AudienceTreePoint,
  HistogramBin,
  KolAnalysisProfile,
  NicheEngagementPoint,
  PlatformRiskPoint,
  PlatformScorePoint,
  RadarMetric,
  ScatterPoint,
} from '@/features/kol-analysis/types';

type AnalyticsPanelProps = {
  profiles: KolAnalysisProfile[];
  selectedProfile: KolAnalysisProfile;
  selectedProfileId: string;
  radarMetrics: RadarMetric[];
  scoreHistogram: HistogramBin[];
  controversyHistogram: HistogramBin[];
  platformScores: PlatformScorePoint[];
  nicheEngagement: NicheEngagementPoint[];
  scatterPoints: ScatterPoint[];
  platformRisk: PlatformRiskPoint[];
  audienceTree: AudienceTreePoint[];
  onSelectedProfileChange: (profileId: string) => void;
};

export function AnalyticsPanel({
  profiles,
  selectedProfile,
  selectedProfileId,
  radarMetrics,
  scoreHistogram,
  controversyHistogram,
  platformScores,
  nicheEngagement,
  scatterPoints,
  platformRisk,
  audienceTree,
  onSelectedProfileChange,
}: AnalyticsPanelProps) {
  return (
    <div className='space-y-6'>
      <section className='grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]'>
        <Card>
          <CardHeader className='gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <CardTitle>Radar Profile</CardTitle>
              <CardDescription>
                Normalized component performance on a 0-100 scale.
              </CardDescription>
            </div>
            <label className='flex min-w-56 flex-col gap-1 text-xs font-semibold text-foreground-muted'>
              Select profile
              <select
                value={selectedProfileId}
                onChange={(event) => onSelectedProfileChange(event.target.value)}
                className='rounded-xl border border-primary-soft bg-card px-3 py-2 text-sm font-semibold text-foreground outline-none transition-colors focus:border-primary'
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>
          </CardHeader>
          <CardContent>
            <ProfileRadarChart data={radarMetrics} />
            <p className='mt-2 text-xs text-foreground-muted'>
              Radar excludes KOL Score; it only visualizes atomic scoring components.
            </p>
          </CardContent>
        </Card>

        <SelectedProfileCard profile={selectedProfile} />
      </section>

      <section className='space-y-3'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>Score Distributions</h2>
          <p className='text-sm text-foreground-muted'>
            Distribution and platform risk signals from the mock analysis batch.
          </p>
        </div>
        <ScoreDistributionCharts
          scoreHistogram={scoreHistogram}
          controversyHistogram={controversyHistogram}
          platformRisk={platformRisk}
        />
      </section>

      <section className='space-y-3'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>Platform & Niche Analysis</h2>
          <p className='text-sm text-foreground-muted'>
            Platform averages, niche engagement, engagement quality, and follower distribution.
          </p>
        </div>
        <PlatformNicheAnalytics
          platformScores={platformScores}
          nicheEngagement={nicheEngagement}
          scatterPoints={scatterPoints}
          audienceTree={audienceTree}
        />
      </section>
    </div>
  );
}
