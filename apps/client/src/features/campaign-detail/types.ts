export type CampaignDetailStatus = "active" | "draft" | "closed";

export type CampaignStatMetaVariant = "success" | "warning" | "secondary";

export type CampaignStatCard = {
  id: string;
  label: string;
  value: string;
  metaLabel: string;
  metaVariant: CampaignStatMetaVariant;
  icon: "payments" | "calendar_month" | "groups" | "shopping_cart";
};

export type CampaignKpiDonut = {
  id: string;
  label: string;
  valueLabel: string;
  percent: number;
  /** Tailwind stroke class, e.g. stroke-orange-500 */
  strokeClass: string;
};

export type CreatorRowStatus = "live" | "pending_post";

export type CampaignCreatorRow = {
  id: string;
  name: string;
  avatarUrl: string;
  reachLabel: string;
  engagementLabel: string;
  status: CreatorRowStatus;
};

export type ContentItemState = "pending_review" | "approved";

export type CampaignContentItem = {
  id: string;
  thumbnailUrl: string;
  title: string;
  authorName: string;
  timeLabel: string;
  state: ContentItemState;
};

export type CampaignPlatformKey = "instagram" | "youtube" | "tiktok";

export type CampaignDetail = {
  id: string;
  title: string;
  status: CampaignDetailStatus;
  externalIdLabel: string;
  createdByLabel: string;
  stats: CampaignStatCard[];
  kpis: CampaignKpiDonut[];
  creators: CampaignCreatorRow[];
  brief: {
    niches: string[];
    platforms: CampaignPlatformKey[];
    audience: string;
    pdfBriefLabel: string;
  };
  recentContent: CampaignContentItem[];
  totalContentCount: number;
};
