import type {
  AgentWorkspaceData,
  BrandFact,
  ChannelProfile,
  DataQuality,
  Provenance,
  SatelliteRecommendation,
  SocialPlatform,
  WorkspaceSource,
} from "../types/workspace-types";

export const WORKSPACE_DEMO_STORAGE_KEY =
  "hivek.agent-workspace.the-tutorx.v1";

const STORAGE_VERSION = 1;

interface StoredWorkspaceDemo {
  version: typeof STORAGE_VERSION;
  seedVersion: string;
  savedAt: string;
  data: AgentWorkspaceData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((entry: unknown) => typeof entry === "string")
  );
}

function isDataQuality(value: unknown): value is DataQuality {
  return (
    value === "verified" ||
    value === "user_provided" ||
    value === "estimated"
  );
}

function isSocialPlatform(value: unknown): value is SocialPlatform {
  return (
    value === "website" ||
    value === "facebook" ||
    value === "tiktok" ||
    value === "youtube" ||
    value === "linkedin" ||
    value === "x"
  );
}

function isProvenance(value: unknown): value is Provenance {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.sourceType === "website" ||
      value.sourceType === "social" ||
      value.sourceType === "user" ||
      value.sourceType === "analysis") &&
    typeof value.label === "string" &&
    (typeof value.url === "string" || value.url === null) &&
    typeof value.observedAt === "string" &&
    typeof value.note === "string"
  );
}

function isBrandFact(value: unknown): value is BrandFact {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.category === "identity" ||
      value.category === "contact" ||
      value.category === "positioning" ||
      value.category === "service" ||
      value.category === "audience" ||
      value.category === "proof" ||
      value.category === "voice") &&
    typeof value.label === "string" &&
    typeof value.value === "string" &&
    isDataQuality(value.dataQuality) &&
    typeof value.confidence === "number" &&
    value.confidence >= 0 &&
    value.confidence <= 1 &&
    (value.status === "confirmed" || value.status === "needs_review") &&
    typeof value.isRequired === "boolean" &&
    Array.isArray(value.provenance) &&
    value.provenance.every(isProvenance) &&
    typeof value.updatedAt === "string" &&
    (typeof value.confirmedAt === "string" || value.confirmedAt === null)
  );
}

function isChannelProfile(value: unknown): value is ChannelProfile {
  if (!isRecord(value)) return false;

  const metrics = value.metrics;
  const provenance = value.provenance;

  return (
    typeof value.id === "string" &&
    isSocialPlatform(value.platform) &&
    typeof value.displayName === "string" &&
    typeof value.handle === "string" &&
    typeof value.url === "string" &&
    typeof value.role === "string" &&
    isStringArray(value.audience) &&
    isStringArray(value.contentPillars) &&
    isStringArray(value.formats) &&
    typeof value.tone === "string" &&
    typeof value.cadence === "string" &&
    (value.connectionStatus === "public_only" ||
      value.connectionStatus === "connected" ||
      value.connectionStatus === "needs_reconnect" ||
      value.connectionStatus === "planned") &&
    typeof value.canRead === "boolean" &&
    typeof value.canPublish === "boolean" &&
    (value.status === "confirmed" || value.status === "needs_review") &&
    isDataQuality(value.dataQuality) &&
    Array.isArray(metrics) &&
    metrics.every(
      (metric: unknown) =>
        isRecord(metric) &&
        typeof metric.id === "string" &&
        typeof metric.label === "string" &&
        typeof metric.value === "number" &&
        typeof metric.formattedValue === "string" &&
        (metric.unit === "count" ||
          metric.unit === "percent" ||
          metric.unit === "minutes") &&
        typeof metric.period === "string" &&
        (typeof metric.deltaPercent === "number" ||
          metric.deltaPercent === null) &&
        isDataQuality(metric.dataQuality)
    ) &&
    Array.isArray(provenance) &&
    provenance.every(isProvenance) &&
    (typeof value.lastSyncedAt === "string" || value.lastSyncedAt === null) &&
    (typeof value.confirmedAt === "string" || value.confirmedAt === null)
  );
}

