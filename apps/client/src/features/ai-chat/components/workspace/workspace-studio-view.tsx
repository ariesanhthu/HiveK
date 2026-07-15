"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Bot,
  Building2,
  Check,
  Database,
  FileCheck2,
  Radio,
  RotateCcw,
  Save,
  Send,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  StudioToggle,
  type StudioConfigChangeHandler,
} from "@/features/ai-chat/components/workspace/workspace-studio-controls";
import {
  AgentLearningPanel,
  ApprovalPublishingPanel,
  TeamNotificationsAuditPanel,
} from "@/features/ai-chat/components/workspace/workspace-studio-governance-panels";
import {
  ContentChannelRulesPanel,
  SourcesPermissionsPanel,
  WorkspaceVoicePanel,
} from "@/features/ai-chat/components/workspace/workspace-studio-primary-panels";
import { WorkspaceSectionHeading } from "@/features/ai-chat/components/workspace/workspace-section-heading";
import type {
  StudioConfigSection,
  WorkspaceSource,
  WorkspaceStudioConfig,
} from "@/features/ai-chat/types/workspace-types";
import { cn } from "@/lib/utils";

type StudioTabId =
  | "workspace"
  | "rules"
  | "sources"
  | "approval"
  | "agent"
  | "operations";

type StudioTabDefinition = {
  id: StudioTabId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  sectionKeywords: string[];
};

const STUDIO_TABS: readonly StudioTabDefinition[] = [
  {
    id: "workspace",
    label: "Workspace & brand voice",
    shortLabel: "Workspace",
    description: "Thông tin nền, ngôn ngữ và cách thương hiệu giao tiếp.",
    icon: Building2,
    sectionKeywords: ["workspace", "brand", "voice", "identity"],
  },
  {
    id: "rules",
    label: "Nội dung & kênh",
    shortLabel: "Rule nội dung",
    description: "Guardrail nội dung và vai trò riêng cho từng kênh.",
    icon: Radio,
    sectionKeywords: ["content", "channel", "rule", "safety"],
  },
  {
    id: "sources",
    label: "Nguồn & quyền",
    shortLabel: "Nguồn & quyền",
    description: "Phạm vi đọc, ghi, đăng và dữ liệu Agent được sử dụng.",
    icon: Database,
    sectionKeywords: ["source", "permission", "knowledge", "connector"],
  },
  {
    id: "approval",
    label: "Duyệt & xuất bản",
    shortLabel: "Duyệt & đăng",
    description: "Workflow phê duyệt, SLA và cổng xuất bản.",
    icon: Send,
    sectionKeywords: ["approval", "publish", "review", "workflow"],
  },
  {
    id: "agent",
    label: "Agent & vòng học",
    shortLabel: "Agent & học",
    description: "Mức chủ động, chỉ dẫn và rule học có kiểm soát.",
    icon: Bot,
    sectionKeywords: ["agent", "learning", "memory"],
  },
  {
    id: "operations",
    label: "Đội ngũ & vận hành",
    shortLabel: "Đội ngũ",
    description: "Thành viên, thông báo, công việc và nhật ký hoạt động.",
    icon: UsersRound,
    sectionKeywords: ["team", "notification", "audit", "operation"],
  },
] as const;

function isStudioTab(value: string | null): value is StudioTabId {
  return Boolean(value && STUDIO_TABS.some((tab) => tab.id === value));
}

type WorkspaceStudioViewProps = {
  config: WorkspaceStudioConfig;
  sources: WorkspaceSource[];
  onSave: (nextConfig: WorkspaceStudioConfig) => void | Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
};

type ActiveStudioPanelProps = {
  tabId: StudioTabId;
  config: WorkspaceStudioConfig;
  onChange: StudioConfigChangeHandler;
  idPrefix: string;
};

