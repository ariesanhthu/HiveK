"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LoaderCircle, Search } from "lucide-react";

import { AgentAvatar } from "@/features/ai-chat/components/agent-avatar";
import { ChatComposer } from "@/features/ai-chat/components/chat-composer";
import { ChatHeader } from "@/features/ai-chat/components/chat-header";
import {
  ChatWelcome,
  type ChatWelcomePrompt,
} from "@/features/ai-chat/components/chat-welcome";
import { OnboardingDetailsForm } from "@/features/ai-chat/components/onboarding/onboarding-details-form";
import { OnboardingExecutionMode } from "@/features/ai-chat/components/onboarding/onboarding-execution-mode";
import { OnboardingInitializationCard } from "@/features/ai-chat/components/onboarding/onboarding-initialization-card";
import { OnboardingSourceReview } from "@/features/ai-chat/components/onboarding/onboarding-source-review";
import { detailsFromDiscoverySources } from "@/features/ai-chat/services/onboarding-discovery-service";
import type { UseAgentOnboardingResult } from "@/features/ai-chat/types/onboarding-types";
import { DashboardSidebar } from "@/features/business-dashboard/components/dashboard-sidebar";
import { useBusinessNavItems } from "@/features/business-dashboard/hooks/use-business-nav-items";

type AiChatOnboardingProps = {
  flow: UseAgentOnboardingResult;
  onReset: () => void;
};

const ONBOARDING_PROMPTS = [
  {
    id: "quick-start",
    label: "Bắt đầu nhanh",
    description:
      "Dùng dữ liệu mẫu The TutorX để đi qua đầy đủ luồng connect và khởi tạo.",
    icon: "link",
    value: "https://thetutorx.vn/",
  },
  {
    id: "analyze-content",
    label: "Quét website",
    description: "Bắt đầu bằng URL chính thức của thương hiệu.",
    icon: "globe",
    value: "https://thetutorx.vn/",
  },
  {
    id: "plan-posts",
    label: "Tìm theo tên",
    description: "Cho agent dò website và các kênh công khai cùng nhận diện.",
    icon: "search",
    value: "The TutorX",
  },
  {
    id: "campaign-ideas",
    label: "Connect social",
    description: "Mô phỏng bước kết nối các kênh social trước khi phân tích.",
    icon: "megaphone",
    value: "thetutorx social channels",
  },
] as const satisfies readonly ChatWelcomePrompt[];

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function UserMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[86%] rounded-[1.35rem] rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-6 text-white shadow-sm sm:max-w-[75%]">
        {children}
      </div>
    </div>
  );
}

function AgentMessage({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <AgentAvatar size="sm" className="mt-0.5" />
      <div className="max-w-[calc(100%_-_2.75rem)] rounded-[1.35rem] rounded-tl-md border border-slate-200 bg-card px-4 py-3 shadow-sm sm:max-w-[82%]">
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
            {eyebrow}
          </p>
        ) : null}
        <div className="text-sm leading-6 text-foreground">{children}</div>
      </div>
    </div>
  );
}

