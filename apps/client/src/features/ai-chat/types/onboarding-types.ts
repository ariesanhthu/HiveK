export const ONBOARDING_STAGES = [
  'welcome',
  'mode',
  'discovery',
  'connect',
  'details',
  'initializing',
  'ready',
] as const;

export type OnboardingStage = (typeof ONBOARDING_STAGES)[number];

export type OnboardingExecutionMode = 'automatic' | 'step_by_step';

export type DiscoveryStatus =
  | 'idle'
  | 'searching'
  | 'partial'
  | 'failed'
  | 'complete';

export type DiscoverySourceKind =
  | 'website'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'x'
  | 'google_drive'
  | 'other';

export type DiscoverySourceStatus =
  | 'searching'
  | 'found_public'
  | 'connection_required'
  | 'not_found'
  | 'error';

export interface DiscoveredField {
  key: string;
  label: string;
  value: string;
}

export interface DiscoverySource {
  id: string;
  kind: DiscoverySourceKind;
  label: string;
  url: string | null;
  handle: string | null;
  status: DiscoverySourceStatus;
  connectionCapability: 'oauth' | 'public_read' | 'manual' | 'unavailable';
  discoveredFields: DiscoveredField[];
  statusMessage: string | null;
  checkedAt: string | null;
}

export interface DiscoveryResult {
  query: string;
  status: DiscoveryStatus;
  sources: DiscoverySource[];
  summary: string | null;
  failureReason: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export type ConnectionDecision = 'connect' | 'public_read' | 'manual' | 'skip';

export type ConnectionPermission = 'read_only' | 'read_publish';

export type ConnectionStatus =
  | 'selected'
  | 'connected'
  | 'needs_input'
  | 'skipped';

export interface OnboardingConnectionChoice {
  sourceId: string;
  decision: ConnectionDecision;
  permission: ConnectionPermission;
  status: ConnectionStatus;
  accountLabel: string;
  accountUrl: string | null;
  note: string | null;
}

export interface BusinessDetails {
  businessName: string;
  websiteUrl: string;
  industry: string;
  summary: string;
  address: string;
  phone: string;
  email: string;
  primaryMarket: string;
  targetAudiences: string[];
  services: string[];
  brandVoiceNotes: string;
}

export type BusinessDetailsInput = Partial<BusinessDetails>;

export const INITIALIZATION_STEP_IDS = [
  'validate_sources',
  'build_brand_profile',
  'build_channel_profiles',
  'suggest_satellites',
  'draft_strategy',
  'prepare_analytics',
] as const;

export type InitializationStepId = (typeof INITIALIZATION_STEP_IDS)[number];

export type InitializationStepStatus =
  | 'pending'
  | 'in_progress'
  | 'complete'
  | 'needs_input'
  | 'failed';

export interface InitializationStep {
  id: InitializationStepId;
  label: string;
  description: string;
  status: InitializationStepStatus;
  note: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export type InitializationStatus =
  | 'idle'
  | 'running'
  | 'needs_input'
  | 'failed'
  | 'complete';

export interface InitializationChecklist {
  status: InitializationStatus;
  steps: InitializationStep[];
  startedAt: string | null;
  completedAt: string | null;
}

export interface AgentOnboardingState {
  schemaVersion: 2;
  stage: OnboardingStage;
  executionMode: OnboardingExecutionMode | null;
  startedAt: string | null;
  updatedAt: string | null;
  discovery: DiscoveryResult;
  connections: OnboardingConnectionChoice[];
  details: BusinessDetails;
  initialization: InitializationChecklist;
}

export interface CompleteDiscoveryInput {
  query?: string;
  sources: DiscoverySource[];
  summary?: string | null;
  result?: 'complete' | 'partial';
}

export interface DiscoveryFailureInput {
  reason: string;
  query?: string;
  sources?: DiscoverySource[];
}

export interface AdvanceInitializationInput {
  stepId?: InitializationStepId;
  outcome?: 'complete' | 'needs_input' | 'failed';
  note?: string | null;
}

export type OnboardingStorageStatus =
  | 'loading'
  | 'ready'
  | 'saved'
  | 'unavailable';

export interface UseAgentOnboardingResult {
  state: AgentOnboardingState;
  isHydrated: boolean;
  storageStatus: OnboardingStorageStatus;
  startDiscovery: (query?: string) => void;
  selectExecutionMode: (mode: OnboardingExecutionMode) => void;
  reportDiscoveryFailure: (input: DiscoveryFailureInput | string) => void;
  completeDiscovery: (input: CompleteDiscoveryInput) => void;
  saveConnections: (choices: OnboardingConnectionChoice[]) => void;
  saveDetails: (details: BusinessDetailsInput) => void;
  startInitialization: () => void;
  advanceInitialization: (input?: AdvanceInitializationInput) => void;
  finishInitialization: () => boolean;
  reset: () => void;
}
