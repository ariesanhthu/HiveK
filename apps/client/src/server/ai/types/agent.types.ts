import type {
  Campaign,
  CampaignPlanningData,
  CampaignPost,
  PlatformId,
} from '@/features/campaign-planning/types/campaign-planning';
import type {
  FindKolEntryInput,
  KolCandidate,
  SocialPlatform,
} from '@/features/kol-matching/types';

export type CampaignWorkflowMode = 'human_review' | 'auto_publish';
export type FunnelStage = 'awareness' | 'consideration' | 'conversion' | 'retention';
export type RiskLevel = 'green' | 'amber' | 'red';
export type ValidationDecision = 'approve' | 'revise' | 'human_review';
export type AgentRunStatus = 'success' | 'failed';
export type CampaignStepStatus =
  | 'draft'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'rejected';

export type AgentRunSummary = {
  runId: string;
  workflowName: string;
  agentName: string;
  inputSummary: string;
  outputSummary: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  status: AgentRunStatus;
  error?: string;
};

export type ContentValidationResult = {
  riskLevel: RiskLevel;
  brandFitScore: number;
  humanLikenessScore: number;
  factualConsistencyScore: number;
  platformFitScore: number;
  salesPressureScore: number;
  issues: string[];
  suggestedRevision: string;
  finalDecision: ValidationDecision;
};

export type CampaignPlanRequest = {
  days: number;
  platforms: PlatformId[];
  mode: CampaignWorkflowMode;
  forceRefresh?: boolean;
};

export type CampaignPlanStep = {
  stepId: string;
  dayIndex: number;
  platform: PlatformId;
  funnelStage: FunnelStage;
  goal: string;
  angle: string;
  hook: string;
  contentPreview: string;
  fullContent: string;
  firstComment: string;
  replySuggestions: string[];
  cta: string;
  riskLevel: RiskLevel;
  status: CampaignStepStatus;
};

export type CampaignPlanResponse = {
  campaignId: string;
  strategySummary: string;
  steps: CampaignPlanStep[];
  agentRun: AgentRunSummary;
};

export type GenerateSinglePostRequest = {
  stepId: string;
  platform: PlatformId;
  angle: string;
  userInstruction?: string;
};

export type GenerateSinglePostResponse = {
  stepId: string;
  hook: string;
  content: string;
  firstComment: string;
  replySuggestions: string[];
  validation: ContentValidationResult;
  agentRun: AgentRunSummary;
};

export type ContentValidationRequest = {
  campaignId: string;
  platform: PlatformId;
  content: string;
};

export type KolKocMatchingRequest = {
  campaignId: string;
  limit: number;
  filters: {
    platforms: SocialPlatform[];
    minFollowers?: number;
    maxEstimatedCost?: number;
  };
};

export type KolKocRecommendation = {
  kolId: string;
  name: string;
  candidate: KolCandidate;
  overallMatchScore: number;
  audienceFit: number;
  brandFit: number;
  styleFit: number;
  trustScore: number;
  riskScore: number;
  reason: string;
  evidence: string[];
  concerns: string[];
  suggestedCampaignRole: FunnelStage | 'review' | 'livestream' | 'affiliate';
};

export type KolKocMatchingResponse = {
  recommendations: KolKocRecommendation[];
  agentRun: AgentRunSummary;
};

export type FeedbackEventType =
  | 'approve'
  | 'reject'
  | 'edit'
  | 'regenerate'
  | 'publish'
  | 'pin_as_good'
  | 'mark_too_ai'
  | 'mark_wrong_fact';

export type SaveFeedbackRequest = {
  campaignId: string;
  stepId?: string;
  assetId?: string;
  eventType: FeedbackEventType;
  beforeText?: string;
  afterText?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
};

export type SaveFeedbackResponse = {
  success: true;
  feedbackId: string;
};

export type CampaignInsightResponse = {
  summary: string;
  whatWorked: string[];
  whatDidNotWork: string[];
  bestAngle: string;
  weakestAngle: string;
  kolPerformanceNotes: string[];
  nextCampaignRecommendations: string[];
  dataLimitations: string[];
  agentRun: AgentRunSummary;
};

export type CampaignPlanningSnapshot = CampaignPlanningData & {
  selectedCampaign?: Campaign;
};

export type CampaignPostPatch = Partial<CampaignPost>;
