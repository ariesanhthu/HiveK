import { MyCampaignsPage } from "@/features/ambassador-campaigns/components/my-campaigns-page";
import { getAmbassadorCampaigns, getAmbassadorMetrics } from "@/features/ambassador-campaigns/server/get-ambassador-campaigns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Campaigns | Ambassador Workspace",
  description: "Manage and track your ongoing brand collaborations.",
};

export default async function AmbassadorCampaignsRoute() {
  const [campaigns, metrics] = await Promise.all([
    getAmbassadorCampaigns(),
    getAmbassadorMetrics(),
  ]);

  return <MyCampaignsPage campaigns={campaigns} metrics={metrics} />;
}
