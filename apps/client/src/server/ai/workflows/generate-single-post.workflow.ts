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
    return `${content}\n\nBạn muốn cải thiện môn học nào? Chia sẻ với The TutorX để nhận gợi ý điểm bắt đầu phù hợp.`;
  }

  return `${content}\n\nBạn muốn cải thiện môn học nào? The TutorX sẽ cùng bạn xác định bước tiếp theo phù hợp.`;
}

export async function generateSinglePostWorkflow(
  campaignId: string,
  request: GenerateSinglePostRequest
): Promise<GenerateSinglePostResponse> {
  const cacheKey = `agentic:single-post:v2:${campaignId}:${request.stepId}:${request.platform}:${request.angle}:${request.userInstruction ?? ""}`;
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
      "Bình luận môn học và lớp để The TutorX hỗ trợ gợi ý lộ trình.",
    replySuggestions: sourcePost?.suggestedReplies ?? [
      "TutorX đã ghi nhận và sẽ hỗ trợ bạn nhé.",
      "Bạn có thể inbox kết quả học tập gần nhất để được tư vấn kỹ hơn.",
    ],
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
