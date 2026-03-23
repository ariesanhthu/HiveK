import {
  type FollowerRange,
  type KolBadge,
  type KolNiche,
  type KolPlatform,
  type KolRankingFilters,
  type KolRankingItem,
  type KolRankingResponse,
} from "@/features/kol-ranking/types";

type KolSeed = {
  id: string;
  name: string;
  niche: KolNiche;
  platform: KolPlatform;
  followers: number;
  rating: number;
  engagementRate: number;
};

const PAGE_SIZE_DEFAULT = 10;
const SCORE_WEIGHT_RATING = 35;
const SCORE_WEIGHT_ENGAGEMENT = 30;
const SCORE_WEIGHT_FOLLOWERS = 35;
const FOLLOWER_BASE = 1_000;
const LIVE_JITTER_SCALE = 6;

const KOL_SEEDS: KolSeed[] = [
  {
    id: "kol-001",
    name: "Mia Nguyen",
    niche: "Beauty",
    platform: "TikTok",
    followers: 2_430_000,
    rating: 4.93,
    engagementRate: 8.4,
  },
  {
    id: "kol-002",
    name: "Kai Tran",
    niche: "Gaming",
    platform: "YouTube",
    followers: 1_780_000,
    rating: 4.89,
    engagementRate: 7.8,
  },
  {
    id: "kol-003",
    name: "Linh Ho",
    niche: "Lifestyle",
    platform: "Instagram",
    followers: 956_000,
    rating: 4.86,
    engagementRate: 9.2,
  },
  {
    id: "kol-004",
    name: "Duc Pham",
    niche: "Tech",
    platform: "YouTube",
    followers: 1_240_000,
    rating: 4.91,
    engagementRate: 6.7,
  },
  {
    id: "kol-005",
    name: "Hana Le",
    niche: "Fitness",
    platform: "TikTok",
    followers: 812_000,
    rating: 4.82,
    engagementRate: 10.1,
  },
  {
    id: "kol-006",
    name: "Quang Do",
    niche: "Tech",
    platform: "Instagram",
    followers: 635_000,
    rating: 4.79,
    engagementRate: 7.5,
  },
  {
    id: "kol-007",
    name: "Nhi Vu",
    niche: "Beauty",
    platform: "Instagram",
    followers: 1_120_000,
    rating: 4.88,
    engagementRate: 8.9,
  },
  {
    id: "kol-008",
    name: "An Le",
    niche: "Gaming",
    platform: "TikTok",
    followers: 702_000,
    rating: 4.74,
    engagementRate: 9.8,
  },
  {
    id: "kol-009",
    name: "Vy Bui",
    niche: "Lifestyle",
    platform: "TikTok",
    followers: 2_010_000,
    rating: 4.9,
    engagementRate: 7.2,
  },
  {
    id: "kol-010",
    name: "Tuan Mai",
    niche: "Fitness",
    platform: "YouTube",
    followers: 1_580_000,
    rating: 4.85,
    engagementRate: 6.9,
  },
  {
    id: "kol-011",
    name: "Gia Phan",
    niche: "Beauty",
    platform: "YouTube",
    followers: 864_000,
    rating: 4.83,
    engagementRate: 7.7,
  },
  {
    id: "kol-012",
    name: "Minh Chau",
    niche: "Lifestyle",
    platform: "Instagram",
    followers: 1_360_000,
    rating: 4.87,
    engagementRate: 8.1,
  },
  {
    id: "kol-013",
    name: "Khoa Dang",
    niche: "Gaming",
    platform: "YouTube",
    followers: 2_900_000,
    rating: 4.92,
    engagementRate: 7.1,
  },
  {
    id: "kol-014",
    name: "Lam Truong",
    niche: "Tech",
    platform: "TikTok",
    followers: 548_000,
    rating: 4.76,
    engagementRate: 9.4,
  },
  {
    id: "kol-015",
    name: "Thu Anh",
    niche: "Fitness",
    platform: "Instagram",
    followers: 987_000,
    rating: 4.84,
    engagementRate: 8.8,
  },
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 10_000;
  }
  return hash;
}

