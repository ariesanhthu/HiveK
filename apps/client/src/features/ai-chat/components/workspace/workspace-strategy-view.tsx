"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Flag,
  Layers3,
  Network,
  PencilLine,
  Route,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StrategyEditorDrawer } from "@/features/ai-chat/components/workspace/strategy-editor-drawer";
import { WorkspaceSectionHeading } from "@/features/ai-chat/components/workspace/workspace-section-heading";
import type {
  NinetyDayStrategy,
  NinetyDayStrategyPatch,
  SocialPlatform,
  StrategyContentPillar,
  StrategyFunnelStage,
  StrategyPhase,
  StrategyPriority,
} from "@/features/ai-chat/types/workspace-types";
import { cn } from "@/lib/utils";

export type WorkspaceStrategyViewProps = {
  strategy: NinetyDayStrategy;
  onUpdateStrategy: (patch: NinetyDayStrategyPatch) => void;
  onConfirmStrategy: () => void;
};

type StrategyOnlyProps = Pick<WorkspaceStrategyViewProps, "strategy">;

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  website: "Website",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
};

const FUNNEL_LABELS: Record<StrategyContentPillar["funnelStage"], string> = {
  awareness: "Nhận biết",
  consideration: "Cân nhắc",
  conversion: "Chuyển đổi",
  retention: "Duy trì",
};

const PRIORITY_STATUS: Record<
  StrategyPriority["status"],
  { label: string; className: string }