type StoredStudioDraft = {
  version: 1;
  workspaceName: string;
  savedAt: string;
  data: WorkspaceStudioConfig;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStudioDraft(
  storageKey: string,
  workspaceName: string
): WorkspaceStudioConfig | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const stored: unknown = JSON.parse(raw);
    if (
      !isRecord(stored) ||
      stored.version !== 1 ||
      stored.workspaceName !== workspaceName ||
      !isRecord(stored.data)
    ) {
      return null;
    }

    const candidate = stored.data;
    if (
      typeof candidate.workspaceName !== "string" ||
      !Array.isArray(candidate.sections) ||
      !Array.isArray(candidate.sources) ||
      !Array.isArray(candidate.team) ||
      !Array.isArray(candidate.approvalWorkflows) ||
      !Array.isArray(candidate.notifications) ||
      !isRecord(candidate.brandVoice) ||
      !isRecord(candidate.workspaceProfile)
    ) {
      return null;
    }

    return candidate as unknown as WorkspaceStudioConfig;
  } catch (error: unknown) {
    console.info("Không thể khôi phục bản nháp Studio cục bộ.", error);
    return null;
  }
}

function clearStudioDraft(storageKey: string): void {
  try {
    window.localStorage.removeItem(storageKey);
  } catch (error: unknown) {
    console.info("Không thể xóa bản nháp Studio cục bộ.", error);
  }
}

function validateStudioConfig(
  config: WorkspaceStudioConfig
): { tab: StudioTabId; message: string } | null {
  const requiredWorkspaceValues = [
    config.workspaceName,
    config.industry,
    config.primaryMarket,
    config.timezone,
    config.brandVoice.summary,
  ];
  if (requiredWorkspaceValues.some((value) => !value.trim())) {
    return {
      tab: "workspace",
      message: "Hoàn thành các trường bắt buộc của workspace và giọng thương hiệu.",
    };
  }

  if (
    config.contentRules.some(
      (rule) => !rule.name.trim() || !rule.instruction.trim()
    )
  ) {
    return {
      tab: "rules",
      message: "Mỗi quy tắc nội dung cần có tên và hướng dẫn.",
    };
  }

  if (config.approvalWorkflows.some((workflow) => !workflow.name.trim())) {
    return {
      tab: "approval",
      message: "Mỗi quy trình phê duyệt cần có tên.",
    };
  }

  if (
    config.team.some(
      (member) => !member.name.trim() || !member.email.trim()
    )
  ) {
    return {
      tab: "operations",
      message: "Mỗi thành viên cần có họ tên và email hợp lệ.",
    };
  }

  return null;
}

type StudioTabStatus = {
  sections: StudioConfigSection[];
  completionPercent: number;
  issues: number;
  enabled: boolean;
};

function cloneConfig(
  config: WorkspaceStudioConfig,
  sources: WorkspaceSource[]
): WorkspaceStudioConfig {
  return structuredClone({ ...config, sources });
}

function getTabStatus(
  sections: StudioConfigSection[],
  tab: StudioTabDefinition,
  tabIndex: number
): StudioTabStatus {
  const matches = sections.filter((section) => {
    const searchable = `${section.id} ${section.label}`.toLocaleLowerCase("vi");
    return tab.sectionKeywords.some((keyword) => searchable.includes(keyword));
  });

  const matchedSections = matches.length
    ? matches
    : sections[tabIndex]
      ? [sections[tabIndex]]
      : [];
  const completionPercent = matchedSections.length
    ? Math.round(
        matchedSections.reduce(
          (sum, section) => sum + section.completionPercent,
          0
        ) / matchedSections.length
      )
    : 0;

  return {
    sections: matchedSections,
    completionPercent,
    issues: matchedSections.reduce((sum, section) => sum + section.issues, 0),
    enabled: matchedSections.every((section) => section.enabled),
  };
}

function getAverageCompletion(sections: StudioConfigSection[]): number {
  if (!sections.length) return 0;
  const total = sections.reduce(
    (sum, section) => sum + section.completionPercent,
    0
  );
  return Math.round(total / sections.length);
}

