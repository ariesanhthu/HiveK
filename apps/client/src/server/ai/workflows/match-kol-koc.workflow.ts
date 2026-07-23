import { searchKolCandidates } from '@/features/kol-matching/services/kol-matching-service';
import type { FindKolEntryInput, KolCandidate } from '@/features/kol-matching/types';
import { createAgentRunSummary } from '@/server/ai/services/agent-run.service';
import type {
  FunnelStage,
  KolKocMatchingRequest,
  KolKocMatchingResponse,
  KolKocRecommendation,
} from '@/server/ai/types/agent.types';
import { getCacheJson, setCacheJson } from '@/server/cache/agentic-cache';

function buildMockEntry(request: KolKocMatchingRequest): FindKolEntryInput {
  return {
    campaignOption: request.campaignId,
    nicheCategory: 'Lifestyle',
    summary: 'Mock agentic KOL/KOC matching request',
    campaignName: request.campaignId,
    creatorType: 'both',
    objective: 'awareness',
    targetPlatforms: request.filters.platforms,
    niche: 'Lam dep',
    targetRegion: 'Viet Nam',
    budgetTier: 'growth',
    minReach: request.filters.minFollowers ?? 10_000,
    minCtr: 2.5,
    conversionTarget: 1.2,
    budgetRangeMaxK: 25,
    followerRangeMaxK: 500,
  };
}

function scoreCandidate(candidate: KolCandidate): KolKocRecommendation {
  const audienceFit = candidate.fitScore / 100;
  const brandFit = Math.min(0.98, 0.72 + candidate.engagementRate / 100);
  const styleFit = candidate.type === 'KOC' ? 0.88 : 0.8;
  const trustScore = Math.min(0.96, 0.7 + candidate.avgRoi / 20);
  const riskScore = Math.max(0.08, 0.28 - candidate.engagementRate / 100);
  const expectedCampaignValue = Math.min(0.95, 0.62 + candidate.avgRoi / 10);
  const overallMatchScore = audienceFit * 0.25
    + brandFit * 0.2
    + styleFit * 0.15
    + trustScore * 0.2
    + expectedCampaignValue * 0.15
    - riskScore * 0.2;
  const suggestedCampaignRole: FunnelStage | 'review' = candidate.type === 'KOC'
    ? 'review'
    : 'awareness';

  return {
    kolId: candidate.id,
    name: candidate.name,
    candidate,
    overallMatchScore: Number(Math.max(0, overallMatchScore).toFixed(2)),
    audienceFit: Number(audienceFit.toFixed(2)),
    brandFit: Number(brandFit.toFixed(2)),
    styleFit,
    trustScore: Number(trustScore.toFixed(2)),
    riskScore: Number(riskScore.toFixed(2)),
    reason:
      `${candidate.name} has a strong fit score and efficient expected CPA for this mock campaign.`,
    evidence: [
      `${candidate.followers.toLocaleString('en-US')} followers on ${candidate.platform}`,
      `${candidate.engagementRate}% engagement rate`,
      `${candidate.avgRoi}x average ROI`,
    ],
    concerns: candidate.estimatedCostPerPostUsd > 1000
      ? ['Cost per post is above growth-tier baseline.']
      : [],
    suggestedCampaignRole,
  };
}

export async function matchKolKocWorkflow(
  request: KolKocMatchingRequest,
): Promise<KolKocMatchingResponse> {
  const cacheKey = `agentic:kol-match:${request.campaignId}:${request.limit}:${
    request.filters.platforms.join('-')
  }:${request.filters.minFollowers ?? 0}:${request.filters.maxEstimatedCost ?? 0}`;
  const cachedResponse = await getCacheJson<KolKocMatchingResponse>(cacheKey);
  if (cachedResponse) return cachedResponse;

  const startedAt = Date.now();
  const entry = buildMockEntry(request);
  const candidates = await searchKolCandidates(entry);
  const recommendations = candidates
    .filter((candidate) => {
      const meetsFollowers = request.filters.minFollowers === undefined
        || candidate.followers >= request.filters.minFollowers;
      const meetsCost = request.filters.maxEstimatedCost === undefined
        || candidate.estimatedCostPerPostUsd <= request.filters.maxEstimatedCost;
      return meetsFollowers && meetsCost;
    })
    .map(scoreCandidate)
    .sort((first, second) => second.overallMatchScore - first.overallMatchScore)
    .slice(0, request.limit);

  const response: KolKocMatchingResponse = {
    recommendations,
    agentRun: createAgentRunSummary({
      workflowName: 'match-kol-koc',
      agentName: 'matching-agent',
      inputSummary: `${request.campaignId}:${request.filters.platforms.join(',')}`,
      outputSummary: `${recommendations.length} recommendations`,
      startedAt,
    }),
  };

  await setCacheJson(cacheKey, response);
  return response;
}
