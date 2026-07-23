export type WorkspaceViewId =
  | 'overview'
  | 'brand'
  | 'channels'
  | 'satellites'
  | 'strategy'
  | 'analytics'
  | 'studio';

export type WorkspaceLoadStatus = 'idle' | 'loading' | 'success' | 'error';

export type DataQuality = 'verified' | 'user_provided' | 'estimated';

export type ReviewStatus = 'confirmed' | 'needs_review';

export type SocialPlatform =
  | 'website'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'x';

export interface Provenance {
  id: string;
  sourceType: 'website' | 'social' | 'user' | 'analysis';
  label: string;
  url: string | null;
  observedAt: string;
  note: string;
}

export type BrandFactCategory =
  | 'identity'
  | 'contact'
  | 'positioning'
  | 'service'
  | 'audience'
  | 'proof'
  | 'voice';

export interface BrandFact {
  id: string;
  category: BrandFactCategory;
  label: string;
  value: string;
  dataQuality: DataQuality;
  confidence: number;
  status: ReviewStatus;
  isRequired: boolean;
  provenance: Provenance[];
  updatedAt: string;
  confirmedAt: string | null;
}

export type BrandFactPatch = Partial<
  Pick<BrandFact, 'category' | 'label' | 'value' | 'isRequired'>
>;

export interface BrandReadiness {
  score: number;
  requiredFacts: { confirmed: number; total: number; };
  allFacts: { confirmed: number; total: number; };
  connectedChannels: { confirmed: number; total: number; };
  unresolvedItems: number;
  summary: string;
}

export interface BrandProfile {
  name: string;
  tagline: string;
  description: string;
  primaryAudience: string[];
  serviceAreas: string[];
  voiceTraits: string[];
  readiness: BrandReadiness;
  facts: BrandFact[];
}

export interface ChannelMetric {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  unit: 'count' | 'percent' | 'minutes';
  period: string;
  deltaPercent: number | null;
  dataQuality: DataQuality;
}

export type ChannelConnectionStatus =
  | 'public_only'
  | 'connected'
  | 'needs_reconnect'
  | 'planned';

export interface ChannelProfile {
  id: string;
  platform: SocialPlatform;
  displayName: string;
  handle: string;
  url: string;
  role: string;
  audience: string[];
  contentPillars: string[];
  formats: string[];
  tone: string;
  cadence: string;
  connectionStatus: ChannelConnectionStatus;
  canRead: boolean;
  canPublish: boolean;
  status: ReviewStatus;
  dataQuality: DataQuality;
  metrics: ChannelMetric[];
  provenance: Provenance[];
  lastSyncedAt: string | null;
  confirmedAt: string | null;
}

export type ChannelProfilePatch = Partial<
  Pick<
    ChannelProfile,
    | 'displayName'
    | 'handle'
    | 'url'
    | 'role'
    | 'audience'
    | 'contentPillars'
    | 'formats'
    | 'tone'
    | 'cadence'
    | 'connectionStatus'
    | 'canRead'
    | 'canPublish'
  >
>;

export type SatelliteStatus =
  | 'suggested'
  | 'accepted'
  | 'dismissed'
  | 'active';

export interface SatelliteProfile {
  displayName: string;
  proposedHandle: string;
  bio: string;
  role: string;
  audience: string[];
  contentPillars: string[];
  formats: string[];
  tone: string;
  cadence: string;
  cta: string;
  guardrails: string[];
}

export interface SatelliteRecommendation {
  id: string;
  platform: SocialPlatform;
  priority: 'high' | 'medium' | 'low';
  status: SatelliteStatus;
  rationale: string[];
  projectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  dataQuality: DataQuality;
  profile: SatelliteProfile;
  nextSteps: string[];
  confirmedAt: string | null;
}

export type SatelliteRecommendationPatch =
  & Partial<
    Pick<
      SatelliteRecommendation,
      'platform' | 'priority' | 'status' | 'rationale' | 'projectedImpact' | 'effort'
    >
  >
  & { profile?: Partial<SatelliteProfile>; };

export interface StrategyKpi {
  id: string;
  label: string;
  target: string;
  rationale: string;
  dataQuality: DataQuality;
}

export interface StrategyChannelAllocation {
  platform: SocialPlatform;
  sharePercent: number;
  purpose: string;
}

export interface StrategyPhase {
  id: string;
  name: string;
  dayRange: string;
  objective: string;
  focus: string[];
  deliverables: string[];
  channelMix: StrategyChannelAllocation[];
  kpis: StrategyKpi[];
  satelliteActions: string[];
}

export interface StrategyContentPillar {
  id: string;
  name: string;
  description: string;
  sharePercent: number;
  formats: string[];
  funnelStage: 'awareness' | 'consideration' | 'conversion' | 'retention';
}