function isSatelliteRecommendation(
  value: unknown
): value is SatelliteRecommendation {
  if (!isRecord(value) || !isRecord(value.profile)) return false;

  const profile = value.profile;

  return (
    typeof value.id === "string" &&
    isSocialPlatform(value.platform) &&
    (value.priority === "high" ||
      value.priority === "medium" ||
      value.priority === "low") &&
    (value.status === "suggested" ||
      value.status === "accepted" ||
      value.status === "dismissed" ||
      value.status === "active") &&
    isStringArray(value.rationale) &&
    typeof value.projectedImpact === "string" &&
    (value.effort === "low" ||
      value.effort === "medium" ||
      value.effort === "high") &&
    typeof value.confidence === "number" &&
    isDataQuality(value.dataQuality) &&
    typeof profile.displayName === "string" &&
    typeof profile.proposedHandle === "string" &&
    typeof profile.bio === "string" &&
    typeof profile.role === "string" &&
    isStringArray(profile.audience) &&
    isStringArray(profile.contentPillars) &&
    isStringArray(profile.formats) &&
    typeof profile.tone === "string" &&
    typeof profile.cadence === "string" &&
    typeof profile.cta === "string" &&
    isStringArray(profile.guardrails) &&
    isStringArray(value.nextSteps) &&
    (typeof value.confirmedAt === "string" || value.confirmedAt === null)
  );
}

function isWorkspaceSource(value: unknown): value is WorkspaceSource {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.type === "website" ||
      value.type === "social" ||
      value.type === "drive" ||
      value.type === "file") &&
    (typeof value.url === "string" || value.url === null) &&
    typeof value.scope === "string" &&
    (value.status === "connected" ||
      value.status === "public_only" ||
      value.status === "needs_reconnect") &&
    typeof value.canRead === "boolean" &&
    typeof value.canWrite === "boolean" &&
    (typeof value.lastSyncedAt === "string" || value.lastSyncedAt === null)
  );
}

function hasStrategyShape(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    typeof value.startDate === "string" &&
    typeof value.endDate === "string" &&
    typeof value.timezone === "string" &&
    typeof value.northStar === "string" &&
    isStringArray(value.objectives) &&
    Array.isArray(value.priorities) &&
    value.priorities.every(
      (priority: unknown) =>
        isRecord(priority) &&
        typeof priority.id === "string" &&
        typeof priority.rank === "number" &&
        typeof priority.title === "string" &&
        typeof priority.reason === "string" &&
        typeof priority.owner === "string" &&
        typeof priority.dueDay === "number" &&
        (priority.status === "not_started" ||
          priority.status === "in_progress" ||
          priority.status === "completed" ||
          priority.status === "blocked")
    ) &&
    Array.isArray(value.contentPillars) &&
    Array.isArray(value.funnel) &&
    Array.isArray(value.channelPlan) &&
    Array.isArray(value.phases) &&
    (value.status === "confirmed" || value.status === "needs_review") &&
    typeof value.updatedAt === "string" &&
    (typeof value.confirmedAt === "string" || value.confirmedAt === null) &&
    Array.isArray(value.provenance) &&
    value.provenance.every(isProvenance)
  );
}

function hasAnalyticsShape(value: unknown): boolean {
  return (
    isRecord(value) &&
    isRecord(value.dateRange) &&
    typeof value.dateRange.from === "string" &&
    typeof value.dateRange.to === "string" &&
    typeof value.dateRange.comparisonLabel === "string" &&
    isDataQuality(value.dataQuality) &&
    typeof value.dataCompletenessPercent === "number" &&
    typeof value.dataQualityNote === "string" &&
    Array.isArray(value.priorities) &&
    Array.isArray(value.kpis) &&
    Array.isArray(value.channelPerformance) &&
    Array.isArray(value.trend) &&
    Array.isArray(value.contentPillars) &&
    Array.isArray(value.funnel) &&
    Array.isArray(value.insights)
  );
}

function hasStudioShape(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.workspaceName === "string" &&
    typeof value.industry === "string" &&
    typeof value.primaryMarket === "string" &&
    typeof value.autoSave === "boolean" &&
    (value.language === "vi" || value.language === "en") &&
    typeof value.timezone === "string" &&
    (value.agentMode === "guided" || value.agentMode === "copilot") &&
    (value.publishingMode === "approval_required" ||
      value.publishingMode === "manual_only") &&
    isRecord(value.brandVoice) &&
    typeof value.brandVoice.summary === "string" &&
    isStringArray(value.brandVoice.traits) &&
    Array.isArray(value.contentRules) &&
    Array.isArray(value.channelRules) &&
    typeof value.agentInstructions === "string" &&
    typeof value.learningEnabled === "boolean" &&
    Array.isArray(value.learningRules) &&
    Array.isArray(value.sources) &&
    value.sources.every(isWorkspaceSource) &&
    Array.isArray(value.sections) &&
    Array.isArray(value.team) &&
    Array.isArray(value.approvalWorkflows) &&
    Array.isArray(value.notifications) &&
    Array.isArray(value.auditLog) &&
    Array.isArray(value.tasks)
  );
}

