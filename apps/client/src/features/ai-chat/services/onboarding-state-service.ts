import type {
  AdvanceInitializationInput,
  AgentOnboardingState,
  BusinessDetails,
  BusinessDetailsInput,
  CompleteDiscoveryInput,
  DiscoveryFailureInput,
  DiscoverySource,
  InitializationChecklist,
  InitializationStep,
  InitializationStepId,
  OnboardingConnectionChoice,
  OnboardingExecutionMode,
  OnboardingStage,
} from "../types/onboarding-types";
import {
  INITIALIZATION_STEP_IDS,
  ONBOARDING_STAGES,
} from "../types/onboarding-types";

export const AGENT_ONBOARDING_STORAGE_KEY = "hivek.ai-chat.onboarding";

const STORAGE_VERSION = 2 as const;

interface StoredAgentOnboardingState {
  version: typeof STORAGE_VERSION;
  savedAt: string;
  state: AgentOnboardingState;
}

export interface OnboardingLoadResult {
  state: AgentOnboardingState;
  restored: boolean;
  storageAvailable: boolean;
}

const EMPTY_BUSINESS_DETAILS: BusinessDetails = {
  businessName: "",
  websiteUrl: "",
  industry: "",
  summary: "",
  address: "",
  phone: "",
  email: "",
  primaryMarket: "",
  targetAudiences: [],
  services: [],
  brandVoiceNotes: "",
};

const INITIALIZATION_STEP_COPY: Record<
  InitializationStepId,
  Pick<InitializationStep, "label" | "description">