export interface StrategyFunnelStage {
  id: string;
  stage: 'awareness' | 'consideration' | 'conversion' | 'retention';
  objective: string;
  content: string[];
  cta: string;
  successMetric: string;
}

export interface StrategyChannelPlan {
  platform: SocialPlatform;
  role: string;
  weeklyCadence: string;
  priorityFormats: string[];
  primaryKpi: string;
}

export interface StrategyPriority {
  id: string;
  rank: number;
  title: string;
  reason: string;
  owner: string;
  dueDay: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
}

export interface NinetyDayStrategy {
  title: string;
  startDate: string;
  endDate: string;
  timezone: string;
  northStar: string;
  objectives: string[];
  priorities: StrategyPriority[];
  contentPillars: StrategyContentPillar[];
  funnel: StrategyFunnelStage[];
  channelPlan: StrategyChannelPlan[];
  phases: StrategyPhase[];
  status: ReviewStatus;
  updatedAt: string;
  confirmedAt: string | null;
  provenance: Provenance[];
}

export type NinetyDayStrategyPatch = Partial<
  Pick<
    NinetyDayStrategy,
    | 'title'
    | 'startDate'
    | 'endDate'
    | 'timezone'
    | 'northStar'
    | 'objectives'
    | 'priorities'
  >
>;

export interface AnalyticsKpi {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  unit: 'count' | 'percent' | 'minutes';
  deltaPercent: number | null;
  goal: string;
  dataQuality: DataQuality;
}

export interface AnalyticsPriority {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  recommendedAction: string;
  relatedView: WorkspaceViewId;
}

export interface ChannelPerformance {
  channelId: string;
  platform: SocialPlatform;
  reach: number;
  engagements: number;
  engagementRate: number;
  leads: number;
  conversionRate: number;
  contentPublished: number;
  dataQuality: DataQuality;
}

export interface AnalyticsTrendPoint {
  label: string;
  reach: number;
  engagements: number;
  leads: number;
  dataQuality: DataQuality;
}

export interface ContentPillarPerformance {
  pillarId: string;
  label: string;
  posts: number;
  reach: number;
  engagementRate: number;
  qualifiedInteractions: number;
  dataQuality: DataQuality;
}

export interface AnalyticsFunnelStage {
  stage: 'reach' | 'engagement' | 'inquiry' | 'consultation' | 'enrollment';
  value: number;
  conversionFromPreviousPercent: number | null;
  dataQuality: DataQuality;
}

export interface AnalyticsInsight {
  id: string;
  finding: string;
  evidence: string;
  confidence: 'low' | 'medium' | 'high';
  sampleSize: number;
  scope: string;
  recommendedAction: string;
  relatedChannelIds: string[];
  dataQuality: DataQuality;
}

export interface WorkspaceAnalytics {
  dateRange: { from: string; to: string; comparisonLabel: string; };
  dataQuality: DataQuality;
  dataCompletenessPercent: number;
  dataQualityNote: string;
  priorities: AnalyticsPriority[];
  kpis: AnalyticsKpi[];
  channelPerformance: ChannelPerformance[];
  trend: AnalyticsTrendPoint[];
  contentPillars: ContentPillarPerformance[];
  funnel: AnalyticsFunnelStage[];
  insights: AnalyticsInsight[];
}

export type WorkspaceRole =
  | 'owner'
  | 'admin'
  | 'content_manager'
  | 'creator'
  | 'reviewer'
  | 'analyst'
  | 'viewer';

export interface StudioConfigSection {
  id: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
  completionPercent: number;
  issues: number;
  route: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  channelIds: string[];
  status: 'active' | 'invited' | 'suspended';
  lastActiveAt: string | null;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  contentTypes: string[];
  channelIds: string[];
  steps: { order: number; role: WorkspaceRole; assigneeId: string | null; }[];
  slaHours: number;
  fallbackMemberId: string | null;
  enabled: boolean;
}

export interface NotificationRule {
  id: string;
  event: string;
  channels: ('in_app' | 'email')[];
  recipientRoles: WorkspaceRole[];
  digest: 'instant' | 'daily' | 'weekly';
  enabled: boolean;
}

export interface AuditEntry {
  id: string;
  occurredAt: string;
  actor: string;
  action: string;
  objectType: string;
  objectLabel: string;
  detail: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'needs_approval' | 'done';
  view: WorkspaceViewId;
  assigneeId: string | null;
  dueAt: string | null;
  source: 'agent' | 'user' | 'system';
}

export interface WorkspaceProfileConfig {
  displayName: string;
  industry: string;
  defaultLocale: string;
  timezone: string;
  weekStartsOn: 'monday' | 'sunday';
  dataRetentionDays: number;
}

