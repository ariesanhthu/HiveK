"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileCheck2,
  Link2,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceSectionHeading } from "@/features/ai-chat/components/workspace/workspace-section-heading";
import type {
  AgentWorkspaceData,
  WorkspaceTask,
  WorkspaceViewId,
} from "@/features/ai-chat/types/workspace-types";
import { cn } from "@/lib/utils";

type WorkspaceOverviewViewProps = {
  data: AgentWorkspaceData;
  onNavigate: (view: WorkspaceViewId) => void;
  onOpenFact: (factId: string) => void;
};

const TASK_STYLES: Record<
  WorkspaceTask["priority"],
  { label: string; className: string }
> = {
  high: {
    label: "Ưu tiên cao",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  medium: {
    label: "Cần xem",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  low: {
    label: "Gợi ý",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

function formatDateTime(value: string): string {
  return DATE_TIME_FORMATTER.format(new Date(value));
}

export function WorkspaceOverviewView({
  data,
  onNavigate,
  onOpenFact,
}: WorkspaceOverviewViewProps) {
  const pendingFacts = data.brand.facts.filter((fact) => fact.status === "needs_review");
  const connectedChannels = data.channels.filter(
    (channel) => channel.connectionStatus === "connected"
  );
  const activeTasks = [...data.studio.tasks]
    .filter((task) => task.status !== "done")
    .sort((left, right) => {
      const weight = { high: 0, medium: 1, low: 2 } as const;
      return weight[left.priority] - weight[right.priority];
    })
    .slice(0, 4);
  const currentPhase =
    data.strategy.phases.find((phase) =>
      data.strategy.priorities.some(
        (priority) =>
          priority.status === "in_progress" &&
          phase.satelliteActions.some((action) => action.includes(priority.title))
      )
    ) ?? data.strategy.phases[0];

  function handlePrimaryAction(): void {
    const firstPendingFact = pendingFacts[0];
    if (firstPendingFact) {
      onOpenFact(firstPendingFact.id);
      return;
    }
    onNavigate("strategy");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <WorkspaceSectionHeading
        eyebrow="Agent workspace"
        title={`Tổng quan ${data.workspace.name}`}
        description="Dữ liệu công khai và thông tin bạn cung cấp đã được tổng hợp thành hồ sơ có cấu trúc. Các mục cần quyết định được đưa lên trước, sau đó mới đến kế hoạch và hiệu quả."
        action={
          <Button onClick={handlePrimaryAction}>
            {pendingFacts.length > 0
              ? `Duyệt ${pendingFacts.length} dữ kiện`
              : "Mở chiến lược 90 ngày"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        }
      />

      <section
        className="overflow-hidden rounded-3xl border border-amber-200 bg-[linear-gradient(125deg,#fffaf0_0%,#ffffff_52%,#f8fafc_100%)] shadow-[0_18px_55px_rgba(245,158,11,0.08)]"
        aria-labelledby="workspace-readiness-title"
      >
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
              <ShieldCheck className="size-4" aria-hidden />
              HỒ SƠ SẴN SÀNG ĐỂ DUYỆT
            </div>
            <h2
              id="workspace-readiness-title"
              className="mt-3 max-w-2xl text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl"
            >
              HiveK đã điền và phân loại toàn bộ trường cốt lõi
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-muted">
              {data.brand.readiness.summary} Mọi dữ kiện quan trọng đều có nguồn hoặc nhãn chất lượng dữ liệu để bạn đối chiếu trước khi xác nhận.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="success">
                <CheckCircle2 className="mr-1 size-3.5" aria-hidden />
                {data.brand.readiness.allFacts.confirmed}/{data.brand.readiness.allFacts.total} dữ kiện đã duyệt
              </Badge>
              <Badge variant="secondary">
                <Network className="mr-1 size-3.5" aria-hidden />
                {connectedChannels.length}/{data.channels.length} kênh đã kết nối
              </Badge>
              {pendingFacts.length > 0 ? (
                <Badge variant="warning">
                  <CircleAlert className="mr-1 size-3.5" aria-hidden />
                  {pendingFacts.length} mục cần bạn xác nhận
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
                  Mức sẵn sàng
                </p>
                <p className="mt-1 text-4xl font-black tracking-tight text-foreground">
                  {data.brand.readiness.score}
                  <span className="text-xl text-foreground-muted">%</span>
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold",
                  data.brand.readiness.score >= 70
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                )}
              >
                {data.brand.readiness.score >= 70 ? "Có thể lập kế hoạch" : "Cần duyệt thêm"}
              </span>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Mức sẵn sàng của hồ sơ thương hiệu"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={data.brand.readiness.score}
            >
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#22c55e)]"
                style={{ width: `${data.brand.readiness.score}%` }}
              />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-foreground-muted">Dữ kiện bắt buộc</dt>
                <dd className="mt-1 font-extrabold text-foreground">
                  {data.brand.readiness.requiredFacts.confirmed}/{data.brand.readiness.requiredFacts.total}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-foreground-muted">Chưa giải quyết</dt>
                <dd className="mt-1 font-extrabold text-foreground">
                  {data.brand.readiness.unresolvedItems} mục
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="priority-tasks-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="priority-tasks-title" className="text-lg font-extrabold text-foreground">
              Việc cần bạn xử lý
            </h2>
            <p className="mt-1 text-xs text-foreground-muted">
              Chỉ hiển thị các việc có ảnh hưởng cao nhất ở thời điểm hiện tại.
            </p>
          </div>
          <span className="text-xs font-bold text-foreground-muted">
            {activeTasks.length} việc đang mở
          </span>
        </div>

        {activeTasks.length > 0 ? (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {activeTasks.map((task) => {
              const style = TASK_STYLES[task.priority];
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onNavigate(task.view)}
                  className="group flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-card p-4 text-left shadow-sm transition-[border-color,box-shadow] hover:border-amber-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <CircleAlert className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-foreground">
                        {task.title}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                          style.className
                        )}
                      >
                        {style.label}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-xs leading-5 text-foreground-muted">
                      {task.description}
                    </span>
                    <span className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-700">
                      Mở đúng màn hình
                      <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Không có việc chặn. Bạn có thể tiếp tục với chiến lược nội dung.
          </div>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-foreground">
                  Nguồn đã phân tích
                </h2>
                <p className="mt-1 text-xs text-foreground-muted">
                  Truy ngược được từng dữ kiện về nguồn quan sát.
                </p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-foreground-muted">
                <RefreshCw className="size-3.5" aria-hidden />
                {formatDateTime(data.workspace.lastAnalyzedAt)}
              </span>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {data.studio.sources.slice(0, 6).map((source) => (
                <div key={source.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Link2 className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground">{source.name}</p>
                    <p className="mt-0.5 text-[11px] text-foreground-muted">
                      {source.permission === "read_publish" ? "Đọc và xuất bản" : "Chỉ đọc"} · {source.status === "connected" ? "Đã kết nối" : source.status === "public_only" ? "Nguồn công khai" : "Cần chú ý"}
                    </p>
                  </div>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-foreground-muted hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      aria-label={`Mở nguồn ${source.name}`}
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-foreground">
                  Chiến lược đang áp dụng
                </h2>
                <p className="mt-1 text-xs text-foreground-muted">{data.strategy.title}</p>
              </div>
              <Sparkles className="size-5 text-amber-600" aria-hidden />
            </div>
            {currentPhase ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-extrabold text-foreground">{currentPhase.name}</span>
                  <Badge variant="secondary">{currentPhase.dayRange}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-foreground-muted">
                  {currentPhase.objective}
                </p>
                <ul className="mt-3 space-y-2">
                  {currentPhase.focus.slice(0, 3).map((item) => (
                    <li key={item} className="flex gap-2 text-xs text-foreground">
                      <FileCheck2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => onNavigate("strategy")}
            >
              Xem lộ trình 90 ngày
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onNavigate("channels")}
          className="rounded-2xl border border-slate-200 bg-card p-4 text-left hover:border-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Network className="size-5 text-amber-600" aria-hidden />
          <p className="mt-3 text-sm font-extrabold text-foreground">{data.channels.length} kênh hiện có</p>
          <p className="mt-1 text-xs text-foreground-muted">Xem quyền, vai trò và hồ sơ từng kênh</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("satellites")}
          className="rounded-2xl border border-slate-200 bg-card p-4 text-left hover:border-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Sparkles className="size-5 text-violet-600" aria-hidden />
          <p className="mt-3 text-sm font-extrabold text-foreground">{data.satellites.length} hồ sơ vệ tinh</p>
          <p className="mt-1 text-xs text-foreground-muted">Đã điền bio, vai trò, nội dung và CTA</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("analytics")}
          className="rounded-2xl border border-slate-200 bg-card p-4 text-left hover:border-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Clock3 className="size-5 text-blue-600" aria-hidden />
          <p className="mt-3 text-sm font-extrabold text-foreground">{data.analytics.dataCompletenessPercent}% dữ liệu phân tích</p>
          <p className="mt-1 text-xs text-foreground-muted">Insight luôn kèm mức tin cậy và số mẫu</p>
        </button>
      </div>
    </div>
  );
}
