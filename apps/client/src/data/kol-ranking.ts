import { type KolNiche, type KolPlatform } from "@/features/kol-ranking/types";

export type KolSeed = {
  id: string;
  name: string;
  niche: KolNiche;
  platform: KolPlatform;
  followers: number;
  rating: number;
  engagementRate: number;
  avatarUrl: string;
  youtubeHandle: string;
};

export const KOL_SEEDS: KolSeed[] = [
  {
    id: "kol-001",
    name: "MixiGaming",
    niche: "Game",
    platform: "YouTube",
    followers: 8_220_000,
    rating: 4.93,
    engagementRate: 8.4,
    avatarUrl: "",
    youtubeHandle: "mixigaming3con",
  },
  {
    id: "kol-002",
    name: "Tinh Tế",
    niche: "Công nghệ",
    platform: "YouTube",
    followers: 3_200_000,
    rating: 4.89,
    engagementRate: 7.8,
    avatarUrl: "",
    youtubeHandle: "tinhte",
  },
  {
    id: "kol-003",
    name: "Giang Ơi",
    niche: "Đời sống",
    platform: "YouTube",
    followers: 2_180_000,
    rating: 4.91,
    engagementRate: 9.2,
    avatarUrl: "",
    youtubeHandle: "GiangOi",
  },
  {
    id: "kol-004",
    name: "Khoai Lang Thang",
    niche: "Đời sống",
    platform: "YouTube",
    followers: 2_650_000,
    rating: 4.86,
    engagementRate: 10.1,
    avatarUrl: "",
    youtubeHandle: "Khoailangthang",
  },
  {
    id: "kol-005",
    name: "Chi Pu",
    niche: "Làm đẹp",
    platform: "YouTube",
    followers: 3_800_000,
    rating: 4.88,
    engagementRate: 6.7,
    avatarUrl: "",
    youtubeHandle: "chipu",
  },
  {
    id: "kol-006",
    name: "Chloe Nguyễn",
    niche: "Làm đẹp",
    platform: "YouTube",
    followers: 1_300_000,
    rating: 4.82,
    engagementRate: 7.5,
    avatarUrl: "",
    youtubeHandle: "chloenguyen",
  },
  {
    id: "kol-007",
    name: "Vật Vờ Studio",
    niche: "Công nghệ",
    platform: "YouTube",
    followers: 2_050_000,
    rating: 4.79,
    engagementRate: 8.9,
    avatarUrl: "",
    youtubeHandle: "vatvo",
  },
  {
    id: "kol-008",
    name: "Sun HT",
    niche: "Thể hình",
    platform: "YouTube",
    followers: 1_200_000,
    rating: 4.84,
    engagementRate: 9.8,
    avatarUrl: "",
    youtubeHandle: "SunHT",
  },
  {
    id: "kol-009",
    name: "Ninh Tito",
    niche: "Thể hình",
    platform: "YouTube",
    followers: 1_580_000,
    rating: 4.9,
    engagementRate: 7.2,
    avatarUrl: "",
    youtubeHandle: "NinhTito",
  },
  {
    id: "kol-010",
    name: "An Phương",
    niche: "Đời sống",
    platform: "YouTube",
    followers: 987_000,
    rating: 4.85,
    engagementRate: 6.9,
    avatarUrl: "",
    youtubeHandle: "AnPhuong",
  },
];
