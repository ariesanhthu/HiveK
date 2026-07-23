export const agenticQueryKeys = {
  all: ['agentic'] as const,
  campaignPlanning: (campaignId: string) =>
    [...agenticQueryKeys.all, 'campaign-planning', campaignId] as const,
  campaignPlan: (campaignId: string) =>
    [...agenticQueryKeys.all, 'campaign-plan', campaignId] as const,
  kolMatching: (campaignId: string) =>
    [...agenticQueryKeys.all, 'kol-matching', campaignId] as const,
  insight: (campaignId: string) => [...agenticQueryKeys.all, 'insight', campaignId] as const,
};