export interface BrandVoiceConfig {
  summary: string;
  traits: string[];
  preferredTerms: string[];
  blockedTerms: string[];
  sample: string;
  profileName?: string;
  emojiPolicy?: 'none' | 'light' | 'moderate';
  ctaStyle?: string;
  platformOverrides?: {
    platform: SocialPlatform;
    tone: string;
    maxEmojis: number;
  }[];
}

export interface ContentRule {
  id: string;
  name: string;
  instruction: string;
  appliesTo: string[];
  level: 'required' | 'warning';
  enabled: boolean;
}

export interface ChannelRule {
  id: string;
  channelId: string;
  role: string;
  tone: string;
  cadence: string;
  contentPillars: string[];
  cta: string;
  enabled: boolean;
}

export interface AgentLearningRule {
  id: string;
  label: string;
  evidence: string;
  status: 'candidate' | 'stable' | 'rejected';
  enabled: boolean;
}

export interface ContentRulesConfig {
  requireFactSources: boolean;
  requireHumanReviewForClaims: boolean;
  prohibitedClaims: string[];
  requiredDisclosures: string[];
  defaultHashtagRange: { min: number; max: number; };
  linkPolicy: 'allowed' | 'approved_domains_only' | 'disabled';
  approvedDomains: string[];
}

export interface WorkspaceSource {
  id: string;
  name: string;
  type: 'website' | 'social' | 'drive' | 'file';
  url: string | null;
  scope: string;
  status: 'connected' | 'public_only' | 'needs_reconnect';
  canRead: boolean;
  canWrite: boolean;
  lastSyncedAt: string | null;
  channelId?: string | null;
  permission?: 'read_only' | 'read_publish';
  syncFrequency?: 'manual' | 'daily' | 'weekly';
  includeInAgentKnowledge?: boolean;
}

export type StudioSource = WorkspaceSource;

export interface AgentLearningConfig {
  enabled: boolean;
  learnFromApprovedEdits: boolean;
  learnFromPerformance: boolean;
  minimumSamples: number;
  requireApprovalForStableRules: boolean;
  preserveRejectedRules: boolean;
}

export interface StudioConfig {
  workspaceName: string;
  industry: string;
  primaryMarket: string;
  autoSave: boolean;
  language: 'vi' | 'en';
  timezone: string;
  agentMode: 'guided' | 'copilot';
  publishingMode: 'approval_required' | 'manual_only';
  brandSafetyEnabled: boolean;
  piiProtectionEnabled: boolean;
  workspaceProfile: WorkspaceProfileConfig;
  brandVoice: BrandVoiceConfig;
  contentRules: ContentRule[];
  contentGovernance: ContentRulesConfig;
  channelRules: ChannelRule[];
  agentInstructions: string;
  learningEnabled: boolean;
  learningRules: AgentLearningRule[];
  sources: WorkspaceSource[];
  agentLearning: AgentLearningConfig;
  sections: StudioConfigSection[];
  team: TeamMember[];
  approvalWorkflows: ApprovalWorkflow[];
  notifications: NotificationRule[];
  auditLog: AuditEntry[];
  tasks: WorkspaceTask[];
}

export interface WorkspaceSummary {
  id: string;
  slug: string;
  name: string;
  industry: string;
  locale: string;
  timezone: string;
  websiteUrl: string;
  status: 'ready' | 'needs_review';
  lastAnalyzedAt: string;
}

export interface AgentWorkspaceData {
  schemaVersion: 1;
  seedVersion: string;
  generatedAt: string;
  workspace: WorkspaceSummary;
  brand: BrandProfile;
  channels: ChannelProfile[];
  satellites: SatelliteRecommendation[];
  strategy: NinetyDayStrategy;
  analytics: WorkspaceAnalytics;
  sources: WorkspaceSource[];
  studio: StudioConfig;
}

export type StudioConfigPatch = Partial<StudioConfig>;

export type WorkspaceStudioConfig = StudioConfig;

export interface UseAgentWorkspaceResult {
  data: AgentWorkspaceData | null;
  status: WorkspaceLoadStatus;
  error: string | null;
  reload: () => Promise<void>;
  updateFact: (factId: string, patch: BrandFactPatch) => void;
  confirmFact: (factId: string) => void;
  updateChannel: (channelId: string, patch: ChannelProfilePatch) => void;
  confirmChannel: (channelId: string) => void;
  updateSatellite: (
    satelliteId: string,
    patch: SatelliteRecommendationPatch,
  ) => void;
  confirmSatellite: (satelliteId: string) => void;
  updateStrategy: (patch: NinetyDayStrategyPatch) => void;
  confirmStrategy: () => void;
  updateStudioConfig: (patch: StudioConfigPatch) => void;
}
