export type CampaignStatus = "active" | "draft" | "closed";

export type CampaignListItem = {
  id: string;
  image: string;
  category: string;
  title: string;
  priceRange: string;
  status: CampaignStatus;
};