function ActiveStudioPanel({
  tabId,
  config,
  onChange,
  idPrefix,
}: ActiveStudioPanelProps) {
  switch (tabId) {
    case "workspace":
      return (
        <WorkspaceVoicePanel
          config={config}
          onChange={onChange}
          idPrefix={idPrefix}
        />
      );
    case "rules":
      return (
        <ContentChannelRulesPanel
          config={config}
          onChange={onChange}
          idPrefix={idPrefix}
        />
      );
    case "sources":
      return (
        <SourcesPermissionsPanel
          config={config}
          onChange={onChange}
          idPrefix={idPrefix}
        />
      );
    case "approval":
      return (
        <ApprovalPublishingPanel
          config={config}
          onChange={onChange}
          idPrefix={idPrefix}
        />
      );
    case "agent":
      return (
        <AgentLearningPanel
          config={config}
          onChange={onChange}
          idPrefix={idPrefix}
        />
      );
    case "operations":
      return (
        <TeamNotificationsAuditPanel
          config={config}
          onChange={onChange}
          idPrefix={idPrefix}
        />
      );
  }
}

export function WorkspaceStudioView({
  config,
  sources,
  onSave,
  onDirtyChange,
  className,
}: WorkspaceStudioViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const requestedTab = searchParams.get("studioTab");
  const reactId = useId();
  const idPrefix = `workspace-studio-${reactId.replace(/:/g, "")}`;
  const [draft, setDraft] = useState<WorkspaceStudioConfig>(() =>
    cloneConfig(config, sources)
  );
  const activeTab: StudioTabId = isStudioTab(requestedTab)
    ? requestedTab
    : "workspace";
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const draftRestoredRef = useRef(false);
  const draftStorageKey = `hivek:studio-draft:v1:${encodeURIComponent(config.workspaceName)}`;

  const activeTabIndex = STUDIO_TABS.findIndex((tab) => tab.id === activeTab);
  const activeDefinition = STUDIO_TABS[activeTabIndex] ?? STUDIO_TABS[0];
  const activeTabStatus = getTabStatus(
    draft.sections,
    activeDefinition,
    activeTabIndex
  );
  const completionPercent = getAverageCompletion(draft.sections);
  const totalIssues = draft.sections.reduce(
    (sum, section) => sum + section.issues,
    0
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (draftRestoredRef.current) return;
    draftRestoredRef.current = true;

    const storedDraft = readStudioDraft(draftStorageKey, config.workspaceName);
    if (!storedDraft) return;
    setDraft(cloneConfig(storedDraft, storedDraft.sources));
    setIsDirty(true);
    setSaveState("idle");
  }, [config.workspaceName, draftStorageKey]);

  useEffect(() => {
    if (!isDirty) return;
    if (!draft.autoSave) {
      clearStudioDraft(draftStorageKey);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const stored: StoredStudioDraft = {
        version: 1,
        workspaceName: config.workspaceName,
        savedAt: new Date().toISOString(),
        data: draft,
      };

      try {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(stored));
        console.group("[HIVE-K demo] Tự động lưu bản nháp Studio");
        console.info("Bản nháp chỉ được giữ cục bộ; chưa xác nhận cấu hình.");
        console.groupEnd();
      } catch (error: unknown) {
        setSaveState("error");
        setSaveError(
          "Trình duyệt không thể tự lưu bản nháp. Hãy xác nhận cấu hình trước khi rời trang."
        );
        console.info("Không thể tự lưu bản nháp Studio.", error);
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [config.workspaceName, draft, draftStorageKey, isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  function updateConfig<K extends keyof WorkspaceStudioConfig>(
    key: K,
    value: WorkspaceStudioConfig[K]
  ): void {
    setDraft((current) => ({ ...current, [key]: value }));
    setIsDirty(true);
    setSaveState("idle");
    setSaveError(null);
  }

  function selectTab(tab: StudioTabId): void {
    const next = new URLSearchParams(searchParamsKey);
    if (tab === "workspace") next.delete("studioTab");
    else next.set("studioTab", tab);
    router.replace(`/ai-chat?${next.toString()}`, { scroll: false });
  }

  function updateActiveSection(enabled: boolean): void {
    if (!activeTabStatus.sections.length) return;
    const activeSectionIds = new Set(
      activeTabStatus.sections.map((section) => section.id)
    );

    updateConfig(
      "sections",
      draft.sections.map((section) =>
        activeSectionIds.has(section.id) ? { ...section, enabled } : section
      )
    );
  }

  function resetDraft(): void {
    setDraft(cloneConfig(config, sources));
    clearStudioDraft(draftStorageKey);
    setIsDirty(false);
    setSaveState("idle");
    setSaveError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (saveState === "saving") return;

    const validation = validateStudioConfig(draft);
    if (validation) {
      selectTab(validation.tab);
      setSaveState("error");
      setSaveError(validation.message);
      return;
    }

    setSaveState("saving");
    setSaveError(null);

    try {
      await onSave(structuredClone(draft));
      clearStudioDraft(draftStorageKey);
      setIsDirty(false);
      setSaveState("saved");
    } catch (error) {
      setSaveState("error");
      setSaveError(
        error instanceof Error
          ? error.message
          : "Chưa thể lưu cấu hình. Dữ liệu bạn vừa chỉnh vẫn được giữ trên màn hình."
      );
    }
  }

  function focusTab(index: number): void {
    const normalizedIndex =
      (index + STUDIO_TABS.length) % STUDIO_TABS.length;
    const nextTab = STUDIO_TABS[normalizedIndex];
    selectTab(nextTab.id);
    tabButtonRefs.current[normalizedIndex]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ): void {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(STUDIO_TABS.length - 1);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8",
        className
      )}
    >
      <WorkspaceSectionHeading
        eyebrow="Studio vận hành"
        title="Cấu hình cách HIVE-K làm việc"
        description="Dữ liệu đã được điền vào từng nhóm. Bạn chỉ cần kiểm tra, điều chỉnh phần cần thiết và xác nhận cấu hình để áp dụng cho toàn workspace."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={totalIssues > 0 ? "warning" : "success"}>
              {totalIssues > 0 ? (
                <AlertCircle className="mr-1 size-3.5" aria-hidden />
              ) : (
                <Check className="mr-1 size-3.5" aria-hidden />
              )}
              {totalIssues > 0 ? `${totalIssues} mục cần kiểm tra` : "Không có mục chặn"}
            </Badge>
            <Badge variant="outline">Hoàn thiện {completionPercent}%</Badge>
          </div>
        }
      />

      <div className="rounded-2xl border border-primary-soft bg-card p-2 shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
        <div
          role="tablist"
          aria-label="Nhóm cấu hình Studio"
          aria-orientation="horizontal"
          className="flex gap-1 overflow-x-auto overscroll-x-contain pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0"
        >
          {STUDIO_TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            const tabStatus = getTabStatus(draft.sections, tab, index);

            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabButtonRefs.current[index] = node;
                }}
                id={`${idPrefix}-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${idPrefix}-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={cn(
                  "group min-h-20 min-w-[9.5rem] rounded-xl px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 lg:min-w-0",
                  isActive
                    ? "bg-background-dark text-on-dark shadow-sm"
                    : "text-foreground hover:bg-primary-soft"
                )}
              >
                <span className="flex items-start justify-between gap-2">
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-primary" : "text-foreground-muted"
                    )}
                    aria-hidden
                  />
                  {tabStatus.sections.length ? (
                    <span
                      className={cn(
                        "text-[10px] font-extrabold",
                        isActive ? "text-on-dark-muted" : "text-foreground-muted"
                      )}
                    >
                      {tabStatus.completionPercent}%
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 block text-xs font-extrabold leading-4">
                  {tab.shortLabel}
                </span>
                {tabStatus.sections.length && !tabStatus.enabled ? (
                  <span
                    className={cn(
                      "mt-1 block text-[10px] font-semibold",
                      isActive ? "text-amber-300" : "text-amber-700"
                    )}
                  >
                    Có mục đang tắt
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <section
        id={`${idPrefix}-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${activeTab}`}
        tabIndex={0}
        className="outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="mb-4 rounded-2xl border border-primary-soft bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-extrabold text-foreground">
                  {activeDefinition.label}
                </h2>
                {activeTabStatus.issues ? (
                  <Badge variant="warning">
                    <AlertCircle className="mr-1 size-3.5" aria-hidden />
                    {activeTabStatus.issues} mục cần kiểm tra
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                {activeDefinition.description}
              </p>
              {activeTabStatus.sections.length ? (
                <div className="mt-3 flex max-w-xl items-center gap-3">
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`Mức hoàn thiện ${activeDefinition.label}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={activeTabStatus.completionPercent}
                  >
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] motion-reduce:transition-none"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, activeTabStatus.completionPercent)
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-foreground-muted">
                    {activeTabStatus.completionPercent}% hoàn thiện
                  </span>
                </div>
              ) : null}
            </div>

            {activeTabStatus.sections.length ? (
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="w-full min-w-64 sm:w-72">
                  <StudioToggle
                    id={`${idPrefix}-section-enabled-${activeTab}`}
                    label="Kích hoạt nhóm"
                    description="Cho phép Agent dùng cấu hình này."
                    checked={activeTabStatus.enabled}
                    onChange={updateActiveSection}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <ActiveStudioPanel
          tabId={activeTab}
          config={draft}
          onChange={updateConfig}
          idPrefix={`${idPrefix}-${activeTab}`}
        />
      </section>

      <div className="sticky bottom-3 z-20 rounded-2xl border border-primary-soft bg-card p-3 shadow-[0_18px_50px_rgba(15,23,42,0.14)] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0" aria-live="polite">
            <p className="flex items-center gap-2 text-sm font-bold text-foreground">
              {saveState === "saved" ? (
                <FileCheck2 className="size-4 text-emerald-600" aria-hidden />
              ) : saveState === "error" ? (
                <AlertCircle className="size-4 text-red-600" aria-hidden />
              ) : isDirty ? (
                <Save className="size-4 text-amber-700" aria-hidden />
              ) : (
                <Check className="size-4 text-emerald-600" aria-hidden />
              )}
              {saveState === "saved"
                ? "Đã lưu và xác nhận cấu hình"
                : saveState === "error"
                  ? "Chưa lưu được cấu hình"
                  : isDirty
                    ? "Bạn có thay đổi chưa xác nhận"
                    : "Cấu hình đã sẵn sàng để xác nhận"}
            </p>
            <p
              className={cn(
                "mt-1 text-xs leading-5 text-foreground-muted",
                saveState === "error" && "text-red-700"
              )}
              role={saveState === "error" ? "alert" : undefined}
            >
              {saveError ??
                (saveState === "saved"
                  ? "Các rule mới sẽ được dùng cho những công việc tiếp theo."
                  : "Kiểm tra từng nhóm; chỉ một lần xác nhận sẽ áp dụng toàn bộ thay đổi.")}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={resetDraft}
              disabled={!isDirty || saveState === "saving"}
              className="h-11 sm:h-10"
            >
              <RotateCcw className="size-4" aria-hidden />
              Hoàn tác thay đổi
            </Button>
            <Button
              type="submit"
              disabled={saveState === "saving" || (saveState === "saved" && !isDirty)}
              className="h-11 min-w-44 sm:h-10"
            >
              {saveState === "saving" ? (
                <span
                  className="size-4 animate-spin rounded-full border-2 border-background-dark/35 border-t-background-dark motion-reduce:animate-none"
                  aria-hidden
                />
              ) : (
                <Save className="size-4" aria-hidden />
              )}
              {saveState === "saving"
                ? "Đang lưu..."
                : isDirty
                  ? "Lưu và xác nhận"
                  : "Xác nhận cấu hình"}
            </Button>
          </div>
        </div>
      </div>

    </form>
  );
}
