import {
  type AgentStage,
  type FindKolEntryInput,
  type KolCandidate,
  type SocialPlatform,
} from "@/features/kol-matching/types";

const STEP_DELAY_MS = 550;

const CANDIDATES: KolCandidate[] = [
  {
    id: "kol-01",
    name: "Linh Truong",
    type: "KOL",
    niche: "Beauty",
    platform: "tiktok",
    followers: 920_000,
    engagementRate: 6.3,
    fitScore: 92,
    estimatedCpaUsd: 5.8,
    avgRoi: 4.4,
    estimatedCostPerPostUsd: 1250,
  },
  {
    id: "kol-02",
    name: "Quang Vlog",
    type: "KOC",
    niche: "Gaming",
    platform: "youtube",
    followers: 245_000,
    engagementRate: 8.1,
    fitScore: 84,
    estimatedCpaUsd: 6.7,
    avgRoi: 3.8,
    estimatedCostPerPostUsd: 640,
  },
  {
    id: "kol-03",
    name: "Nhi Pham",
    type: "KOC",
    niche: "Fashion",
    platform: "instagram",
    followers: 188_000,
    engagementRate: 7.8,
    fitScore: 87,
    estimatedCpaUsd: 4.9,
    avgRoi: 4.7,
    estimatedCostPerPostUsd: 520,
  },
  {
    id: "kol-04",
    name: "Hai Nguyen",
    type: "KOL",
    niche: "Tech",
    platform: "tiktok",
    followers: 670_000,
    engagementRate: 5.6,
    fitScore: 81,
    estimatedCpaUsd: 7.2,
    avgRoi: 3.4,
    estimatedCostPerPostUsd: 980,
  },
  {
    id: "kol-05",
    name: "Mia Tran",
    type: "KOL",
    niche: "Beauty",
    platform: "instagram",
    followers: 540_000,
    engagementRate: 6.9,
    fitScore: 89,
    estimatedCpaUsd: 5.2,
    avgRoi: 4.2,
    estimatedCostPerPostUsd: 880,
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function typeMatches(type: FindKolEntryInput["creatorType"], candidateType: KolCandidate["type"]): boolean {
  if (type === "both") return true;
  if (type === "kol") return candidateType === "KOL";
  return candidateType === "KOC";
}

function objectiveBoost(objective: FindKolEntryInput["objective"], platform: SocialPlatform): number {
  if (objective === "awareness" && platform === "tiktok") return 3;
  if (objective === "conversion" && platform === "instagram") return 4;
  if (objective === "engagement" && platform === "youtube") return 2;
  return 0;
}

function budgetScore(tier: FindKolEntryInput["budgetTier"], cost: number): number {
  if (tier === "starter") return cost <= 600 ? 4 : -3;
  if (tier === "growth") return cost <= 1000 ? 3 : -2;
  return 2;
}

function computeFitScore(entry: FindKolEntryInput, candidate: KolCandidate): number {
  const nicheScore = normalize(candidate.niche) === normalize(entry.niche) ? 8 : 0;
  const platformScore = entry.targetPlatforms.includes(candidate.platform) ? 6 : 0;
  const objectiveScore = objectiveBoost(entry.objective, candidate.platform);
  const budgetMatch = budgetScore(entry.budgetTier, candidate.estimatedCostPerPostUsd);
  const raw = candidate.fitScore + nicheScore + platformScore + objectiveScore + budgetMatch;
  return Math.max(1, Math.min(99, raw));
}

export function getAgentStages(entry: FindKolEntryInput): AgentStage[] {
  return [
    {
      id: "collecting-context",
      label: "Collecting campaign context",
      detail: `Reading brief for ${entry.campaignName} in ${entry.targetRegion}`,
    },
    {
      id: "searching-pool",
      label: "Searching KOL/KOC pool",
      detail: `Filtering by ${entry.targetPlatforms.join(", ")} + ${entry.niche}`,
    },
    {
      id: "scoring-candidates",
      label: "Scoring candidates",
      detail: "Computing fit score by objective, cost, and engagement",
    },
    {
      id: "finalizing",
      label: "Preparing shortlist",
      detail: "Generating top performers and comparison insights",
    },
  ];
}

export async function processAgentStages(
  stages: AgentStage[],
  onProgress: (stageIndex: number) => void
): Promise<void> {
  for (let stageIndex = 0; stageIndex < stages.length; stageIndex += 1) {
    onProgress(stageIndex);
    await sleep(STEP_DELAY_MS);
  }
}

export async function searchKolCandidates(entry: FindKolEntryInput): Promise<KolCandidate[]> {
  await sleep(STEP_DELAY_MS);

  const scored = CANDIDATES.filter(
    (candidate) =>
      entry.targetPlatforms.includes(candidate.platform) &&
      typeMatches(entry.creatorType, candidate.type)
  )
    .map((candidate) => ({
      ...candidate,
      fitScore: computeFitScore(entry, candidate),
    }))
    .sort((first, second) => second.fitScore - first.fitScore);

  if (scored.length > 0) return scored;

  return CANDIDATES.map((candidate) => ({
    ...candidate,
    fitScore: computeFitScore(entry, candidate),
  })).sort((first, second) => second.fitScore - first.fitScore);
}
