import {
  FOLLOWER_RANGE_OPTIONS,
  KOL_NICHES,
  KOL_PLATFORMS,
  type FollowerRange,
  type KolBadge,
  type KolNiche,
  type KolPlatform,
  type KolRankingFilters,
  type KolRankingItem,
  type KolRankingResponse,
} from "@/features/kol-ranking/types";
import {
  getKolRankingItemById,
  getKolRankingsSnapshot,
} from "@/features/kol-ranking/server/ranking-dataset";
import {
  backendRequest,
  backendRequestEnvelope,
} from "@/server/backend/backend-client";
import type {
  BackendKolPlatform,
  BackendKolProfile,
  BackendPaginatedMeta,
} from "@/server/backend/backend-types";

export const DEFAULT_RANKING_FILTERS: KolRankingFilters = {
  niche: "all",
  platform: "all",
  followerRange: "all",
  search: "",
  page: 1,
  pageSize: 10,
};

const BACKEND_KOL_LIMIT = 100;

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

function toAvatarText(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]?.toUpperCase() ?? "")
    .join("");
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function scoreValue(scores: BackendKolProfile["scores"], key: string): number | null {
  if (!scores) return null;
  return asNumber(scores[key]);
}

function resolvePrimaryPlatform(profile: BackendKolProfile): BackendKolPlatform | null {
  const platforms = profile.platforms ?? [];
  if (platforms.length === 0) return null;
  return platforms
    .slice()
    .sort((left, right) => (right.followerCount ?? 0) - (left.followerCount ?? 0))[0] ?? null;
}

function resolvePlatform(platform: BackendKolPlatform | null): KolPlatform {
  const text = [
    platform?.platformId,
    platform?.uniqueId,
    platform?.externalId,
    ...(platform?.topTags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("youtube") || text.includes("yt")) return "YouTube";
  if (text.includes("instagram") || text.includes("ig")) return "Instagram";
  return "TikTok";
}

function resolveNiche(profile: BackendKolProfile, platform: BackendKolPlatform | null): KolNiche {
  const text = [
    profile.bio,
    ...(platform?.categories ?? []),
    ...(platform?.topTags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(beauty|makeup|skincare|làm đẹp|my pham|mỹ phẩm|duong da|dưỡng da)/i.test(text)) {
    return "Làm đẹp";
  }
  if (/(game|gaming|esport|esports|valorant|pubg|liên quân)/i.test(text)) {
    return "Game";
  }
  if (/(tech|công nghệ|cong nghe|review|gadget|điện tử|dien tu)/i.test(text)) {
    return "Công nghệ";
  }
  if (/(fitness|gym|workout|thể hình|the hinh|yoga|sức khỏe|suc khoe)/i.test(text)) {
    return "Thể hình";
  }
  return "Đời sống";
}

function resolveBadge(rank: number): KolBadge {
  if (rank <= 3) return "Ưu tú";
  if (rank <= 10) return "Top 10";
  if (rank <= 20) return "Ổn định";
  return "Triển vọng";
}

function resolveFollowerRange(followerCount: number): FollowerRange {
  if (followerCount < 100_000) return "0-100k";
  if (followerCount < 500_000) return "100k-500k";
  if (followerCount < 1_000_000) return "500k-1m";
  return "1m+";
}

function applyFilters(
  items: KolRankingItem[],
  filters: KolRankingFilters
): KolRankingItem[] {
  const search = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.niche !== "all" && item.niche !== filters.niche) return false;
    if (filters.platform !== "all" && item.platform !== filters.platform) return false;
    if (
      filters.followerRange !== "all" &&
      resolveFollowerRange(item.followers) !== filters.followerRange
    ) {
      return false;
    }
    if (search && !item.name.toLowerCase().includes(search)) return false;
    return true;
  });
}

function normalizeFilters(filters: Partial<KolRankingFilters>): KolRankingFilters {
  return {
    ...DEFAULT_RANKING_FILTERS,
    ...filters,
    page: filters.page && filters.page > 0 ? filters.page : DEFAULT_RANKING_FILTERS.page,
    pageSize:
      filters.pageSize && filters.pageSize > 0
        ? Math.min(filters.pageSize, 50)
        : DEFAULT_RANKING_FILTERS.pageSize,
    search: filters.search?.trim() ?? DEFAULT_RANKING_FILTERS.search,
  };
}

function mapBackendKolsToRanking(profiles: BackendKolProfile[]): KolRankingItem[] {
  return profiles
    .map((profile) => {
      const platform = resolvePrimaryPlatform(profile);
      const followers = Math.max(0, Math.round(platform?.followerCount ?? 0));
      const kolScore = scoreValue(profile.scores, "kolScore");
      const engagementQuality = scoreValue(profile.scores, "engagementQuality");
      const rawEngagement = asNumber(platform?.avgEngagement) ?? engagementQuality ?? 0;
      const engagementRate = rawEngagement > 1 ? rawEngagement : rawEngagement * 100;
      const score =
        kolScore ??
        Number(
          (
            Math.log10(Math.max(followers, 1)) * 12 +
            Math.min(engagementRate, 100) * 0.45
          ).toFixed(2)
        );
      const rating = Math.min(5, Math.max(1, 3 + score / 50));
      const name = profile.name?.trim() || platform?.uniqueId?.trim() || "HiveK Creator";

      return {
        id: profile.id,
        rank: 0,
        previousRank: 0,
        avatarText: toAvatarText(name),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        name,
        niche: resolveNiche(profile, platform),
        platform: resolvePlatform(platform),
        followers,
        rating: Number(rating.toFixed(2)),
        engagementRate: Number(Math.max(0, engagementRate).toFixed(1)),
        score: Number(score.toFixed(2)),
        badge: "Triển vọng",
        updatedAt: new Date().toISOString(),
      } satisfies KolRankingItem;
    })
    .sort((left, right) => right.score - left.score)
    .map((item, index) => {
      const rank = index + 1;
      return {
        ...item,
        rank,
        previousRank: rank,
        badge: resolveBadge(rank),
      };
    });
}

async function getBackendKolProfiles(): Promise<BackendKolProfile[]> {
  const envelope = await backendRequestEnvelope<
    BackendKolProfile[],
    BackendPaginatedMeta
  >("/hivek/client/v1/kol-profiles", {
    method: "GET",
    query: {
      limit: BACKEND_KOL_LIMIT,
      sort: "desc",
    },
    cache: "no-store",
  });

  return envelope.data;
}

export async function getKolRankings(
  filters: Partial<KolRankingFilters> = DEFAULT_RANKING_FILTERS
): Promise<KolRankingResponse> {
  const normalizedFilters = normalizeFilters(filters);

  try {
    const profiles = await getBackendKolProfiles();
    const rankedItems = mapBackendKolsToRanking(profiles);
    const filteredItems = applyFilters(rankedItems, normalizedFilters);
    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedFilters.pageSize));
    const page = Math.min(normalizedFilters.page, totalPages);
    const start = (page - 1) * normalizedFilters.pageSize;
    const end = start + normalizedFilters.pageSize;

    return {
      items: filteredItems.slice(start, end),
      totalItems,
      totalPages,
      page,
      pageSize: normalizedFilters.pageSize,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return getKolRankingsSnapshot(normalizedFilters);
  }
}

export async function getKolById(id: string): Promise<KolRankingItem | null> {
  try {
    const profile = await backendRequest<BackendKolProfile>(
      `/hivek/client/v1/kol-profiles/${encodeURIComponent(id)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    return mapBackendKolsToRanking([profile])[0] ?? null;
  } catch {
    return getKolRankingItemById(id);
  }
}
