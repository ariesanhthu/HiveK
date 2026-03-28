export type TopPerformerRow = {
  avatar: string;
  name: string;
  handle: string;
  category: string;
  engagement: string;
  engagementPercent: number;
  followers: string;
  trend: "up" | "flat";
};

export const TOP_PERFORMERS: TopPerformerRow[] = [
  {
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    name: "Châu Bùi",
    handle: "@chaubui_",
    category: "Thời trang & Lifestyle",
    engagement: "9.2%",
    engagementPercent: 92,
    followers: "3.4M",
    trend: "up",
  },
  {
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop",
    name: "Quỳnh Anh Shyn",
    handle: "@quynhanhshyn_",
    category: "Làm đẹp & Thời trang",
    engagement: "8.5%",
    engagementPercent: 85,
    followers: "2.8M",
    trend: "up",
  },
  {
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    name: "Khoai Lang Thang",
    handle: "@khoailangthang",
    category: "Du lịch & Ẩm thực",
    engagement: "11.4%",
    engagementPercent: 100,
    followers: "2.1M",
    trend: "up",
  },
  {
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    name: "Duy Luân Dễ Thương",
    handle: "@duyluandethuong",
    category: "Công nghệ",
    engagement: "7.1%",
    engagementPercent: 71,
    followers: "1.2M",
    trend: "flat",
  },
];
