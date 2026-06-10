import { setCacheJson } from "@/server/cache/agentic-cache";
import type {
  SaveFeedbackRequest,
  SaveFeedbackResponse,
} from "@/server/ai/types/agent.types";

export async function saveFeedbackWorkflow(
  request: SaveFeedbackRequest
): Promise<SaveFeedbackResponse> {
  const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await setCacheJson(
    `agentic:feedback:${request.campaignId}:${feedbackId}`,
    {
      ...request,
      feedbackId,
      createdAt: new Date().toISOString(),
    },
    60 * 60 * 24
  );

  return {
    success: true,
    feedbackId,
  };
}
