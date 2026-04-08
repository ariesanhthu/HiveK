import { type KolNiche, type KolPlatform } from "@/features/kol-ranking/types";

export type KolSeed = {
  id: string;
  name: string;
  niche: KolNiche;
  platform: KolPlatform;
  followers: number;
  rating: number;
  engagementRate: number;
};

export const KOL_SEEDS: KolSeed[] = [
  {
    id: "kol-001",
    name: "Lê Hạ Anh",
    niche: "Làm đẹp",
    platform: "TikTok",
    followers: 2_430_000,
    rating: 4.93,
    engagementRate: 8.4,
  },
  {
    id: "kol-002",
    name: "Trần Đức Bo",
    niche: "Game",
    platform: "YouTube",
    followers: 1_780_000,
    rating: 4.89,
    engagementRate: 7.8,
  },
  {
    id: "kol-003",
    name: "Hồ Linh",
    niche: "Đời sống",
    platform: "Instagram",
    followers: 956_000,
    rating: 4.86,
    engagementRate: 9.2,
  },
  {
    id: "kol-004",
    name: "Phạm Đức",
    niche: "Công nghệ",
    platform: "YouTube",
    followers: 1_240_000,
    rating: 4.91,
    engagementRate: 6.7,
  },
  {
    id: "kol-005",
    name: "Lê Hana",
    niche: "Thể hình",
    platform: "TikTok",
    followers: 812_000,
    rating: 4.82,
    engagementRate: 10.1,
  },
  {
    id: "kol-006",
    name: "Đỗ Quang",
    niche: "Công nghệ",
    platform: "Instagram",
    followers: 635_000,
    rating: 4.79,
    engagementRate: 7.5,
  },
  {
    id: "kol-007",
    name: "Vũ Nhi",
    niche: "Làm đẹp",
    platform: "Instagram",
    followers: 1_120_000,
    rating: 4.88,
    engagementRate: 8.9,
  },
  {
    id: "kol-008",
    name: "Lê An",
    niche: "Game",
    platform: "TikTok",
    followers: 702_000,
    rating: 4.74,
    engagementRate: 9.8,
  },
  {
    id: "kol-009",
    name: "Bùi Vy",
    niche: "Đời sống",
    platform: "TikTok",
    followers: 2_010_000,
    rating: 4.9,
    engagementRate: 7.2,
  },
  {
    id: "kol-010",
    name: "Mai Tuấn",
    niche: "Thể hình",
    platform: "YouTube",
    followers: 1_580_000,
    rating: 4.85,
    engagementRate: 6.9,
  },
  {
    id: "kol-011",
    name: "Phan Gia",
    niche: "Làm đẹp",
    platform: "YouTube",
    followers: 864_000,
    rating: 4.83,
    engagementRate: 7.7,
  },
  {
    id: "kol-012",
    name: "Châu Minh",
    niche: "Đời sống",
    platform: "Instagram",
    followers: 1_360_000,
    rating: 4.87,
    engagementRate: 8.1,
  },
  {
    id: "kol-013",
    name: "Đăng Khoa",
    niche: "Game",
    platform: "YouTube",
    followers: 2_900_000,
    rating: 4.92,
    engagementRate: 7.1,
  },
  {
    id: "kol-014",
    name: "Trương Lâm",
    niche: "Công nghệ",
    platform: "TikTok",
    followers: 548_000,
    rating: 4.76,
    engagementRate: 9.4,
  },
  {
    id: "kol-015",
    name: "Anh Thư",
    niche: "Thể hình",
    platform: "Instagram",
    followers: 987_000,
    rating: 4.84,
    engagementRate: 8.8,
  },
];