function toAvatarText(name: string): string {
  const parts = name.split(" ");
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function resolveFollowerRange(followerCount: number): FollowerRange {
  if (followerCount < 100_000) return "0-100k";
  if (followerCount < 500_000) return "100k-500k";
  if (followerCount < 1_000_000) return "500k-1m";
  return "1m+";
}

function formatFollowers(value: number): number {
  return Math.max(10_000, Math.round(value));
}

function getScore(seed: KolSeed): number {
  const normalizedFollowers = Math.log10(seed.followers / FOLLOWER_BASE);
  const score =
    seed.rating * SCORE_WEIGHT_RATING +
    seed.engagementRate * SCORE_WEIGHT_ENGAGEMENT +
    normalizedFollowers * SCORE_WEIGHT_FOLLOWERS;
  return Number(score.toFixed(2));
}

function withLiveJitter(seed: KolSeed, tickBucket: number): KolSeed {
  const noise = (hashSeed(`${seed.id}-${tickBucket}`) % 100) / 100;
  const centeredNoise = noise - 0.5;
  const ratingDelta = centeredNoise * 0.06;
  const engagementDelta = centeredNoise * 0.4;
  const followerDelta = centeredNoise * LIVE_JITTER_SCALE * 100;

  return {
    ...seed,
    rating: Number((seed.rating + ratingDelta).toFixed(2)),
    engagementRate: Number((seed.engagementRate + engagementDelta).toFixed(2)),
    followers: formatFollowers(seed.followers + followerDelta),
  };
}

function resolveBadge(rank: number): KolBadge {
  if (rank <= 3) return "Elite";
  if (rank <= 10) return "Top 10";
  if (rank <= 20) return "Consistent";
  return "Rising";
}

function normalizeFilters(
  partialFilters: Partial<KolRankingFilters>
): KolRankingFilters {
  const safePage =
    partialFilters.page && partialFilters.page > 0 ? partialFilters.page : 1;
  const safePageSize =
    partialFilters.pageSize && partialFilters.pageSize > 0
      ? partialFilters.pageSize
      : PAGE_SIZE_DEFAULT;

  return {
    niche: partialFilters.niche ?? "all",
    platform: partialFilters.platform ?? "all",
    followerRange: partialFilters.followerRange ?? "all",
    search: partialFilters.search?.trim() ?? "",
    page: safePage,
    pageSize: safePageSize,
  };
}

function buildRankedItems(tickBucket: number): KolRankingItem[] {
  const previousTickBucket = tickBucket - 1;
  const previousScoresById = new Map<string, number>();

  for (const seed of KOL_SEEDS) {
    const previousSnapshot = withLiveJitter(seed, previousTickBucket);
    previousScoresById.set(seed.id, getScore(previousSnapshot));
  }

  const currentItems = KOL_SEEDS.map((seed) => {
    const liveSeed = withLiveJitter(seed, tickBucket);
    return {
      ...liveSeed,
      score: getScore(liveSeed),
      avatarText: toAvatarText(seed.name),
    };
  });

  const previousRankById = new Map<string, number>();
  currentItems
    .map((item) => ({
      id: item.id,
      score: previousScoresById.get(item.id) ?? item.score,
    }))
    .sort((left, right) => right.score - left.score)
    .forEach((item, index) => {
      previousRankById.set(item.id, index + 1);
    });

  return currentItems
    .sort((left, right) => right.score - left.score)
    .map((item, index) => {
      const rank = index + 1;
      return {
        id: item.id,
        rank,
        previousRank: previousRankById.get(item.id) ?? rank,
        avatarText: item.avatarText,
        name: item.name,
        niche: item.niche,
        platform: item.platform,
        followers: item.followers,
        rating: item.rating,
        engagementRate: item.engagementRate,
        score: item.score,
        badge: resolveBadge(rank),
        updatedAt: new Date().toISOString(),
      };
    });
}

function applyFilters(
  items: KolRankingItem[],
  filters: KolRankingFilters
): KolRankingItem[] {
  return items.filter((item) => {
    if (filters.niche !== "all" && item.niche !== filters.niche) return false;
    if (filters.platform !== "all" && item.platform !== filters.platform) {
      return false;
    }
    if (
      filters.followerRange !== "all" &&
      resolveFollowerRange(item.followers) !== filters.followerRange
    ) {
      return false;
    }
    if (
      filters.search &&
      !item.name.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}

export function getKolRankingsSnapshot(
  partialFilters: Partial<KolRankingFilters>,
  tickBucket = Math.floor(Date.now() / 3_000)
): KolRankingResponse {
  const filters = normalizeFilters(partialFilters);
  const rankedItems = buildRankedItems(tickBucket);
  const filteredItems = applyFilters(rankedItems, filters);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * filters.pageSize;
  const end = start + filters.pageSize;

  return {
    items: filteredItems.slice(start, end),
    totalItems,
    totalPages,
    page,
    pageSize: filters.pageSize,
    generatedAt: new Date().toISOString(),
  };
}
