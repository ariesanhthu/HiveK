export type KolAnalysisWeights = {
  sentiment: number;
  engagement: number;
  topic: number;
  risk: number;
};

export type KolAnalysisProfile = {
  id: string;
  name: string;
  niche: string;
  platform: string;
  followers: number;
  rating: number;
  engagementRate: number;
  avatarUrl: string;
  youtubeHandle: string;
  sentimentScoreComponent: number;
  engagementQuality: number;
  topicAuthority: number;
  controversyRisk: number;
  kolScore: number;
};

export type KolAnalysisKpi = {
  id: string;
  label: string;
  value: string;
  caption: string;
  icon: string;
};

export type RadarMetric = {
  metric: string;
  value: number;
};

export type HistogramBin = {
  label: string;
  count: number;
};

export type PlatformScorePoint = {
  platform: string;
  kolScore: number;
};

export type NicheEngagementPoint = {
  niche: string;
  engagementRate: number;
  fill: string;
};

export type ScatterPoint = {
  name: string;
  niche: string;
  engagementQuality: number;
  kolScore: number;
  followers: number;
};

export type PlatformRiskPoint = {
  platform: string;
  min: number;
  avg: number;
  max: number;
};

export type AudienceTreePoint = {
  label: string;
  followers: number;
  kolScore: number;
};

export type KolAnalysisDataset = {
  profiles: KolAnalysisProfile[];
  ranking: KolAnalysisProfile[];
  kpis: KolAnalysisKpi[];
  kolScoreHistogram: HistogramBin[];
  controversyHistogram: HistogramBin[];
  platformScores: PlatformScorePoint[];
  nicheEngagement: NicheEngagementPoint[];
  scatterPoints: ScatterPoint[];
  platformRisk: PlatformRiskPoint[];
  audienceTree: AudienceTreePoint[];
};
