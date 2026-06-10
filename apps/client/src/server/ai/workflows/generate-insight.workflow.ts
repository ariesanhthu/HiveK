import { getCampaignPlanningData } from "@/features/campaign-planning/services/campaign-planning-service";
import { getCacheJson, setCacheJson } from "@/server/cache/agentic-cache";
import { createAgentRunSummary } from "@/server/ai/services/agent-run.service";
import type { CampaignInsightResponse } from "@/server/ai/types/agent.types";

export async function generateInsightWorkflow(
  campaignId: string
): Promise<CampaignInsightResponse> {
  const cacheKey = `agentic:insight:${campaignId}`;
  const cachedInsight = await getCacheJson<CampaignInsightResponse>(cacheKey);
  if (cachedInsight) return cachedInsight;

  const startedAt = Date.now();
  const data = getCampaignPlanningData();
  const selectedCampaign =
    data.campaigns.find((campaign) => campaign.id === campaignId) ?? data.campaigns[0];
  const approvedCount = data.posts.filter((post) => post.status === "approved").length;
  const needsReviewCount = data.posts.filter((post) => post.status === "needs-review").length;

  const response: CampaignInsightResponse = {
    summary: `${selectedCampaign?.name ?? campaignId} has ${approvedCount} approved posts and ${needsReviewCount} posts that still need review in mock data.`,
    whatWorked: [
      "Social proof posts have clearer CTA and lower validation risk.",
      "Timeline mixes awareness, consideration, and conversion angles.",
    ],
    whatDidNotWork: [
      "Some awareness copy still uses generic travel phrases.",
      "Video hook needs stronger first-frame direction.",
    ],
    bestAngle: "Customer proof with concrete itinerary request.",
    weakestAngle: "Generic summer discovery hook.",
    kolPerformanceNotes: [
      "No live KOL performance connected yet; use matching recommendations as planning input.",
    ],
    nextCampaignRecommendations: [
      "Collect edit feedback after each approval to improve brand memory.",
      "Tag every post by funnel stage before publishing.",
    ],
    dataLimitations: [
      "This response uses local mock campaign data until MongoDB/performance events are connected.",
    ],
    agentRun: createAgentRunSummary({
      workflowName: "generate-insight",
      agentName: "insight-agent",
      inputSummary: campaignId,
      outputSummary: "mock insight generated",
      startedAt,
    }),
  };

  await setCacheJson(cacheKey, response);
  return response;
}
