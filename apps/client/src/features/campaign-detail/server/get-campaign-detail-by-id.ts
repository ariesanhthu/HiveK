import { ACTIVE_CAMPAIGNS } from "@/data/mock-data";
import type { CampaignDetail } from "@/features/campaign-detail/types";

const SUMMER_GLOW: CampaignDetail = {
  id: "summer-glow-skincare",
  title: "Chiến dịch Dưỡng da Mùa hè Toả sáng",
  status: "active",
  externalIdLabel: "Mã chiến dịch: #HIVE-2024-082",
  createdByLabel: "Được tạo bởi Skincare Lab Co.",
  stats: [
    {
      id: "budget",
      label: "Tổng ngân sách",
      value: "$15,000",
      metaLabel: "Đúng tiến độ",
      metaVariant: "success",
      icon: "payments",
    },
    {
      id: "days",
      label: "Ngày còn lại",
      value: "12",
      metaLabel: "Sắp kết thúc",
      metaVariant: "warning",
      icon: "calendar_month",
    },
    {
      id: "reach",
      label: "Tổng tiếp cận",
      value: "1.2M",
      metaLabel: "+12% so với tuần trước",
      metaVariant: "secondary",
      icon: "groups",
    },
    {
      id: "conv",
      label: "Tổng chuyển đổi",
      value: "4.5k",
      metaLabel: "Mục tiêu 5k",
      metaVariant: "success",
      icon: "shopping_cart",
    },
  ],
  kpis: [
    {
      id: "reach-goal",
      label: "Mục tiêu tiếp cận",
      valueLabel: "85%",
      percent: 85,
      strokeClass: "stroke-orange-500",
    },
    {
      id: "ctr",
      label: "CTR trung bình",
      valueLabel: "3.2%",
      percent: 72,
      strokeClass: "stroke-sky-500",
    },
    {
      id: "cvr",
      label: "Tỷ lệ chuyển đổi",
      valueLabel: "1.2%",
      percent: 45,
      strokeClass: "stroke-violet-500",
    },
  ],
  creators: [
    {
      id: "c1",
      name: "Sarah Jenkins",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
      reachLabel: "420k",
      engagementLabel: "4.8%",
      status: "live",
    },
    {
      id: "c2",
      name: "Marcus Chen",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
      reachLabel: "185k",
      engagementLabel: "6.2%",
      status: "pending_post",
    },
    {
      id: "c3",
      name: "Elena Park",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop",
      reachLabel: "310k",
      engagementLabel: "5.1%",
      status: "live",
    },
    {
      id: "c4",
      name: "Jordan Kim",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop",
      reachLabel: "92k",
      engagementLabel: "7.1%",
      status: "pending_post",
    },
    {
      id: "c5",
      name: "Sofia Nguyễn",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop",
      reachLabel: "540k",
      engagementLabel: "4.2%",
      status: "live",
    },
    {
      id: "c6",
      name: "Chris Patel",
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop",
      reachLabel: "128k",
      engagementLabel: "5.9%",
      status: "live",
    },
  ],
  brief: {
    niches: ["Chăm sóc da", "Làm đẹp sạch"],
    platforms: ["instagram", "youtube"],
    audience:
      "Nữ 18–35, Bắc Mỹ, mức độ quan tâm cao đối với sản phẩm hữu cơ.",
    pdfBriefLabel: "Tải brief PDF đầy đủ",
  },
  recentContent: [
    {
      id: "p1",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=120&h=120&fit=crop",
      title: "Reel review serum",
      authorName: "Sarah Jenkins",
      timeLabel: "2 giờ trước",
      state: "pending_review",
    },
    {
      id: "p2",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=120&h=120&fit=crop",
      title: "GRWM routine buổi sáng",
      authorName: "Marcus Chen",
      timeLabel: "Hôm qua",
      state: "approved",
    },
  ],
  totalContentCount: 24,
};

function listItemToDetail(
  id: string,
  title: string,
  category: string,
  priceRange: string,
  image: string
): CampaignDetail {
  return {
    id,
    title,
    status: "active",
    externalIdLabel: `Mã chiến dịch: #HIVE-${id.slice(0, 8).toUpperCase()}`,
    createdByLabel: `Được tạo bởi đối tác ${category}`,
    stats: [
      {
        id: "budget",
        label: "Tổng ngân sách",
        value: priceRange,
        metaLabel: "Đúng tiến độ",
        metaVariant: "success",
        icon: "payments",
      },
      {
        id: "days",
        label: "Ngày còn lại",
        value: "18",
        metaLabel: "Đang mở",
        metaVariant: "secondary",
        icon: "calendar_month",
      },
      {
        id: "reach",
        label: "Tổng tiếp cận",
        value: "890k",
        metaLabel: "+8% so với tuần trước",
        metaVariant: "secondary",
        icon: "groups",
      },
      {
        id: "conv",
        label: "Tổng chuyển đổi",
        value: "2.1k",
        metaLabel: "Đang tăng",
        metaVariant: "success",
        icon: "shopping_cart",
      },
    ],
    kpis: [
      {
        id: "k1",
        label: "Mục tiêu tiếp cận",
        valueLabel: "62%",
        percent: 62,
        strokeClass: "stroke-primary",
      },
      {
        id: "k2",
        label: "CTR trung bình",
        valueLabel: "2.4%",
        percent: 55,
        strokeClass: "stroke-sky-500",
      },
      {
        id: "k3",
        label: "Tỷ lệ chuyển đổi",
        valueLabel: "0.9%",
        percent: 38,
        strokeClass: "stroke-violet-500",
      },
    ],
    creators: [
      {
        id: "x1",
        name: "Alex Rivers",
        avatarUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop",
        reachLabel: "240k",
        engagementLabel: "3.9%",
        status: "live",
      },
      {
        id: "x2",
        name: "Mai Linh Trần",
        avatarUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop",
        reachLabel: "512k",
        engagementLabel: "5.2%",
        status: "pending_post",
      },
    ],
    brief: {
      niches: [category, "Thương hiệu"],
      platforms: ["instagram", "tiktok"],
      audience: `Khán giả phù hợp với ${category.toLowerCase()} và nội dung lối sống.`,
      pdfBriefLabel: "Tải brief PDF đầy đủ",
    },
    recentContent: [
      {
        id: "rx1",
        thumbnailUrl: image,
        title: `${title.split(":")[0]?.trim() ?? title} — Bài đăng ra mắt`,
        authorName: "Alex Rivers",
        timeLabel: "5 giờ trước",
        state: "approved",
      },
    ],
    totalContentCount: 8,
  };
}

const DETAIL_OVERRIDES: Record<string, CampaignDetail> = {
  "summer-glow-skincare": SUMMER_GLOW,
};

export function getCampaignDetailById(id: string): CampaignDetail | null {
  if (DETAIL_OVERRIDES[id]) {
    return DETAIL_OVERRIDES[id];
  }

  const fromList = ACTIVE_CAMPAIGNS.find((c) => c.id === id);
  if (!fromList) {
    return null;
  }

  return listItemToDetail(
    fromList.id,
    fromList.title,
    fromList.category,
    fromList.priceRange,
    fromList.image
  );
}
