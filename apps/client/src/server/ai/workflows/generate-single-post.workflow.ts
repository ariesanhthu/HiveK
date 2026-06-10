import { getCampaignPlanningData } from "@/features/campaign-planning/services/campaign-planning-service";
import { getCacheJson, setCacheJson } from "@/server/cache/agentic-cache";
import { createAgentRunSummary } from "@/server/ai/services/agent-run.service";
import { validateContentHeuristically } from "@/server/ai/services/content-validation.service";
import type {
  GenerateSinglePostRequest,
  GenerateSinglePostResponse,
} from "@/server/ai/types/agent.types";

function appendInstruction(content: string, instruction?: string): string {
  if (!instruction?.trim()) {
    return `${content}\n\nDat lich tu van de nhan goi y hanh trinh phu hop voi ngan sach cua ban.`;
  }

  return `${content}\n\nGhi chu toi uu: ${instruction.trim()}`;
}

export async function generateSinglePostWorkflow(
  campaignId: string,
  request: GenerateSinglePostRequest
): Promise<GenerateSinglePostResponse> {
  const cacheKey = `agentic:single-post:${campaignId}:${request.stepId}:${request.platform}:${request.angle}:${request.userInstruction ?? ""}`;
  const cachedPost = await getCacheJson<GenerateSinglePostResponse>(cacheKey);
  if (cachedPost) return cachedPost;

  const startedAt = Date.now();
  const data = getCampaignPlanningData();
  const sourcePost = data.posts.find((post) => post.id === request.stepId) ?? data.posts[0];
  const content = appendInstruction(sourcePost?.content ?? "", request.userInstruction);
  const validation = validateContentHeuristically(request.platform, content);
  const response: GenerateSinglePostResponse = {
    stepId: request.stepId,
    hook: content.split(/[.!?\n]/)[0]?.trim() || request.angle,
    content,
    firstComment:
      sourcePost?.firstComment ??
      "Comment keyword HIVE-K de nhan goi y tiep theo.",
    replySuggestions: sourcePost?.suggestedReplies ?? ["Da gui ban nhe", "Team se inbox them"],
    validation,
    agentRun: createAgentRunSummary({
      workflowName: "generate-single-post",
      agentName: "content-agent",
      inputSummary: `${request.stepId}:${request.platform}`,
      outputSummary: validation.finalDecision,
      startedAt,
    }),
  };

  await setCacheJson(cacheKey, response);
  return response;
}
