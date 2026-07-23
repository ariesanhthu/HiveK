import {
  KOL_ANALYSIS_NAMES,
  KOL_ANALYSIS_NICHES,
  KOL_ANALYSIS_PLATFORMS,
  KOL_ANALYSIS_SEED,
  KOL_ANALYSIS_WEIGHTS,
} from '@/data/kol-analysis';
import type {
  AudienceTreePoint,
  HistogramBin,
  KolAnalysisDataset,
  KolAnalysisKpi,
  KolAnalysisProfile,
  NicheEngagementPoint,
  PlatformRiskPoint,
  PlatformScorePoint,
  RadarMetric,
  ScatterPoint,
} from '@/features/kol-analysis/types';

const NICHE_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#14b8a6'];

function createSeededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function randomBetween(random: () => number, min: number, max: number) {
  return random() * (max - min) + min;
}

function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(randomBetween(random, min, max + 1));
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function normalizeTo100(value: number, minValue: number, maxValue: number) {
  if (maxValue === minValue) return 0;

  return Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100));
}

export function buildAvatarUrl(name: string) {
  const cleanName = encodeURIComponent(name.replaceAll(' ', '+'));
  return `https://ui-avatars.com/api/?name=${cleanName}&background=0f766e&color=fff&rounded=true`;
}

export function getRadarMetrics(profile: KolAnalysisProfile): RadarMetric[] {
  return [
    {
      metric: 'Sentiment',
      value: round(normalizeTo100(profile.sentimentScoreComponent, 0, 30), 1),
    },
    {
      metric: 'Engagement',
      value: round(normalizeTo100(profile.engagementQuality, 0, 25), 1),
    },
    {
      metric: 'Topic',
      value: round(normalizeTo100(profile.topicAuthority, 0, 1), 1),
    },
    {
      metric: 'Safety',
      value: round(100 - normalizeTo100(profile.controversyRisk, 0, 10), 1),
    },
  ];
}

export function generateKolAnalysisProfiles(size = KOL_ANALYSIS_NAMES.length) {
  const random = createSeededRandom(KOL_ANALYSIS_SEED);

  return Array.from({ length: size }, (_, index): KolAnalysisProfile => {
    const name = KOL_ANALYSIS_NAMES[index % KOL_ANALYSIS_NAMES.length];
    const niche = KOL_ANALYSIS_NICHES[randomInt(random, 0, KOL_ANALYSIS_NICHES.length - 1)];
    const platform =
      KOL_ANALYSIS_PLATFORMS[randomInt(random, 0, KOL_ANALYSIS_PLATFORMS.length - 1)];
    const followers = randomInt(random, 120_000, 4_800_000);
    const engagementRate = round(randomBetween(random, 1.4, 11.8));
    const rating = round(randomBetween(random, 3.8, 4.98));
    const sentimentScoreComponent = round(randomBetween(random, 10, 28));
    const engagementQuality = round(randomBetween(random, 8, 24));
    const topicAuthority = round(randomBetween(random, 0.42, 0.98));
    const controversyRisk = round(randomBetween(random, 0.6, 8.9));

    const sentimentNorm = normalizeTo100(sentimentScoreComponent, 0, 30);
    const engagementNorm = normalizeTo100(engagementQuality, 0, 25);
    const topicNorm = normalizeTo100(topicAuthority, 0, 1);
    const riskSafetyNorm = 100 - normalizeTo100(controversyRisk, 0, 10);
    const kolScore = KOL_ANALYSIS_WEIGHTS.sentiment * sentimentNorm
      + KOL_ANALYSIS_WEIGHTS.engagement * engagementNorm
      + KOL_ANALYSIS_WEIGHTS.topic * topicNorm
      + KOL_ANALYSIS_WEIGHTS.risk * riskSafetyNorm;

    return {
      id: `kol-${String(index + 1).padStart(3, '0')}`,
      name,
      niche,
      platform,
      followers,
      rating,
      engagementRate,
      avatarUrl: buildAvatarUrl(name),
      youtubeHandle: name.toLowerCase().replaceAll(' ', ''),
      sentimentScoreComponent,
      engagementQuality,
      topicAuthority,
      controversyRisk,
      kolScore: round(kolScore),
    };
  });
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildKpis(profiles: KolAnalysisProfile[]): KolAnalysisKpi[] {
  const totalFollowers = profiles.reduce((sum, profile) => sum + profile.followers, 0);
  const avgEngagement = average(profiles.map((profile) => profile.engagementRate));
  const avgKolScore = average(profiles.map((profile) => profile.kolScore));
  const highestTopicAuthority = Math.max(...profiles.map((profile) => profile.topicAuthority));
  const lowestControversy = Math.min(...profiles.map((profile) => profile.controversyRisk));

  return [
    {
      id: 'total-kol',
      label: 'Total KOL/KOC',
      value: String(profiles.length),
      caption: 'Profiles available for ranking and comparison.',
      icon: 'groups',
    },
    {
      id: 'followers',
      label: 'Total Followers',
      value: formatCompactNumber(totalFollowers),
      caption: `${formatNumber(totalFollowers)} combined audience reach.`,
      icon: 'visibility',
    },
    {
      id: 'engagement',
      label: 'Avg Engagement',
      value: `${round(avgEngagement)}%`,
      caption: 'Baseline for campaign response potential.',
      icon: 'favorite',
    },
    {
      id: 'kol-score',
      label: 'Avg KOL Score',
      value: String(round(avgKolScore)),
      caption: 'Weighted creator quality snapshot.',
      icon: 'monitoring',
    },
    {
      id: 'topic-authority',
      label: 'Top Authority',
      value: String(round(highestTopicAuthority)),
      caption: 'Strongest subject-matter consistency.',
      icon: 'psychology',
    },
    {
      id: 'risk',
      label: 'Lowest Risk',
      value: String(round(lowestControversy)),
      caption: 'Safest profile in the current sample.',
      icon: 'verified',
    },
  ];
}

function buildHistogram(values: number[], bins: number): HistogramBin[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min || 1) / bins;
  const counts = Array.from({ length: bins }, () => 0);

  values.forEach((value) => {
    const index = Math.min(bins - 1, Math.floor((value - min) / step));
    counts[index] += 1;
  });

  return counts.map((count, index) => {
    const start = min + index * step;
    const end = start + step;

    return {
      label: `${round(start, 1)}-${round(end, 1)}`,
      count,
    };
  });
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = getKey(item);
    groups[key] = groups[key] ?? [];
    groups[key].push(item);
    return groups;
  }, {});
}

