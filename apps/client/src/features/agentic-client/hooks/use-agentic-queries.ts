"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCampaignPlanningData } from "@/features/campaign-planning/services/campaign-planning-service";
import { agenticApiClient } from "@/features/agentic-client/api/agentic-api-client";
import { agenticQueryKeys } from "@/features/agentic-client/api/agentic-query-keys";
import type {
  CampaignPlanRequest,
  CampaignPlanningSnapshot,
  ContentValidationRequest,
  GenerateSinglePostRequest,
  KolKocMatchingRequest,
  SaveFeedbackRequest,
} from "@/server/ai/types/agent.types";

function getInitialPlanningSnapshot(campaignId: string): CampaignPlanningSnapshot {
  const data = getCampaignPlanningData();
  return {
    ...data,
    selectedCampaign:
      data.campaigns.find((campaign) => campaign.id === campaignId) ?? data.campaigns[0],
  };
}

export function useAgenticCampaignPlanningSnapshot(campaignId: string) {
  return useQuery({
    queryKey: agenticQueryKeys.campaignPlanning(campaignId),
    queryFn: () => agenticApiClient.getCampaignPlanningSnapshot(campaignId),
    initialData: () => getInitialPlanningSnapshot(campaignId),
  });
}

export function useGenerateCampaignPlanMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CampaignPlanRequest) =>
      agenticApiClient.generateCampaignPlan(campaignId, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(agenticQueryKeys.campaignPlan(campaignId), response);
    },
  });
}

export function useGenerateSinglePostMutation(campaignId: string) {
  return useMutation({
    mutationFn: (payload: GenerateSinglePostRequest) =>
      agenticApiClient.generateSinglePost(campaignId, payload),
  });
}

export function useValidateContentMutation() {
  return useMutation({
    mutationFn: (payload: ContentValidationRequest) =>
      agenticApiClient.validateContent(payload),
  });
}

export function useSaveFeedbackMutation() {
  return useMutation({
    mutationFn: (payload: SaveFeedbackRequest) => agenticApiClient.saveFeedback(payload),
  });
}

export function useMatchKolKocMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: KolKocMatchingRequest) => agenticApiClient.matchKolKoc(payload),
    onSuccess: (response, payload) => {
      queryClient.setQueryData(agenticQueryKeys.kolMatching(payload.campaignId), response);
    },
  });
}
