import { getAgenticApiUrl } from '@/features/agentic-client/api/agentic-api-config';
import type {
  CampaignInsightResponse,
  CampaignPlanningSnapshot,
  CampaignPlanRequest,
  CampaignPlanResponse,
  ContentValidationRequest,
  ContentValidationResult,
  GenerateSinglePostRequest,
  GenerateSinglePostResponse,
  KolKocMatchingRequest,
  KolKocMatchingResponse,
  SaveFeedbackRequest,
  SaveFeedbackResponse,
} from '@/server/ai/types/agent.types';

async function requestJson<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(getAgenticApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Agentic request failed with ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export const agenticApiClient = {
  getCampaignPlanningSnapshot(campaignId: string): Promise<CampaignPlanningSnapshot> {
    return requestJson<CampaignPlanningSnapshot>(
      `/campaigns/${campaignId}/planning`,
      { method: 'GET' },
    );
  },

  generateCampaignPlan(
    campaignId: string,
    payload: CampaignPlanRequest,
  ): Promise<CampaignPlanResponse> {
    return requestJson<CampaignPlanResponse>(
      `/campaigns/${campaignId}/generate-plan`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  generateSinglePost(
    campaignId: string,
    payload: GenerateSinglePostRequest,
  ): Promise<GenerateSinglePostResponse> {
    return requestJson<GenerateSinglePostResponse>(
      `/campaigns/${campaignId}/generate-post`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  validateContent(payload: ContentValidationRequest): Promise<ContentValidationResult> {
    return requestJson<ContentValidationResult>('/validation/content', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  matchKolKoc(payload: KolKocMatchingRequest): Promise<KolKocMatchingResponse> {
    return requestJson<KolKocMatchingResponse>('/matching/kol-koc', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  saveFeedback(payload: SaveFeedbackRequest): Promise<SaveFeedbackResponse> {
    return requestJson<SaveFeedbackResponse>('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  generateInsight(campaignId: string): Promise<CampaignInsightResponse> {
    return requestJson<CampaignInsightResponse>(
      `/campaigns/${campaignId}/insights`,
      { method: 'POST' },
    );
  },
};
