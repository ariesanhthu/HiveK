import {
  FOLLOWER_RANGE_OPTIONS,
  KOL_NICHES,
  KOL_PLATFORMS,
  type KolRankingFilters,
  type KolRankingResponse,
} from "@/features/kol-ranking/types";
import { getKolRankingsSnapshot } from "@/features/kol-ranking/server/ranking-dataset";

export const DEFAULT_RANKING_FILTERS: KolRankingFilters = {
  niche: "all",
  platform: "all",
  followerRange: "all",
  search: "",
  page: 1,
  pageSize: 10,
};

function toPositiveNumber(
  value: string | null,
  fallbackValue: number,
  maxValue: number
): number {
  if (!value) return fallbackValue;
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) return fallbackValue;
  return Math.min(Math.floor(parsedValue), maxValue);
}

export function parseKolRankingFilters(
  searchParams: URLSearchParams
): KolRankingFilters {
  const nicheParam = searchParams.get("niche");
  const platformParam = searchParams.get("platform");
  const followerRangeParam = searchParams.get("followerRange");

  const niche = KOL_NICHES.includes(nicheParam as (typeof KOL_NICHES)[number])
    ? (nicheParam as (typeof KOL_NICHES)[number])
    : "all";

  const platform = KOL_PLATFORMS.includes(
    platformParam as (typeof KOL_PLATFORMS)[number]
  )
    ? (platformParam as (typeof KOL_PLATFORMS)[number])
    : "all";

  const followerRange = FOLLOWER_RANGE_OPTIONS.includes(
    followerRangeParam as (typeof FOLLOWER_RANGE_OPTIONS)[number]
  )
    ? (followerRangeParam as (typeof FOLLOWER_RANGE_OPTIONS)[number])
    : "all";

  return {
    niche,
    platform,
    followerRange,
    search: searchParams.get("search") ?? "",
    page: toPositiveNumber(searchParams.get("page"), 1, 100),
    pageSize: toPositiveNumber(searchParams.get("pageSize"), 10, 50),
  };
}

export function getKolRankings(
  filters: Partial<KolRankingFilters> = DEFAULT_RANKING_FILTERS
): KolRankingResponse {
  return getKolRankingsSnapshot(filters);
}
