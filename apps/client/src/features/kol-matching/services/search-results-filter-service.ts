import {
  type KolCandidate,
  type SearchResultsFilterState,
  type SocialPlatform,
} from "@/features/kol-matching/types";

export const SEARCH_PLATFORM_OPTIONS: { id: SocialPlatform; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
];

export type SearchNicheFilterOption = {
  id: string;
  label: string;
  matchers: string[];
};

export const SEARCH_NICHE_FILTER_OPTIONS: SearchNicheFilterOption[] = [
  {
    id: "beauty-lifestyle",
    label: "Làm đẹp & Đời sống",
    matchers: ["làm đẹp", "đời sống", "thời trang", "beauty", "lifestyle", "fashion"],
  },
  {
    id: "tech-gaming",
    label: "Công nghệ & Game",
    matchers: ["công nghệ", "game", "tech", "gaming"],
  },
  {
    id: "health-wellness",
    label: "Thể hình & Sức khỏe",
    matchers: ["thể hình", "sức khỏe", "health", "wellness", "fitness"],
  },
  {
    id: "food-cooking",
    label: "Ẩm thực & Nấu ăn",
    matchers: ["ẩm thực", "nấu ăn", "food", "cooking", "du lịch"],
  },
];

export const ENGAGEMENT_THRESHOLD_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Bất kỳ" },
  { value: 3, label: "Trên 3%" },
  { value: 5, label: "Trên 5%" },
  { value: 7, label: "Trên 7%" },
];

export const FOLLOWER_MIN_K_MAX = 900;
export const FOLLOWER_MIN_K_STEP = 50;

export function getDefaultSearchResultsFilterState(): SearchResultsFilterState {
  return {
    platforms: [],
    nicheIds: [],
    followerMinK: 0,
    engagementMinPercent: 0,
  };
}

function normalizeNiche(value: string): string {
  return value.trim().toLowerCase();
}

function matchesNicheFilters(candidate: KolCandidate, nicheIds: string[]): boolean {
  if (nicheIds.length === 0) return true;
  const nicheNorm = normalizeNiche(candidate.niche);
  return nicheIds.some((nicheId) => {
    const option = SEARCH_NICHE_FILTER_OPTIONS.find((item) => item.id === nicheId);
    if (!option) return false;
    return option.matchers.some((keyword) => nicheNorm.includes(keyword));
  });
}

function matchesPlatformFilters(candidate: KolCandidate, platforms: SocialPlatform[]): boolean {
  if (platforms.length === 0) return true;
  return platforms.includes(candidate.platform);
}

function matchesFollowerMin(candidate: KolCandidate, followerMinK: number): boolean {
  const minFollowers = followerMinK * 1000;
  return candidate.followers >= minFollowers;
}

function matchesEngagementMin(candidate: KolCandidate, engagementMinPercent: number): boolean {
  if (engagementMinPercent <= 0) return true;
  return candidate.engagementRate >= engagementMinPercent;
}

/**
 * Applies search-result filters to a candidate list (pure, testable).
 */
export function filterKolCandidatesBySearchFilters(
  candidates: KolCandidate[],
  filters: SearchResultsFilterState
): KolCandidate[] {
  return candidates.filter(
    (candidate) =>
      matchesPlatformFilters(candidate, filters.platforms) &&
      matchesNicheFilters(candidate, filters.nicheIds) &&
      matchesFollowerMin(candidate, filters.followerMinK) &&
      matchesEngagementMin(candidate, filters.engagementMinPercent)
  );
}