function buildPlatformScores(profiles: KolAnalysisProfile[]): PlatformScorePoint[] {
  return Object.entries(groupBy(profiles, (profile) => profile.platform))
    .map(([platform, platformProfiles]) => ({
      platform,
      kolScore: round(average(platformProfiles.map((profile) => profile.kolScore))),
    }))
    .sort((a, b) => b.kolScore - a.kolScore);
}

function buildNicheEngagement(profiles: KolAnalysisProfile[]): NicheEngagementPoint[] {
  return Object.entries(groupBy(profiles, (profile) => profile.niche)).map(
    ([niche, nicheProfiles], index) => ({
      niche,
      engagementRate: round(average(nicheProfiles.map((profile) => profile.engagementRate))),
      fill: NICHE_COLORS[index % NICHE_COLORS.length],
    }),
  );
}

function buildScatterPoints(profiles: KolAnalysisProfile[]): ScatterPoint[] {
  return profiles.map((profile) => ({
    name: profile.name,
    niche: profile.niche,
    engagementQuality: profile.engagementQuality,
    kolScore: profile.kolScore,
    followers: profile.followers,
  }));
}

function buildPlatformRisk(profiles: KolAnalysisProfile[]): PlatformRiskPoint[] {
  return Object.entries(groupBy(profiles, (profile) => profile.platform)).map(
    ([platform, platformProfiles]) => {
      const values = platformProfiles.map((profile) => profile.controversyRisk);

      return {
        platform,
        min: round(Math.min(...values)),
        avg: round(average(values)),
        max: round(Math.max(...values)),
      };
    },
  );
}

function buildAudienceTree(profiles: KolAnalysisProfile[]): AudienceTreePoint[] {
  return Object.entries(groupBy(profiles, (profile) => profile.platform))
    .map(([platform, platformProfiles]) => ({
      label: platform,
      followers: platformProfiles.reduce((sum, profile) => sum + profile.followers, 0),
      kolScore: round(average(platformProfiles.map((profile) => profile.kolScore))),
    }))
    .sort((a, b) => b.followers - a.followers);
}

export function getKolAnalysisDataset(): KolAnalysisDataset {
  const profiles = generateKolAnalysisProfiles();
  const ranking = [...profiles].sort((a, b) => b.kolScore - a.kolScore);

  return {
    profiles,
    ranking,
    kpis: buildKpis(profiles),
    kolScoreHistogram: buildHistogram(
      profiles.map((profile) => profile.kolScore),
      8,
    ),
    controversyHistogram: buildHistogram(
      profiles.map((profile) => profile.controversyRisk),
      7,
    ),
    platformScores: buildPlatformScores(profiles),
    nicheEngagement: buildNicheEngagement(profiles),
    scatterPoints: buildScatterPoints(profiles),
    platformRisk: buildPlatformRisk(profiles),
    audienceTree: buildAudienceTree(profiles),
  };
}
