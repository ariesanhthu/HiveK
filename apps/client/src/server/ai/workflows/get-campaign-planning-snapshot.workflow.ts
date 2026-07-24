import { getCampaignPlanningData } from '@/features/campaign-planning/services/campaign-planning-service';
import type { CampaignPlanningSnapshot } from '@/server/ai/types/agent.types';

export async function getCampaignPlanningSnapshotWorkflow(
  campaignId: string,
): Promise<CampaignPlanningSnapshot> {
  const data = getCampaignPlanningData();
  const selectedCampaign = data.campaigns.find((campaign) => campaign.id === campaignId)
    ?? data.campaigns[0];

  return {
    ...data,
    selectedCampaign,
  };
}