export function isAgentWorkspaceData(
  value: unknown
): value is AgentWorkspaceData {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    typeof value.seedVersion !== "string" ||
    typeof value.generatedAt !== "string" ||
    !isRecord(value.workspace) ||
    !isRecord(value.brand) ||
    !Array.isArray(value.channels) ||
    !Array.isArray(value.satellites) ||
    !Array.isArray(value.sources)
  ) {
    return false;
  }

  return (
    typeof value.workspace.id === "string" &&
    typeof value.workspace.name === "string" &&
    typeof value.workspace.websiteUrl === "string" &&
    typeof value.brand.name === "string" &&
    isRecord(value.brand.readiness) &&
    typeof value.brand.readiness.score === "number" &&
    Array.isArray(value.brand.facts) &&
    value.brand.facts.every(isBrandFact) &&
    value.channels.every(isChannelProfile) &&
    value.satellites.every(isSatelliteRecommendation) &&
    hasStrategyShape(value.strategy) &&
    hasAnalyticsShape(value.analytics) &&
    value.sources.every(isWorkspaceSource) &&
    hasStudioShape(value.studio)
  );
}

function cloneWorkspace(data: AgentWorkspaceData): AgentWorkspaceData {
  if (typeof structuredClone === "function") {
    return structuredClone(data);
  }

  const parsed: unknown = JSON.parse(JSON.stringify(data));
  if (!isAgentWorkspaceData(parsed)) {
    throw new Error("Không thể sao chép dữ liệu workspace.");
  }

  return parsed;
}

function readStoredWorkspace(seedVersion: string): AgentWorkspaceData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(WORKSPACE_DEMO_STORAGE_KEY);
    if (!raw) return null;

    const stored: unknown = JSON.parse(raw);
    if (
      !isRecord(stored) ||
      stored.version !== STORAGE_VERSION ||
      stored.seedVersion !== seedVersion ||
      typeof stored.savedAt !== "string" ||
      !isAgentWorkspaceData(stored.data)
    ) {
      console.info(
        "Bỏ qua snapshot localStorage không hợp lệ hoặc khác phiên bản seed."
      );
      return null;
    }

    return cloneWorkspace(stored.data);
  } catch (error: unknown) {
    console.info("Không đọc được snapshot localStorage; dùng seed gốc.", error);
    return null;
  }
}

export async function loadAgentWorkspaceDemo(): Promise<AgentWorkspaceData> {
  console.group("[HIVE-K demo] Nạp workspace The TutorX");

  try {
    console.info("Nạp JSON seed bằng dynamic import...");
    const seedModule = await import("../data/the-tutorx-workspace.json");
    const rawSeed: unknown = seedModule.default;

    if (!isAgentWorkspaceData(rawSeed)) {
      throw new Error("JSON seed The TutorX không đúng schema workspace v1.");
    }

    console.info(
      `Đã phân tích ${rawSeed.brand.facts.length} facts, ${rawSeed.channels.length} kênh và ${rawSeed.satellites.length} đề xuất vệ tinh.`
    );

    const stored = readStoredWorkspace(rawSeed.seedVersion);
    if (stored) {
      console.info("Khôi phục các chỉnh sửa đã lưu trong localStorage.");
      return stored;
    }

    console.info("Không có chỉnh sửa đã lưu; dùng JSON seed ban đầu.");
    return cloneWorkspace(rawSeed);
  } catch (error: unknown) {
    console.info("Nạp workspace demo thất bại; hook có thể gọi reload().", error);
    throw error;
  } finally {
    console.groupEnd();
  }
}

export function saveAgentWorkspaceDemo(data: AgentWorkspaceData): boolean {
  if (typeof window === "undefined") return false;

  const stored: StoredWorkspaceDemo = {
    version: STORAGE_VERSION,
    seedVersion: data.seedVersion,
    savedAt: new Date().toISOString(),
    data,
  };

  try {
    window.localStorage.setItem(
      WORKSPACE_DEMO_STORAGE_KEY,
      JSON.stringify(stored)
    );
    return true;
  } catch (error: unknown) {
    console.group("[HIVE-K demo] Lưu workspace");
    console.info("Không thể ghi localStorage; dữ liệu vẫn giữ trong phiên UI.", error);
    console.groupEnd();
    return false;
  }
}

export function clearAgentWorkspaceDemoEdits(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(WORKSPACE_DEMO_STORAGE_KEY);
    console.group("[HIVE-K demo] Đặt lại workspace");
    console.info("Đã xóa các chỉnh sửa local; lần reload tiếp theo dùng JSON seed.");
    console.groupEnd();
  } catch (error: unknown) {
    console.group("[HIVE-K demo] Đặt lại workspace");
    console.info("Không thể xóa snapshot localStorage.", error);
    console.groupEnd();
  }
}
