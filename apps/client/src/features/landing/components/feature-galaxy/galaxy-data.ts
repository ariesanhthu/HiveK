export type GalaxyFeatureId =
  | "ai-matching"
  | "dashboard"
  | "analysis"
  | "campaigns"
  | "ranking";

export type GalaxyFeature = {
  id: GalaxyFeatureId;
  label: string;
  tagline: string;
  /** Short selling points shown in the detail panel of the galaxy section. */
  highlights: string[];
  /** Sub-features rendered as moons orbiting the planet. */
  moons: { label: string; icon: string }[];
  icon: string;
  color: string;
  /** Orbit radius as a % of the galaxy container's half-width. */
  orbitPercent: number;
  size: number;
};

export const GALAXY_FEATURES: GalaxyFeature[] = [
  {
    id: "ai-matching",
    label: "Ghép đôi AI",
    tagline: "Tìm KOL phù hợp nhất bằng AI trong vài giây",
    highlights: [
      "Phân tích 50+ chỉ số của từng creator",
      "Gợi ý KOL theo ngân sách và ngành hàng",
      "Kết quả ghép đôi chỉ trong vài giây",
    ],
    moons: [
      { label: "Lọc theo ngân sách", icon: "tune" },
      { label: "Điểm tương thích", icon: "percent" },
      { label: "Đề xuất top KOL", icon: "star" },
    ],
    icon: "auto_awesome",
    color: "var(--color-tech-blue)",
    orbitPercent: 38,
    size: 64,
  },
  {
    id: "dashboard",
    label: "Bảng điều khiển",
    tagline: "Theo dõi hiệu suất chiến dịch theo thời gian thực",
    highlights: [
      "Số liệu chiến dịch cập nhật thời gian thực",
      "Theo dõi ngân sách, reach và tương tác",
      "Báo cáo trực quan, dễ chia sẻ với đội ngũ",
    ],
    moons: [
      { label: "Số liệu thời gian thực", icon: "monitoring" },
      { label: "Xuất báo cáo", icon: "download" },
    ],
    icon: "dashboard",
    color: "var(--color-primary)",
    orbitPercent: 56,
    size: 60,
  },
  {
    id: "analysis",
    label: "Phân tích KOL",
    tagline: "Chấm điểm uy tín, mức độ rủi ro của từng creator",
    highlights: [
      "Chấm điểm uy tín từng KOL/KOC",
      "Phát hiện follower ảo và rủi ro thương hiệu",
      "So sánh hiệu suất giữa các creator",
    ],
    moons: [
      { label: "Phát hiện follower ảo", icon: "person_off" },
      { label: "Điểm uy tín", icon: "verified" },
    ],
    icon: "monitoring",
    color: "var(--color-creator-purple)",
    orbitPercent: 74,
    size: 58,
  },
  {
    id: "campaigns",
    label: "Quản lý chiến dịch",
    tagline: "Lên lịch, duyệt nội dung và theo dõi tiến độ",
    highlights: [
      "Lên lịch và duyệt nội dung tập trung",
      "Theo dõi tiến độ từng hạng mục",
      "Chi trả an toàn qua cơ chế ký quỹ",
    ],
    moons: [
      { label: "Duyệt nội dung", icon: "fact_check" },
      { label: "Lịch đăng bài", icon: "calendar_month" },
      { label: "Ký quỹ an toàn", icon: "account_balance_wallet" },
    ],
    icon: "campaign",
    color: "var(--color-secondary)",
    orbitPercent: 92,
    size: 60,
  },
  {
    id: "ranking",
    label: "Bảng xếp hạng",
    tagline: "Khám phá top KOL/KOC đang dẫn đầu thị trường",
    highlights: [
      "Top KOL/KOC theo ngành và nền tảng",
      "Xu hướng tăng trưởng cập nhật mỗi tuần",
      "Khám phá những gương mặt mới nổi bật",
    ],
    moons: [
      { label: "Top theo ngành", icon: "category" },
      { label: "Gương mặt mới", icon: "trending_up" },
    ],
    icon: "leaderboard",
    color: "var(--color-success)",
    orbitPercent: 108,
    size: 56,
  },
];
