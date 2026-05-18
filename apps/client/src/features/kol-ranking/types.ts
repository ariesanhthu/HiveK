export const KOL_NICHES = [
  "Làm đẹp",
  "Game",
  "Đời sống",
  "Công nghệ",
  "Thể hình",
] as const;

export const KOL_PLATFORMS = ["TikTok", "Instagram", "YouTube"] as const;

export const FOLLOWER_RANGE_OPTIONS = [
  "all",
  "0-100k",
  "100k-500k",
  "500k-1m",
  "1m+",
] as const;

export const BADGE_TYPES = [
  "Triển vọng",
  "Ổn định",
  "Top 10",
  "Ưu tú",
] as const;

export type KolNiche = (typeof KOL_NICHES)[number];
export type KolPlatform = (typeof KOL_PLATFORMS)[number];
export type FollowerRange = (typeof FOLLOWER_RANGE_OPTIONS)[number];
export type KolBadge = (typeof BADGE_TYPES)[number];

export type KolRankingItem = {
  id: string;
  rank: number;
  previousRank: number;
  avatarText: string;
  avatarUrl: string;
  name: string;
  niche: KolNiche;
  platform: KolPlatform;
  followers: number;
  rating: number;
  engagementRate: number;
  score: number;
  badge: KolBadge;
  updatedAt: string;
};

export type KolRankingFilters = {
  niche: KolNiche | "all";
  platform: KolPlatform | "all";
  followerRange: FollowerRange;
  search: string;
  page: number;
  pageSize: number;
};

export type KolRankingResponse = {
  items: KolRankingItem[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  generatedAt: string;
};
