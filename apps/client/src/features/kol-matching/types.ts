export type KolMatchingStep =
  | "find-entry"
  | "agent-processing"
  | "search-results"
  | "kol-comparison";

export type CampaignObjective = "awareness" | "conversion" | "engagement";
export type CreatorType = "kol" | "koc" | "both";
export type SocialPlatform = "tiktok" | "instagram" | "youtube";
export type BudgetTier = "starter" | "growth" | "scale";

export type FindKolEntryInput = {
  campaignOption: string;
  nicheCategory: string;
  summary: string;
  campaignName: string;
  creatorType: CreatorType;
  objective: CampaignObjective;
  targetPlatforms: SocialPlatform[];
  niche: string;
  targetRegion: string;
  budgetTier: BudgetTier;
  minReach: number;
  minCtr: number;
  conversionTarget: number;
  budgetRangeMaxK: number;
  followerRangeMaxK: number;
};

export type AgentStage = {
  id: string;
  label: string;
  detail: string;
};

export type KolCandidate = {
  id: string;
  name: string;
  type: "KOL" | "KOC";
  niche: string;
  platform: SocialPlatform;
  followers: number;
  engagementRate: number;
  fitScore: number;
  estimatedCpaUsd: number;
  avgRoi: number;
  estimatedCostPerPostUsd: number;
};

export type KolComparisonMetric = {
  label: string;
  unit?: string;
  getValue: (candidate: KolCandidate) => number | string;
};

/** Client-side filters for step 3 (search results). */
export type SearchResultsFilterState = {
  /** Empty = all platforms */
  platforms: SocialPlatform[];
  /** Niche category ids from `SEARCH_NICHE_FILTER_OPTIONS` */
  nicheIds: string[];
  /** Minimum followers in thousands (slider) */
  followerMinK: number;
  /** Minimum engagement rate % (0 = no filter) */
  engagementMinPercent: number;
};