> = {
  not_started: {
    label: "Chưa bắt đầu",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  in_progress: {
    label: "Đang thực hiện",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  completed: {
    label: "Đã hoàn tất",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  blocked: {
    label: "Đang bị chặn",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value));
}

function PriorityStatusIcon({ status }: { status: StrategyPriority["status"] }) {
  if (status === "completed") {
    return <CheckCircle2 className="size-4" aria-hidden />;
  }

  if (status === "in_progress") {
    return <Clock3 className="size-4" aria-hidden />;
  }

  if (status === "blocked") {
    return <Flag className="size-4" aria-hidden />;
  }

  return <CircleDashed className="size-4" aria-hidden />;
}

function StrategySummary({ strategy }: StrategyOnlyProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.55fr)]">
      <div className="relative overflow-hidden rounded-2xl bg-background-dark p-5 text-on-dark shadow-sm sm:p-6">
        <div
          aria-hidden
          className="absolute -right-16 -top-20 size-52 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-300">
            <Target className="size-4" aria-hidden />
            North star
          </span>
          <p className="mt-3 max-w-3xl text-lg font-bold leading-7 sm:text-xl">
            {strategy.northStar}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-on-dark-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarRange className="size-4" aria-hidden />
              {formatDate(strategy.startDate)} – {formatDate(strategy.endDate)}
            </span>
            <span>Múi giờ: {strategy.timezone}</span>
          </div>
        </div>
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
            <Flag className="size-4 text-primary" aria-hidden />
            Mục tiêu cần giữ
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {strategy.objectives.map((objective) => (
              <li
                key={objective}
                className="flex gap-2.5 text-sm leading-5 text-foreground-muted"
              >
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  aria-hidden
                />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function PriorityQueue({ priorities }: { priorities: StrategyPriority[] }) {
  return (
    <section aria-labelledby="strategy-priorities-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
            Bắt đầu từ đây
          </p>
          <h3
            id="strategy-priorities-title"
            className="mt-1 text-lg font-extrabold text-foreground"
          >
            Ưu tiên cần triển khai
          </h3>
        </div>
        <Badge variant="outline">{priorities.length} đầu việc</Badge>
      </div>

      <ol className="grid gap-3 lg:grid-cols-2">
        {priorities.map((priority) => {
          const status = PRIORITY_STATUS[priority.status];

          return (
            <li
              key={priority.id}
              className="rounded-2xl border border-primary-soft bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-extrabold text-amber-700">
                  {priority.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="font-bold leading-5 text-foreground">
                      {priority.title}
                    </h4>
                    <Badge className={cn("gap-1", status.className)}>
                      <PriorityStatusIcon status={priority.status} />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-foreground-muted">
                    {priority.reason}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-foreground-muted">
                    {priority.owner} · hoàn tất trước ngày {priority.dueDay}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function PhaseCard({ phase, index }: { phase: StrategyPhase; index: number }) {
  return (
    <article className="relative min-w-0 rounded-2xl border border-primary-soft bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-background-dark text-sm font-extrabold text-on-dark">
          {index + 1}
        </span>
        <Badge variant="secondary">{phase.dayRange}</Badge>
      </div>
      <h4 className="mt-4 text-base font-extrabold text-foreground">
        {phase.name}
      </h4>
      <p className="mt-1 text-sm font-semibold leading-5 text-amber-700">
        {phase.objective}
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-bold text-foreground">Trọng tâm</p>
          <ul className="mt-2 space-y-1.5">
            {phase.focus.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-xs leading-5 text-foreground-muted"
              >
                <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-muted p-3">
          <p className="text-xs font-bold text-foreground">Đầu ra kiểm chứng được</p>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            {phase.deliverables.join(" · ")}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5" aria-label="Phân bổ kênh">
          {phase.channelMix.map((channel) => (
            <span
              key={channel.platform}
              className="rounded-full border border-primary-soft px-2 py-1 text-[11px] font-semibold text-foreground-muted"
              title={channel.purpose}
            >
              {PLATFORM_LABELS[channel.platform]} {channel.sharePercent}%
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function NinetyDayRoadmap({ phases }: { phases: StrategyPhase[] }) {
  return (
    <section aria-labelledby="strategy-roadmap-title">
      <div className="mb-3 flex items-center gap-2">
        <Route className="size-5 text-primary" aria-hidden />
        <h3 id="strategy-roadmap-title" className="text-lg font-extrabold text-foreground">
          Lộ trình 90 ngày
        </h3>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {phases.map((phase, index) => (
          <PhaseCard key={phase.id} phase={phase} index={index} />
        ))}
      </div>
    </section>
  );
}

function PillarMap({ pillars }: { pillars: StrategyContentPillar[] }) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Layers3 className="size-5 text-primary" aria-hidden />
          <h3 className="text-base font-extrabold text-foreground">Content pillar</h3>
        </div>
        <p className="text-xs leading-5 text-foreground-muted">
          Tỷ trọng nội dung và vai trò trong hành trình khách hàng.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {pillars.map((pillar) => (
          <div key={pillar.id}>
            <div className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-bold text-foreground">{pillar.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-foreground-muted">
                  {pillar.description}
                </p>
              </div>
              <span className="shrink-0 font-extrabold text-amber-700">
                {pillar.sharePercent}%
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={`Tỷ trọng ${pillar.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pillar.sharePercent}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pillar.sharePercent}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{FUNNEL_LABELS[pillar.funnelStage]}</Badge>
              {pillar.formats.slice(0, 2).map((format) => (
                <Badge key={format} variant="outline">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FunnelMap({ funnel }: { funnel: StrategyFunnelStage[] }) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-primary" aria-hidden />
          <h3 className="text-base font-extrabold text-foreground">Bản đồ phễu</h3>
        </div>
        <p className="text-xs leading-5 text-foreground-muted">
          Mỗi tầng có mục tiêu, CTA và tín hiệu thành công riêng.
        </p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {funnel.map((stage, index) => (
            <li key={stage.id} className="flex gap-3 rounded-xl bg-muted p-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-card text-xs font-extrabold text-amber-700 shadow-sm">
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-foreground">
                    {FUNNEL_LABELS[stage.stage]}
                  </p>
                  <span className="text-xs text-foreground-muted">→ {stage.cta}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-foreground-muted">
                  {stage.objective}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                  Đo bằng: {stage.successMetric}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function ChannelMap({ strategy }: StrategyOnlyProps) {
  return (
    <Card className="shadow-none lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Network className="size-5 text-primary" aria-hidden />
          <h3 className="text-base font-extrabold text-foreground">Vai trò từng kênh</h3>
        </div>
        <p className="text-xs leading-5 text-foreground-muted">
          Không nhân bản cùng một nội dung; mỗi kênh đảm nhận một nhiệm vụ trong phễu.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {strategy.channelPlan.map((channel) => (
            <article
              key={channel.platform}
              className="rounded-xl border border-primary-soft p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-extrabold text-foreground">
                  {PLATFORM_LABELS[channel.platform]}
                </h4>
                <Badge variant="secondary">{channel.weeklyCadence}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-foreground-muted">
                {channel.role}
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
                KPI chính
              </p>
              <p className="mt-1 text-xs font-semibold text-foreground">
                {channel.primaryKpi}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {channel.priorityFormats.map((format) => (
                  <span
                    key={format}
                    className="rounded-md bg-muted px-2 py-1 text-[11px] text-foreground-muted"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SatelliteRoadmap({ phases }: { phases: StrategyPhase[] }) {
  return (
    <section
      aria-labelledby="satellite-roadmap-title"
      className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-violet-700" aria-hidden />
            <h3
              id="satellite-roadmap-title"
              className="text-lg font-extrabold text-slate-950"
            >
              Lộ trình kênh vệ tinh
            </h3>
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
            Mở kênh theo từng pha để kiểm chứng nhu cầu trước khi tăng sản lượng.
          </p>
        </div>
        <Badge className="w-fit border-violet-200 bg-white text-violet-700">
          Có kiểm soát thương hiệu
        </Badge>
      </div>

      <ol className="mt-4 grid gap-3 lg:grid-cols-3">
        {phases.map((phase, phaseIndex) => (
          <li key={phase.id} className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs font-extrabold text-violet-700">
              Pha {phaseIndex + 1} · {phase.dayRange}
            </p>
            <ul className="mt-2 space-y-2">
              {phase.satelliteActions.map((action) => (
                <li key={action} className="flex gap-2 text-xs leading-5 text-slate-600">
                  <ArrowRight className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {action}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function WorkspaceStrategyView({
  strategy,
  onUpdateStrategy,
  onConfirmStrategy,
}: WorkspaceStrategyViewProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const openEditor = useCallback(() => setIsEditorOpen(true), []);
  const closeEditor = useCallback(() => setIsEditorOpen(false), []);

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <WorkspaceSectionHeading
          eyebrow="Kế hoạch đã điền sẵn"
          title={strategy.title}
          description="HIVE-K đã tổng hợp hồ sơ thương hiệu, vai trò kênh và dữ liệu hiện có thành kế hoạch có thể rà soát trước khi đưa vào lịch."
          action={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={openEditor}
              >
                <PencilLine className="size-4" aria-hidden />
                Chỉnh sửa &amp; xác nhận
              </Button>
              <Link
                href="/campaign-planning"
                className={cn(buttonVariants({ size: "sm" }), "w-full sm:w-auto")}
              >
                Mở trình lập chiến dịch
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          }
        />

        <section
          aria-label="Trạng thái duyệt chiến lược"
          className={cn(
            "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
            strategy.status === "confirmed"
              ? "border-emerald-200 bg-emerald-50/70"
              : "border-amber-200 bg-amber-50/70"
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
                strategy.status === "confirmed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {strategy.status === "confirmed" ? (
                <CheckCircle2 className="size-4" aria-hidden />
              ) : (
                <CircleDashed className="size-4" aria-hidden />
              )}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-extrabold text-foreground">
                  {strategy.status === "confirmed"
                    ? "Kế hoạch đã được người dùng xác nhận"
                    : "Kế hoạch đang chờ người dùng xác nhận"}
                </p>
                <Badge
                  variant={
                    strategy.status === "confirmed" ? "success" : "warning"
                  }
                >
                  {strategy.status === "confirmed" ? "Đã xác nhận" : "Cần rà soát"}
                </Badge>
              </div>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                {strategy.status === "confirmed" && strategy.confirmedAt
                  ? `Xác nhận lúc ${DATE_TIME_FORMATTER.format(new Date(strategy.confirmedAt))}.`
                  : "Rà soát north star, mục tiêu, thời gian và trạng thái ưu tiên trước khi vận hành."}
                {` Có ${strategy.provenance.length} dấu vết nguồn và chỉnh sửa.`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={openEditor}
          >
            {strategy.status === "confirmed" ? "Mở bản đã duyệt" : "Rà soát ngay"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </section>

        <StrategySummary strategy={strategy} />
        <PriorityQueue priorities={strategy.priorities} />
        <NinetyDayRoadmap phases={strategy.phases} />

        <section aria-label="Bản đồ chiến lược" className="grid gap-4 lg:grid-cols-2">
          <PillarMap pillars={strategy.contentPillars} />
          <FunnelMap funnel={strategy.funnel} />
          <ChannelMap strategy={strategy} />
        </section>

        <SatelliteRoadmap phases={strategy.phases} />
      </div>

      {isEditorOpen ? (
        <StrategyEditorDrawer
          strategy={strategy}
          onClose={closeEditor}
          onUpdate={onUpdateStrategy}
          onConfirm={onConfirmStrategy}
        />
      ) : null}
    </>
  );
}
