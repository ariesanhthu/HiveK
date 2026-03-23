import { type KolCandidate, type SocialPlatform } from "@/features/kol-matching/types";

export type KolSearchFiltersState = {
  /** Empty = all platforms */
  platformKeys: SocialPlatform[];
  /** Empty = all niches */
  nicheGroupIds: string[];
  /** Minimum followers (0 = no floor) */
  minFollowers: number;
  /** Minimum engagement rate % */
  minEngagementPercent: number;
};

export const DEFAULT_KOL_SEARCH_FILTERS: KolSearchFiltersState = {
  platformKeys: [],
  nicheGroupIds: [],
  minFollowers: 0,
  minEngagementPercent: 0,
};

export type NicheFilterGroup = {
  id: string;
  label: string;
  keywords: string[];
};

export const NICHE_FILTER_GROUPS: NicheFilterGroup[] = [
  {
    id: "beauty-lifestyle",
    label: "Beauty & Lifestyle",
    keywords: ["beauty", "fashion", "lifestyle"],
  },
  {
    id: "tech-gaming",
    label: "Tech & Gaming",
    keywords: ["tech", "gaming"],
  },
  {
    id: "fitness",
    label: "Fitness",
    keywords: ["fitness"],
  },
];

const FOLLOWER_SLIDER_MAX = 100;

/**
 * Maps slider 0–100 to min followers 0 … 1_500_000 (smooth scale for UX).
 */
export function followerSliderToMinFollowers(sliderValue: number): number {
  const clamped = Math.min(Math.max(sliderValue, 0), FOLLOWER_SLIDER_MAX);
  return Math.round((clamped / FOLLOWER_SLIDER_MAX) * 1_500_000);
}

export function minFollowersToFollowerSlider(minFollowers: number): number {
  if (minFollowers <= 0) return 0;
  return Math.min(
    FOLLOWER_SLIDER_MAX,
    Math.round((minFollowers / 1_500_000) * FOLLOWER_SLIDER_MAX)
  );
}

export function normalizeNiche(value: string): string {
  return value.trim().toLowerCase();
}

function matchesNicheGroups(candidateNiche: string, groupIds: string[]): boolean {
  const normalized = normalizeNiche(candidateNiche);
  return groupIds.some((groupId) => {
    const group = NICHE_FILTER_GROUPS.find((item) => item.id === groupId);
    if (!group) return false;
    return group.keywords.some((keyword) => normalized.includes(keyword));
  });
}

/**
 * Applies search filters to a candidate list (pure, testable).
 */
export function filterKolCandidates(
  candidates: KolCandidate[],
  filters: KolSearchFiltersState
): KolCandidate[] {
  return candidates.filter((candidate) => {
    if (
      filters.platformKeys.length > 0 &&
      !filters.platformKeys.includes(candidate.platform)
    ) {
      return false;
    }

    if (filters.minFollowers > 0 && candidate.followers < filters.minFollowers) {
      return false;
    }

    if (candidate.engagementRate < filters.minEngagementPercent) {
      return false;
    }

    if (filters.nicheGroupIds.length > 0 && !matchesNicheGroups(candidate.niche, filters.nicheGroupIds)) {
      return false;
    }

    return true;
  });
}

export const ENGAGEMENT_THRESHOLD_OPTIONS = [0, 3, 5, 7] as const;

export type EngagementThreshold = (typeof ENGAGEMENT_THRESHOLD_OPTIONS)[number];
