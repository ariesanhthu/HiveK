import { AMBASSADOR_CAMPAIGNS, AMBASSADOR_METRICS } from "@/data/mock-data";

export async function getAmbassadorCampaigns() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return AMBASSADOR_CAMPAIGNS;
}

export async function getAmbassadorMetrics() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return AMBASSADOR_METRICS;
}
