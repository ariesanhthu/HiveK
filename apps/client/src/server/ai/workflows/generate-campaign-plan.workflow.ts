import { getCampaignPlanningData } from "@/features/campaign-planning/services/campaign-planning-service";
import type { CampaignPost } from "@/features/campaign-planning/types/campaign-planning";
import { getCacheJson, setCacheJson } from "@/server/cache/agentic-cache";
import { createAgentRunSummary } from "@/server/ai/services/agent-run.service";
import { validateContentHeuristically } from "@/server/ai/services/content-validation.service";
import type {
  CampaignPlanRequest,
  CampaignPlanResponse,
  CampaignPlanStep,
  CampaignStepStatus,
  FunnelStage,
} from "@/server/ai/types/agent.types";

function toCampaignStepStatus(status: CampaignPost["status"]): CampaignStepStatus {
  if (status === "needs-review") return "draft";
  return status;
}

function getFunnelStage(post: CampaignPost): FunnelStage {
  const goal = post.goal.toLowerCase();
  if (goal.includes("chuyen") || goal.includes("doi") || goal.includes("conversion")) {
    return "conversion";
  }
  if (goal.includes("tin") || goal.includes("review")) return "consideration";
  return "awareness";
}

function getHook(content: string): string {
  return content.split(/[.!?\n]/)[0]?.trim() || content.slice(0, 72);
}

function toPlanStep(post: CampaignPost): CampaignPlanStep {
  const validation = validateContentHeuristically(post.platform, post.content);

  return {
    stepId: post.id,
    dayIndex: post.day,
    platform: post.platform,
    funnelStage: getFunnelStage(post),
    goal: post.goal,
    angle: post.title,
    hook: getHook(post.content),
    contentPreview: post.content.slice(0, 120),
    fullContent: post.content,
    firstComment: post.firstComment,
    replySuggestions: post.suggestedReplies,
    cta: post.firstComment,
    riskLevel: validation.riskLevel,
    status: toCampaignStepStatus(post.status),
  };
}

export async function generateCampaignPlanWorkflow(
  campaignId: string,
  request: CampaignPlanRequest
): Promise<CampaignPlanResponse> {
  const cacheKey = `agentic:campaign-plan:${campaignId}:${request.days}:${request.platforms.join("-")}:${request.mode}`;

  if (!request.forceRefresh) {
    const cachedPlan = await getCacheJson<CampaignPlanResponse>(cacheKey);
    if (cachedPlan) return cachedPlan;
  }

  const startedAt = Date.now();
  const data = getCampaignPlanningData();
  const selectedCampaign =
    data.campaigns.find((campaign) => campaign.id === campaignId) ?? data.campaigns[0];
  const steps = data.posts
    .filter((post) => post.day <= request.days)
    .filter((post) => request.platforms.includes(post.platform))
    .map(toPlanStep);

  const response: CampaignPlanResponse = {
    campaignId: selectedCampaign?.id ?? campaignId,
    strategySummary:
      selectedCampaign?.description ??
      "Mock strategy generated from local campaign planning data.",
    steps,
    agentRun: createAgentRunSummary({
      workflowName: "generate-campaign-plan",
      agentName: "root-agent",
      inputSummary: `${request.days} days for ${request.platforms.join(",")}`,
      outputSummary: `${steps.length} steps generated`,
      startedAt,
    }),
  };

  await setCacheJson(cacheKey, response);
  return response;
}