function DiscoveryCard({ query }: { query: string }) {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-[0_18px_55px_rgba(15,23,42,0.08)]"
      role="status"
    >
      <div className="border-b border-slate-100 bg-[linear-gradient(110deg,#fffaf0,#ffffff)] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-amber-800">
            <Search className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
              Đang tìm nguồn
            </p>
            <h3 className="mt-1 truncate text-base font-extrabold text-foreground">
              {query || "Thông tin doanh nghiệp"}
            </h3>
            <p className="mt-1 text-xs leading-5 text-foreground-muted">
              Tôi đang kiểm tra website và các trang công khai có cùng nhận diện.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-3 sm:p-5">
        {[
          ["Website", "Kiểm tra tên và liên hệ"],
          ["Kênh xã hội", "Đối chiếu handle và nội dung"],
          ["Dữ kiện", "Gom trường để bạn xác nhận"],
        ].map(([label, description]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
          >
            <span className="flex items-center gap-2 text-xs font-bold text-foreground">
              <LoaderCircle
                className="size-3.5 animate-spin text-amber-700 motion-reduce:animate-none"
                aria-hidden
              />
              {label}
            </span>
            <span className="mt-1 block text-[11px] leading-4 text-slate-500">
              {description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HydratingOnboarding() {
  const navItems = useBusinessNavItems();

  return (
    <main className="flex h-dvh min-h-0 w-full overflow-hidden bg-background-light">
      <DashboardSidebar items={navItems} />
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="h-[4.5rem] shrink-0 animate-pulse border-b border-slate-200 bg-card" />
        <div className="flex flex-1 items-center justify-center p-6" role="status">
          <div className="text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-amber-700">
              <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-bold text-foreground">
              Đang khôi phục tiến trình thiết lập…
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AiChatOnboarding({ flow, onReset }: AiChatOnboardingProps) {
  const navItems = useBusinessNavItems();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizationError, setFinalizationError] = useState<string | null>(
    null
  );
  const [finalizationAttempt, setFinalizationAttempt] = useState(0);
  const { state } = flow;

  useEffect(() => {
    if (
      state.stage !== "discovery" ||
      state.discovery.status !== "searching"
    ) {
      return;
    }

    let cancelled = false;
    const query = state.discovery.query;

    void import(
      "@/features/ai-chat/services/onboarding-discovery-service"
    )
      .then(({ discoverOnboardingWorkspace }) =>
        discoverOnboardingWorkspace(query)
      )
      .then((result) => {
        if (cancelled) return;

        if (!result.matched) {
          setAnnouncement(
            "Chưa tìm thấy nguồn phù hợp. Agent đang yêu cầu thông tin tối thiểu."
          );
          flow.reportDiscoveryFailure({
            query: result.query,
            reason: result.reason,
          });
          if (isHttpUrl(result.query)) {
            flow.saveDetails({ websiteUrl: result.query });
          }
          return;
        }

        setAnnouncement(
          `Đã tìm thấy ${result.sources.length} nguồn công khai để bạn kiểm tra.`
        );
        flow.completeDiscovery({
          query: result.query,
          sources: result.sources,
          summary: result.summary,
          result: "complete",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.info("[HIVE-K onboarding] Không thể đọc dữ liệu nguồn.", error);
        flow.reportDiscoveryFailure({
          query,
          reason:
            "Tôi chưa đọc được nguồn tự động. Bạn có thể nhập các thông tin tối thiểu bên dưới.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    flow.completeDiscovery,
    flow.reportDiscoveryFailure,
    flow.saveDetails,
    state.discovery.query,
    state.discovery.status,
    state.stage,
  ]);

  useEffect(() => {
    if (state.stage !== "initializing") return;

    const activeStep = state.initialization.steps.find(
      (step) => step.status === "in_progress"
    );
    const allComplete = state.initialization.steps.every(
      (step) => step.status === "complete"
    );

    if (activeStep) {
      const timer = window.setTimeout(() => {
        const selectedSources = state.connections.filter(
          (choice) =>
            choice.status === "selected" || choice.status === "connected"
        ).length;
        const completedDetailGroups = Object.values(state.details).filter(
          (value) =>
            Array.isArray(value) ? value.length > 0 : value.trim().length > 0
        ).length;
        const noteByStep = {
          validate_sources:
            selectedSources > 0
              ? `Đã ghi nhận ${selectedSources} nguồn và phạm vi đọc được người dùng chọn.`
              : "Không có nguồn ngoài; hồ sơ chỉ dùng thông tin người dùng vừa xác nhận.",
          build_brand_profile: `Đã chuẩn bị ${completedDetailGroups} nhóm dữ kiện thương hiệu từ thông tin đã xác nhận.`,
          build_channel_profiles:
            selectedSources > 0
              ? `Đã chuẩn bị hồ sơ cho ${selectedSources} nguồn/kênh đã chọn.`
              : "Chưa tạo hồ sơ kênh vì chưa có nguồn được kết nối.",
          suggest_satellites:
            "Đã chuẩn bị các đề xuất kênh vệ tinh để người dùng xem xét.",
          draft_strategy:
            "Đã soạn khung chiến lược ban đầu và giữ ở trạng thái chờ xác nhận.",
          prepare_analytics:
            "Đã chuẩn bị cấu trúc dashboard và ghi rõ phạm vi dữ liệu hiện có.",
        } as const;
        const needsReview = state.executionMode === "step_by_step";
        setAnnouncement(
          needsReview
            ? `${activeStep.label}: chờ bạn kiểm tra.`
            : `${activeStep.label}: hoàn tất.`
        );
        flow.advanceInitialization({
          stepId: activeStep.id,
          outcome: needsReview ? "needs_input" : "complete",
          note: noteByStep[activeStep.id],
        });
      }, 700);
      return () => window.clearTimeout(timer);
    }

    if (allComplete) {
      let cancelled = false;
      const timer = window.setTimeout(() => {
        setIsFinalizing(true);
        setFinalizationError(null);
        setAnnouncement("Đang lưu snapshot workspace.");

        void import(
          "@/features/ai-chat/services/onboarding-workspace-bootstrap"
        )
          .then(({ materializeOnboardingWorkspace }) =>
            materializeOnboardingWorkspace(state)
          )
          .then((saved) => {
            if (cancelled) return;
            if (!saved) {
              throw new Error(
                "Chưa thể lưu workspace trên trình duyệt này. Hãy thử lại trước khi mở workspace."
              );
            }
            setAnnouncement("Workspace đã sẵn sàng.");
            flow.finishInitialization();
          })
          .catch((error: unknown) => {
            if (cancelled) return;
            const message =
              error instanceof Error
                ? error.message
                : "Chưa thể chuẩn bị workspace. Hãy thử lại.";
            setFinalizationError(message);
            setAnnouncement(message);
          })
          .finally(() => {
            if (!cancelled) setIsFinalizing(false);
          });
      }, 800);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }
  }, [
    finalizationAttempt,
    flow.advanceInitialization,
    flow.finishInitialization,
    state.initialization.steps,
    state.connections,
    state.details,
    state.executionMode,
    state.stage,
  ]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [state.stage, state.initialization.steps]);

  const selectedConnectionCount = useMemo(
    () =>
      state.connections.filter(
        (choice) => choice.status === "selected" || choice.status === "connected"
      ).length,
    [state.connections]
  );

  if (!flow.isHydrated) return <HydratingOnboarding />;

  const initializationComplete = state.initialization.steps.every(
    (step) => step.status === "complete"
  );
  const completedSetupSteps =
    state.stage === "welcome" || state.stage === "mode"
      ? 0
      : state.stage === "discovery" || state.stage === "connect"
        ? 1
          : state.stage === "details"
          ? 2
          : initializationComplete
            ? 4
            : 3;
  const headerStatus =
    state.stage === "welcome"
      ? "Chờ bạn nhập nguồn để kết nối"
      : state.stage === "mode"
        ? "Chờ bạn chọn cách Agent làm việc"
      : state.stage === "discovery"
        ? "Đang tìm nguồn công khai"
        : state.stage === "connect"
          ? "Chờ bạn chọn nguồn"
          : state.stage === "details"
            ? "Chờ bạn xác nhận thông tin"
            : finalizationError
              ? "Cần thử lưu workspace lại"
              : initializationComplete
                ? "Đang hoàn thiện workspace"
                : "Đang khởi tạo workspace";
  const composerPending = state.stage !== "welcome";
  const composerPlaceholder =
    state.stage === "welcome"
      ? "Nhập website, fanpage hoặc tên thương hiệu để kết nối trước…"
      : state.stage === "mode"
        ? "Chọn một chế độ thiết lập ở phía trên"
      : state.stage === "discovery"
        ? "Agent đang tìm nguồn công khai…"
        : state.stage === "connect"
          ? "Chọn nguồn trong thẻ phía trên để tiếp tục"
          : state.stage === "details"
            ? "Kiểm tra biểu mẫu Agent đã điền phía trên"
            : "Agent đang khởi tạo workspace…";

  function beginDiscovery(query: string): void {
    setAnnouncement("Đã ghi nhận nguồn. Chờ chọn chế độ thiết lập.");
    flow.startDiscovery(query);
  }

  function beginQuickConnect(prompt: ChatWelcomePrompt): void {
    setAnnouncement(`Đã chọn ${prompt.label.toLowerCase()}. Chờ chọn chế độ thiết lập.`);
    flow.startDiscovery(prompt.value);
  }

  function selectExecutionMode(
    mode: Parameters<UseAgentOnboardingResult["selectExecutionMode"]>[0]
  ): void {
    setAnnouncement(
      mode === "automatic"
        ? "Đã chọn thực hiện tự động tất cả. Bắt đầu tìm nguồn."
        : "Đã chọn nhận phản hồi từng bước. Bắt đầu tìm nguồn."
    );
    flow.selectExecutionMode(mode);
  }

  function confirmSources(
    choices: Parameters<UseAgentOnboardingResult["saveConnections"]>[0]
  ): void {
    const selectedSourceIds = new Set(
      choices
        .filter(
          (choice) =>
            choice.status === "selected" || choice.status === "connected"
        )
        .map((choice) => choice.sourceId)
    );
    const selectedSources = state.discovery.sources.filter((source) =>
      selectedSourceIds.has(source.id)
    );
    flow.saveConnections(choices);
    flow.saveDetails(detailsFromDiscoverySources(selectedSources));
    setAnnouncement("Đã lưu lựa chọn nguồn. Hãy kiểm tra dữ liệu đã điền.");
  }

  function confirmDetails(
    details: Parameters<UseAgentOnboardingResult["saveDetails"]>[0]
  ): void {
    const hasSelectedConnection = state.connections.some(
      (choice) => choice.status === "selected" || choice.status === "connected"
    );

    if (!hasSelectedConnection && details.websiteUrl?.trim()) {
      flow.saveConnections([
        {
          sourceId: "source-user-website",
          decision: "manual",
          permission: "read_only",
          status: "selected",
          accountLabel: "Website do bạn cung cấp",
          accountUrl: details.websiteUrl.trim(),
          note: "Chờ kiểm tra nội dung ở bước khởi tạo.",
        },
      ]);
    }

    flow.saveDetails(details);
    flow.startInitialization();
    setAnnouncement("Đã xác nhận dữ liệu. Bắt đầu khởi tạo workspace.");
  }

  function retryInitialization(): void {
    if (finalizationError) {
      setFinalizationError(null);
      setFinalizationAttempt((attempt) => attempt + 1);
      return;
    }

    flow.advanceInitialization({
      outcome: "complete",
      note: "Đã thử lại và hoàn tất bước này.",
    });
  }

  function confirmInitializationStep(note: string): void {
    const reviewStep = state.initialization.steps.find(
      (step) => step.status === "needs_input"
    );
    if (!reviewStep) return;

    flow.advanceInitialization({
      stepId: reviewStep.id,
      outcome: "complete",
      note,
    });
    setAnnouncement(`${reviewStep.label}: đã xác nhận. Chuyển sang bước tiếp theo.`);
  }

  return (
    <main className="flex h-dvh min-h-0 w-full overflow-hidden bg-background-light">
      <a
        href="#onboarding-conversation"
        className="sr-only z-[70] rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Chuyển đến cuộc trò chuyện thiết lập
      </a>

      <DashboardSidebar items={navItems} />
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          completedSetupSteps={completedSetupSteps}
          totalSetupSteps={4}
          showSetupProgress={state.stage !== "welcome"}
          hasConversation={state.stage !== "welcome"}
          navItems={navItems}
          onReset={onReset}
          statusText={headerStatus}
          isBusy={
            state.stage === "discovery" ||
            (state.stage === "initializing" && !finalizationError)
          }
          resetDisabled={isFinalizing}
        />

        <div
          id="onboarding-conversation"
          ref={scrollRef}
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_38%,#f8fafc_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          {state.stage === "welcome" ? (
            <ChatWelcome
              prompts={ONBOARDING_PROMPTS}
              onSelectPrompt={beginQuickConnect}
            />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-5 sm:px-5 sm:py-7">
              {state.discovery.query ? (
                <UserMessage>{state.discovery.query}</UserMessage>
              ) : null}

              {state.stage === "mode" ? (
                <>
                  <AgentMessage eyebrow="Cách Agent làm việc">
                    Tôi đã ghi nhận nguồn bạn muốn kết nối. Trước khi quét dữ liệu,
                    hãy chọn để tôi tự động hoàn tất toàn bộ hoặc dừng lại xin xác
                    nhận sau từng đầu việc.
                  </AgentMessage>
                  <OnboardingExecutionMode
                    sourceLabel={state.discovery.query || "Nguồn bạn vừa cung cấp"}
                    onSelect={selectExecutionMode}
                  />
                </>
              ) : null}

              {state.stage === "discovery" ? (
                <>
                  <AgentMessage eyebrow="Đang thực hiện">
                    Tôi sẽ tìm nguồn công khai trước. Nếu không nhận diện được hoặc
                    không thể thêm nguồn, tôi sẽ hỏi bạn đúng những trường còn thiếu.
                  </AgentMessage>
                  <DiscoveryCard query={state.discovery.query} />
                </>
              ) : null}

              {state.stage === "connect" ? (
                <>
                  <AgentMessage eyebrow="Đã có kết quả">
                    Tôi đã tìm thấy các trang có cùng nhận diện. Hãy chọn nguồn bạn
                    muốn dùng; hiện tại tôi chỉ đọc phần công khai và không có quyền
                    đăng bài.
                  </AgentMessage>
                  <OnboardingSourceReview
                    sources={state.discovery.sources}
                    summary={state.discovery.summary}
                    onConfirm={confirmSources}
                    onSearchAgain={onReset}
                  />
                </>
              ) : null}

              {state.stage === "details" ? (
                <>
                  <AgentMessage
                    eyebrow={
                      state.discovery.status === "failed"
                        ? "Tôi cần bạn hỗ trợ"
                        : "Bước xác nhận"
                    }
                  >
                    {state.discovery.status === "failed" ? (
                      <>
                        Tôi chưa tự nối được thông tin này với một nguồn đủ tin cậy.
                        Hãy nhập một URL website/fanpage cùng tên thương hiệu, lĩnh
                        vực và thị trường; các trường khác có thể bổ sung sau.
                      </>
                    ) : (
                      <>
                        Tôi đã điền các trường đọc được từ nguồn. Bạn chỉ cần sửa chỗ
                        chưa đúng rồi xác nhận để tôi tạo toàn bộ hồ sơ liên quan.
                      </>
                    )}
                  </AgentMessage>
                  <OnboardingDetailsForm
                    details={state.details}
                    discoveryFailed={state.discovery.status === "failed"}
                    failureReason={state.discovery.failureReason}
                    connectedSourceCount={selectedConnectionCount}
                    onSubmit={confirmDetails}
                    onSearchAgain={onReset}
                  />
                </>
              ) : null}

              {state.stage === "initializing" ? (
                <>
                  <AgentMessage eyebrow="Đang khởi tạo">
                    {state.executionMode === "step_by_step"
                      ? "Tôi sẽ dựng lần lượt hồ sơ thương hiệu, kênh, vệ tinh, chiến lược, dashboard và cấu hình Studio. Mỗi bước sẽ dừng để bạn chỉnh sửa và xác nhận."
                      : "Tôi đang dựng hồ sơ thương hiệu, kênh, vệ tinh, chiến lược, dashboard và cấu hình Studio. Bạn chưa cần nhập thêm gì ở bước này."}
                  </AgentMessage>
                  <OnboardingInitializationCard
                    checklist={state.initialization}
                    storageStatus={flow.storageStatus}
                    isFinalizing={isFinalizing}
                    finalizationError={finalizationError}
                    executionMode={state.executionMode ?? "automatic"}
                    onConfirmStep={confirmInitializationStep}
                    onRetry={retryInitialization}
                  />
                </>
              ) : null}
            </div>
          )}
        </div>

        <ChatComposer
          onSubmit={beginDiscovery}
          isPending={composerPending}
          placeholder={composerPlaceholder}
          submitLabel={state.stage === "welcome" ? "Kết nối" : undefined}
        />
      </section>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </main>
  );
}