> = {
  validate_sources: {
    label: "Xác thực nguồn và quyền truy cập",
    description: "Kiểm tra nguồn nào có thể đọc và phạm vi quyền đã được chọn.",
  },
  build_brand_profile: {
    label: "Khởi tạo hồ sơ thương hiệu",
    description: "Tổng hợp thông tin doanh nghiệp và đánh dấu các trường cần xác nhận.",
  },
  build_channel_profiles: {
    label: "Khởi tạo hồ sơ kênh",
    description: "Chuẩn hóa vai trò, đối tượng và nội dung cho từng kênh đã tìm thấy.",
  },
  suggest_satellites: {
    label: "Phân tích kênh vệ tinh",
    description: "Đề xuất những kênh bổ sung phù hợp để người dùng xem xét.",
  },
  draft_strategy: {
    label: "Chuẩn bị chiến lược ban đầu",
    description: "Tạo khung mục tiêu, ưu tiên và kế hoạch nội dung để duyệt.",
  },
  prepare_analytics: {
    label: "Chuẩn bị cấu trúc phân tích",
    description: "Thiết lập các chỉ số và ghi rõ nguồn dữ liệu hiện có.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isOnboardingStage(value: unknown): value is OnboardingStage {
  return ONBOARDING_STAGES.some((stage) => stage === value);
}

function isDiscoverySource(value: unknown): value is DiscoverySource {
  if (!isRecord(value)) return false;

  const validKinds = [
    "website",
    "facebook",
    "tiktok",
    "youtube",
    "linkedin",
    "x",
    "google_drive",
    "other",
  ];
  const validStatuses = [
    "searching",
    "found_public",
    "connection_required",
    "not_found",
    "error",
  ];
  const validCapabilities = ["oauth", "public_read", "manual", "unavailable"];

  return (
    typeof value.id === "string" &&
    validKinds.includes(String(value.kind)) &&
    typeof value.label === "string" &&
    isStringOrNull(value.url) &&
    isStringOrNull(value.handle) &&
    validStatuses.includes(String(value.status)) &&
    validCapabilities.includes(String(value.connectionCapability)) &&
    Array.isArray(value.discoveredFields) &&
    value.discoveredFields.every(
      (field) =>
        isRecord(field) &&
        typeof field.key === "string" &&
        typeof field.label === "string" &&
        typeof field.value === "string"
    ) &&
    isStringOrNull(value.statusMessage) &&
    isStringOrNull(value.checkedAt)
  );
}

function isConnectionChoice(
  value: unknown
): value is OnboardingConnectionChoice {
  if (!isRecord(value)) return false;

  return (
    typeof value.sourceId === "string" &&
    ["connect", "public_read", "manual", "skip"].includes(
      String(value.decision)
    ) &&
    ["read_only", "read_publish"].includes(String(value.permission)) &&
    ["selected", "connected", "needs_input", "skipped"].includes(
      String(value.status)
    ) &&
    typeof value.accountLabel === "string" &&
    isStringOrNull(value.accountUrl) &&
    isStringOrNull(value.note)
  );
}

function isBusinessDetails(value: unknown): value is BusinessDetails {
  return (
    isRecord(value) &&
    typeof value.businessName === "string" &&
    typeof value.websiteUrl === "string" &&
    typeof value.industry === "string" &&
    typeof value.summary === "string" &&
    typeof value.address === "string" &&
    typeof value.phone === "string" &&
    typeof value.email === "string" &&
    typeof value.primaryMarket === "string" &&
    isStringArray(value.targetAudiences) &&
    isStringArray(value.services) &&
    typeof value.brandVoiceNotes === "string"
  );
}

function isInitializationStep(value: unknown): value is InitializationStep {
  return (
    isRecord(value) &&
    INITIALIZATION_STEP_IDS.some((id) => id === value.id) &&
    typeof value.label === "string" &&
    typeof value.description === "string" &&
    ["pending", "in_progress", "complete", "needs_input", "failed"].includes(
      String(value.status)
    ) &&
    isStringOrNull(value.note) &&
    isStringOrNull(value.startedAt) &&
    isStringOrNull(value.completedAt)
  );
}

export function isAgentOnboardingState(
  value: unknown
): value is AgentOnboardingState {
  if (!isRecord(value) || value.schemaVersion !== 2) return false;
  if (!isOnboardingStage(value.stage)) return false;
  if (
    value.executionMode !== null &&
    value.executionMode !== "automatic" &&
    value.executionMode !== "step_by_step"
  ) {
    return false;
  }
  if (!isStringOrNull(value.startedAt) || !isStringOrNull(value.updatedAt)) {
    return false;
  }
  if (!isRecord(value.discovery)) return false;
  if (
    typeof value.discovery.query !== "string" ||
    !["idle", "searching", "partial", "failed", "complete"].includes(
      String(value.discovery.status)
    ) ||
    !Array.isArray(value.discovery.sources) ||
    !value.discovery.sources.every(isDiscoverySource) ||
    !isStringOrNull(value.discovery.summary) ||
    !isStringOrNull(value.discovery.failureReason) ||
    !isStringOrNull(value.discovery.startedAt) ||
    !isStringOrNull(value.discovery.completedAt)
  ) {
    return false;
  }
  if (
    !Array.isArray(value.connections) ||
    !value.connections.every(isConnectionChoice) ||
    !isBusinessDetails(value.details) ||
    !isRecord(value.initialization) ||
    !["idle", "running", "needs_input", "failed", "complete"].includes(
      String(value.initialization.status)
    ) ||
    !Array.isArray(value.initialization.steps) ||
    value.initialization.steps.length !== INITIALIZATION_STEP_IDS.length ||
    !value.initialization.steps.every(isInitializationStep) ||
    !isStringOrNull(value.initialization.startedAt) ||
    !isStringOrNull(value.initialization.completedAt)
  ) {
    return false;
  }

  const storedStepIds = new Set(
    value.initialization.steps.map((step) => step.id)
  );
  return INITIALIZATION_STEP_IDS.every((id) => storedStepIds.has(id));
}

export function createInitializationChecklist(): InitializationChecklist {
  return {
    status: "idle",
    steps: INITIALIZATION_STEP_IDS.map((id) => ({
      id,
      ...INITIALIZATION_STEP_COPY[id],
      status: "pending",
      note: null,
      startedAt: null,
      completedAt: null,
    })),
    startedAt: null,
    completedAt: null,
  };
}

export function createInitialOnboardingState(): AgentOnboardingState {
  return {
    schemaVersion: 2,
    stage: "welcome",
    executionMode: null,
    startedAt: null,
    updatedAt: null,
    discovery: {
      query: "",
      status: "idle",
      sources: [],
      summary: null,
      failureReason: null,
      startedAt: null,
      completedAt: null,
    },
    connections: [],
    details: {
      ...EMPTY_BUSINESS_DETAILS,
      targetAudiences: [],
      services: [],
    },
    initialization: createInitializationChecklist(),
  };
}

function stamp(
  current: AgentOnboardingState,
  patch: Omit<Partial<AgentOnboardingState>, "schemaVersion">,
  now: string
): AgentOnboardingState {
  return {
    ...current,
    ...patch,
    startedAt: current.startedAt ?? now,
    updatedAt: now,
  };
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function uniqueConnections(
  choices: OnboardingConnectionChoice[]
): OnboardingConnectionChoice[] {
  const bySource = new Map<string, OnboardingConnectionChoice>();
  for (const choice of choices) {
    if (choice.sourceId) bySource.set(choice.sourceId, choice);
  }
  return Array.from(bySource.values());
}

export function prepareDiscovery(
  current: AgentOnboardingState,
  query = "",
  now = new Date().toISOString()
): AgentOnboardingState {
  return stamp(
    current,
    {
      stage: "mode",
      executionMode: null,
      discovery: {
        query: query.trim(),
        status: "idle",
        sources: [],
        summary: null,
        failureReason: null,
        startedAt: null,
        completedAt: null,
      },
      connections: [],
      initialization: createInitializationChecklist(),
    },
    now
  );
}

export function beginDiscovery(
  current: AgentOnboardingState,
  mode: OnboardingExecutionMode,
  now = new Date().toISOString()
): AgentOnboardingState {
  return stamp(
    current,
    {
      stage: "discovery",
      executionMode: mode,
      discovery: {
        ...current.discovery,
        status: "searching",
        sources: [],
        summary: null,
        failureReason: null,
        startedAt: now,
        completedAt: null,
      },
      connections: [],
      initialization: createInitializationChecklist(),
    },
    now
  );
}

export function failDiscovery(
  current: AgentOnboardingState,
  input: DiscoveryFailureInput,
  now = new Date().toISOString()
): AgentOnboardingState {
  const sources = uniqueById(input.sources ?? current.discovery.sources);
  return stamp(
    current,
    {
      stage: "details",
      discovery: {
        ...current.discovery,
        query: input.query?.trim() ?? current.discovery.query,
        status: "failed",
        sources,
        summary: null,
        failureReason: input.reason.trim(),
        startedAt: current.discovery.startedAt ?? now,
        completedAt: now,
      },
      connections: [],
    },
    now
  );
}

export function resolveDiscovery(
  current: AgentOnboardingState,
  input: CompleteDiscoveryInput,
  now = new Date().toISOString()
): AgentOnboardingState {
  const sources = uniqueById(input.sources);
  const hasUnavailableSource = sources.some(
    (source) => source.status === "not_found" || source.status === "error"
  );
  const hasConnectableSource = sources.some(
    (source) =>
      source.status === "found_public" ||
      source.status === "connection_required"
  );

  return stamp(
    current,
    {
      stage: hasConnectableSource ? "connect" : "details",
      discovery: {
        query: input.query?.trim() ?? current.discovery.query,
        status: input.result ?? (hasUnavailableSource ? "partial" : "complete"),
        sources,
        summary: input.summary ?? null,
        failureReason: null,
        startedAt: current.discovery.startedAt ?? now,
        completedAt: now,
      },
      connections: [],
    },
    now
  );
}

export function applyConnections(
  current: AgentOnboardingState,
  choices: OnboardingConnectionChoice[],
  now = new Date().toISOString()
): AgentOnboardingState {
  return stamp(
    current,
    {
      stage: "details",
      connections: uniqueConnections(choices),
    },
    now
  );
}

export function applyBusinessDetails(
  current: AgentOnboardingState,
  details: BusinessDetailsInput,
  now = new Date().toISOString()
): AgentOnboardingState {
  const nextDetails: BusinessDetails = {
    ...current.details,
    ...details,
    targetAudiences:
      details.targetAudiences === undefined
        ? current.details.targetAudiences
        : [...details.targetAudiences],
    services:
      details.services === undefined
        ? current.details.services
        : [...details.services],
  };

  const stage =
    current.stage === "initializing" || current.stage === "ready"
      ? current.stage
      : "details";
  return stamp(current, { stage, details: nextDetails }, now);
}

export function beginInitialization(
  current: AgentOnboardingState,
  now = new Date().toISOString()
): AgentOnboardingState {
  const checklist = createInitializationChecklist();
  const steps = checklist.steps.map((step, index) =>
    index === 0 ? { ...step, status: "in_progress" as const, startedAt: now } : step
  );

  return stamp(
    current,
    {
      stage: "initializing",
      initialization: {
        status: "running",
        steps,
        startedAt: now,
        completedAt: null,
      },
    },
    now
  );
}

export function advanceInitializationStep(
  current: AgentOnboardingState,
  input: AdvanceInitializationInput = {},
  now = new Date().toISOString()
): AgentOnboardingState {
  if (current.stage !== "initializing") return current;

  const activeIndex = current.initialization.steps.findIndex((step) =>
    ["in_progress", "needs_input", "failed"].includes(step.status)
  );
  if (activeIndex < 0) return current;

  const requestedIndex = input.stepId
    ? current.initialization.steps.findIndex((step) => step.id === input.stepId)
    : activeIndex;
  if (requestedIndex !== activeIndex) return current;

  const outcome = input.outcome ?? "complete";
  const steps = current.initialization.steps.map((step, index) => {
    if (index !== activeIndex) return step;
    return {
      ...step,
      status: outcome,
      note: input.note ?? null,
      startedAt: step.startedAt ?? now,
      completedAt: outcome === "complete" ? now : null,
    };
  });

  if (outcome === "complete") {
    const nextIndex = steps.findIndex(
      (step, index) => index > activeIndex && step.status === "pending"
    );
    if (nextIndex >= 0) {
      steps[nextIndex] = {
        ...steps[nextIndex],
        status: "in_progress",
        startedAt: now,
      };
    }
  }

  const status =
    outcome === "needs_input"
      ? "needs_input"
      : outcome === "failed"
        ? "failed"
        : "running";

  return stamp(
    current,
    {
      initialization: {
        ...current.initialization,
        status,
        steps,
      },
    },
    now
  );
}

export function completeInitialization(
  current: AgentOnboardingState,
  now = new Date().toISOString()
): AgentOnboardingState {
  const allStepsComplete = current.initialization.steps.every(
    (step) => step.status === "complete"
  );
  if (current.stage !== "initializing" || !allStepsComplete) return current;

  return stamp(
    current,
    {
      stage: "ready",
      initialization: {
        ...current.initialization,
        status: "complete",
        completedAt: now,
      },
    },
    now
  );
}

export function loadAgentOnboardingState(): OnboardingLoadResult {
  const initial = createInitialOnboardingState();
  if (typeof window === "undefined") {
    return { state: initial, restored: false, storageAvailable: false };
  }

  try {
    const raw = window.localStorage.getItem(AGENT_ONBOARDING_STORAGE_KEY);
    if (!raw) {
      return { state: initial, restored: false, storageAvailable: true };
    }

    const stored: unknown = JSON.parse(raw);
    if (
      !isRecord(stored) ||
      stored.version !== STORAGE_VERSION ||
      typeof stored.savedAt !== "string" ||
      !isAgentOnboardingState(stored.state)
    ) {
      console.info(
        "[HIVE-K onboarding] Bỏ qua trạng thái đã lưu vì không đúng phiên bản hoặc schema."
      );
      return { state: initial, restored: false, storageAvailable: true };
    }

    console.info("[HIVE-K onboarding] Đã khôi phục tiến trình từ localStorage.");
    return { state: stored.state, restored: true, storageAvailable: true };
  } catch (error: unknown) {
    console.info(
      "[HIVE-K onboarding] Không thể đọc localStorage; tiếp tục với trạng thái trong phiên.",
      error
    );
    return { state: initial, restored: false, storageAvailable: false };
  }
}

export function saveAgentOnboardingState(state: AgentOnboardingState): boolean {
  if (typeof window === "undefined") return false;

  const stored: StoredAgentOnboardingState = {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };

  try {
    window.localStorage.setItem(
      AGENT_ONBOARDING_STORAGE_KEY,
      JSON.stringify(stored)
    );
    return true;
  } catch (error: unknown) {
    console.info(
      "[HIVE-K onboarding] Không thể lưu localStorage; trạng thái vẫn được giữ trong phiên.",
      error
    );
    return false;
  }
}

export function clearAgentOnboardingState(): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(AGENT_ONBOARDING_STORAGE_KEY);
    return true;
  } catch (error: unknown) {
    console.info(
      "[HIVE-K onboarding] Không thể xóa trạng thái localStorage.",
      error
    );
    return false;
  }
}

export function logOnboardingActivity(
  action: string,
  detail?: Record<string, unknown>
): void {
  console.group(`[HIVE-K onboarding] ${action}`);
  if (detail) console.info(detail);
  console.groupEnd();
}
