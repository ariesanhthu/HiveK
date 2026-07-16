"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Database,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WorkspaceAnalyticsChartsProps } from "@/features/ai-chat/components/workspace/workspace-analytics-charts";
import { WorkspaceSectionHeading } from "@/features/ai-chat/components/workspace/workspace-section-heading";
import type {
  AnalyticsInsight,
  AnalyticsPriority,
  DataQuality,
  SocialPlatform,
  WorkspaceAnalytics,
  WorkspaceViewId,
} from "@/features/ai-chat/types/workspace-types";
import { cn } from "@/lib/utils";

export type WorkspaceAnalyticsViewProps = {
  analytics: WorkspaceAnalytics;
  onNavigate?: (view: WorkspaceViewId) => void;
  onApplyInsight?: (insight: AnalyticsInsight) => void;
};

const WorkspaceAnalyticsCharts = dynamic<WorkspaceAnalyticsChartsProps>(
  () =>
    import(
      "@/features/ai-chat/components/workspace/workspace-analytics-charts"
    ).then((module) => module.WorkspaceAnalyticsCharts),
  {
    ssr: false,
    loading: () => <WorkspaceAnalyticsChartsSkeleton />,
  }
);

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  website: "Website",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
};

const PLATFORM_IDS = Object.keys(PLATFORM_LABELS) as SocialPlatform[];

const VIEW_LABELS: Record<WorkspaceViewId, string> = {
  overview: "Tổng quan",
  brand: "Hồ sơ thương hiệu",
  channels: "Kênh chính",
  satellites: "Kênh vệ tinh",
  strategy: "Chiến lược",
  analytics: "Phân tích",
  studio: "Studio config",
};

const DATA_QUALITY_META: Record<
  DataQuality,
  { label: string; className: string }
> = {
  verified: {
    label: "Đã xác minh",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  user_provided: {
    label: "Người dùng cung cấp",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  estimated: {
    label: "Dữ liệu ước tính",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

const PRIORITY_META: Record<
  AnalyticsPriority["severity"],
  { label: string; className: string }
> = {
  high: {
    label: "Cần xử lý ngay",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  medium: {
    label: "Nên xử lý sớm",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  low: {
    label: "Theo dõi",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

const CONFIDENCE_META: Record<
  AnalyticsInsight["confidence"],
  { label: string; className: string }
> = {
  high: {
    label: "Tin cậy cao",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  medium: {
    label: "Tin cậy trung bình",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  low: {
    label: "Tín hiệu ban đầu",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

const NUMBER_FORMATTER = new Intl.NumberFormat("vi-VN");

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value));
}

function formatChannelId(channelId: string) {
  const normalizedId = channelId.toLowerCase();
  const platform = PLATFORM_IDS.find((candidate) =>
    normalizedId.includes(candidate)
  );

  return platform ? PLATFORM_LABELS[platform] : channelId;
}

function QualityBadge({ quality }: { quality: DataQuality }) {
  const meta = DATA_QUALITY_META[quality];

  return <Badge className={meta.className}>{meta.label}</Badge>;
}

export function WorkspaceAnalyticsChartsSkeleton() {
  return (
    <section
      className="grid gap-4 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Đang tải biểu đồ phân tích"
    >
      <div className="rounded-2xl border border-primary-soft bg-card p-4 lg:col-span-2">
        <div className="h-5 w-40 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="mt-3 h-72 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      </div>
      <div className="rounded-2xl border border-primary-soft bg-card p-4">
        <div className="h-5 w-36 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="mt-3 h-72 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      </div>
      <span className="sr-only" role="status">
        Đang tải biểu đồ. Các số liệu và tóm tắt dạng chữ vẫn được hiển thị sau khi hoàn tất.
      </span>
    </section>
  );
}

function PriorityAndQuality({
  analytics,
  onNavigate,
}: Pick<WorkspaceAnalyticsViewProps, "analytics" | "onNavigate">) {
  const qualityMeta = DATA_QUALITY_META[analytics.dataQuality];

  return (
    <section
      aria-labelledby="analytics-priority-title"
      className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]"
    >
      <Card className="border-amber-200 shadow-none">
        <CardHeader className="border-b border-amber-100 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
                Trước khi đọc KPI
              </p>
              <h3
                id="analytics-priority-title"
                className="mt-1 text-lg font-extrabold text-foreground"
              >
                Việc cần bạn xử lý
              </h3>
            </div>
            <Badge variant="warning">{analytics.priorities.length} ưu tiên</Badge>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-amber-100 pt-1">
          {analytics.priorities.length > 0 ? (
            analytics.priorities.map((priority) => {
              const meta = PRIORITY_META[priority.severity];

              return (
                <article
                  key={priority.id}
                  className="flex flex-col gap-3 py-4 first:pt-3 sm:flex-row sm:items-start"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                      meta.className
                    )}
                  >
                    {priority.severity === "high" ? (
                      <AlertTriangle className="size-4" aria-hidden />
                    ) : (
                      <CircleAlert className="size-4" aria-hidden />
                    )}
                    <span className="sr-only">{meta.label}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-foreground">{priority.title}</h4>
                      <Badge className={meta.className}>{meta.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-foreground-muted">
                      {priority.detail}
                    </p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-foreground">
                      Đề xuất: {priority.recommendedAction}
                    </p>
                  </div>
                  {onNavigate ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => onNavigate(priority.relatedView)}
                      aria-label={`${priority.recommendedAction}. Mở ${VIEW_LABELS[priority.relatedView]}`}
                    >
                      Mở {VIEW_LABELS[priority.relatedView]}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Button>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="flex items-center gap-3 py-5">
              <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />
              <p className="text-sm font-semibold text-foreground">
                Không có vấn đề chặn cần xử lý trong kỳ này.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft text-amber-700">
              <Database className="size-5" aria-hidden />
            </span>
            <Badge className={qualityMeta.className}>{qualityMeta.label}</Badge>
          </div>
          <h3 className="pt-2 text-base font-extrabold text-foreground">
            Độ đầy đủ dữ liệu
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-3">
            <strong className="text-3xl font-black tracking-tight text-foreground">
              {analytics.dataCompletenessPercent}%
            </strong>
            <span className="pb-1 text-xs text-foreground-muted">trong kỳ phân tích</span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Độ đầy đủ dữ liệu phân tích"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={analytics.dataCompletenessPercent}
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${analytics.dataCompletenessPercent}%` }}
            />
          </div>
          <p className="mt-4 text-xs leading-5 text-foreground-muted">
            {analytics.dataQualityNote}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function KpiGrid({ analytics }: Pick<WorkspaceAnalyticsViewProps, "analytics">) {
  return (
    <section aria-labelledby="analytics-kpi-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="analytics-kpi-title" className="text-lg font-extrabold text-foreground">
            Chỉ số theo mục tiêu
          </h3>
          <p className="mt-1 text-xs text-foreground-muted">
            {analytics.dateRange.comparisonLabel}
          </p>
        </div>
        <QualityBadge quality={analytics.dataQuality} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {analytics.kpis.map((kpi) => {
          const deltaLabel =
            kpi.deltaPercent === null
              ? "Chưa có kỳ so sánh"
              : `${kpi.deltaPercent > 0 ? "+" : ""}${kpi.deltaPercent.toLocaleString("vi-VN")}% so với kỳ trước`;

          return (
            <Card key={kpi.id} className="shadow-none">
              <CardContent className="pt-4 md:pt-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-foreground-muted">{kpi.label}</p>
                  <QualityBadge quality={kpi.dataQuality} />
                </div>
                <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
                  {kpi.formattedValue}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-foreground-muted">
                  {kpi.deltaPercent !== null && kpi.deltaPercent > 0 ? (
                    <TrendingUp className="size-3.5 text-emerald-600" aria-hidden />
                  ) : kpi.deltaPercent !== null && kpi.deltaPercent < 0 ? (
                    <TrendingDown className="size-3.5 text-red-600" aria-hidden />
                  ) : (
                    <BarChart3 className="size-3.5" aria-hidden />
                  )}
                  <span>{deltaLabel}</span>
                </div>
                <p className="mt-3 border-t border-primary-soft pt-3 text-[11px] leading-4 text-foreground-muted">
                  Mục tiêu: {kpi.goal}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ChannelPerformanceTable({
  analytics,
}: Pick<WorkspaceAnalyticsViewProps, "analytics">) {
  return (
    <Card className="overflow-hidden shadow-none">
      <CardHeader className="border-b border-primary-soft">
        <h3 className="text-lg font-extrabold text-foreground">Hiệu quả theo kênh</h3>
        <p className="text-xs leading-5 text-foreground-muted">
          So sánh cùng kỳ dữ liệu; nhãn chất lượng cho biết mức độ có thể sử dụng.
        </p>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Bảng hiệu quả theo kênh gồm số bài, tiếp cận, tương tác, lead và chuyển đổi.
          </caption>
          <thead className="bg-muted text-[11px] uppercase tracking-wide text-foreground-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-bold">Kênh</th>
              <th scope="col" className="px-3 py-3 text-right font-bold">Bài</th>
              <th scope="col" className="px-3 py-3 text-right font-bold">Tiếp cận</th>
              <th scope="col" className="px-3 py-3 text-right font-bold">Tương tác</th>
              <th scope="col" className="px-3 py-3 text-right font-bold">Lead</th>
              <th scope="col" className="px-3 py-3 text-right font-bold">Chuyển đổi</th>
              <th scope="col" className="px-5 py-3 font-bold">Chất lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-soft">
            {analytics.channelPerformance.map((channel) => (
              <tr key={channel.channelId} className="bg-card">
                <th scope="row" className="px-5 py-4 font-extrabold text-foreground">
                  {PLATFORM_LABELS[channel.platform]}
                </th>
                <td className="px-3 py-4 text-right text-foreground-muted">
                  {NUMBER_FORMATTER.format(channel.contentPublished)}
                </td>
                <td className="px-3 py-4 text-right font-semibold text-foreground">
                  {NUMBER_FORMATTER.format(channel.reach)}
                </td>
                <td className="px-3 py-4 text-right text-foreground-muted">
                  {channel.engagementRate.toLocaleString("vi-VN")}%
                </td>
                <td className="px-3 py-4 text-right text-foreground-muted">
                  {NUMBER_FORMATTER.format(channel.leads)}
                </td>
                <td className="px-3 py-4 text-right text-foreground-muted">
                  {channel.conversionRate.toLocaleString("vi-VN")}%
                </td>
                <td className="px-5 py-4">
                  <QualityBadge quality={channel.dataQuality} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const FUNNEL_LABELS: Record<WorkspaceAnalytics["funnel"][number]["stage"], string> = {
  reach: "Tiếp cận",
  engagement: "Tương tác",
  inquiry: "Hỏi thông tin",
  consultation: "Tư vấn",
  enrollment: "Đăng ký",
};

function FunnelOverview({ analytics }: Pick<WorkspaceAnalyticsViewProps, "analytics">) {
  const maxValue = analytics.funnel[0]?.value ?? 0;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <h3 className="text-lg font-extrabold text-foreground">Phễu chuyển đổi</h3>
        <p className="text-xs leading-5 text-foreground-muted">
          Quy mô và tỷ lệ giữ lại qua từng bước, từ tiếp cận đến đăng ký.
        </p>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {analytics.funnel.map((stage, index) => {
            const widthPercent =
              maxValue > 0 ? Math.max(18, (stage.value / maxValue) * 100) : 18;

            return (
              <li key={stage.stage} className="relative rounded-xl bg-muted p-3">
                <div
                  className="absolute inset-x-0 bottom-0 h-1 rounded-b-xl bg-primary/70"
                  style={{ width: `${widthPercent}%` }}
                  aria-hidden
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
                    Bước {index + 1}
                  </span>
                  <QualityBadge quality={stage.dataQuality} />
                </div>
                <p className="mt-3 text-sm font-extrabold text-foreground">
                  {FUNNEL_LABELS[stage.stage]}
                </p>
                <p className="mt-1 text-xl font-black text-foreground">
                  {NUMBER_FORMATTER.format(stage.value)}
                </p>
                <p className="mt-1 min-h-4 text-[11px] text-foreground-muted">
                  {stage.conversionFromPreviousPercent === null
                    ? "Điểm đầu phễu"
                    : `${stage.conversionFromPreviousPercent.toLocaleString("vi-VN")}% từ bước trước`}
                </p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function InsightList({
  analytics,
  onApplyInsight,
}: Pick<WorkspaceAnalyticsViewProps, "analytics" | "onApplyInsight">) {
  return (
    <section aria-labelledby="analytics-insight-title">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-5 text-primary" aria-hidden />
          <h3 id="analytics-insight-title" className="text-lg font-extrabold text-foreground">
            Insight có thể hành động
          </h3>
        </div>
        <p className="mt-1 text-xs leading-5 text-foreground-muted">
          Mọi kết luận đều kèm bằng chứng, phạm vi, độ tin cậy và số mẫu.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {analytics.insights.map((insight) => {
          const confidence = CONFIDENCE_META[insight.confidence];

          return (
            <Card key={insight.id} className="shadow-none">
              <CardContent className="pt-4 md:pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={confidence.className}>
                    <ShieldCheck className="mr-1 size-3.5" aria-hidden />
                    {confidence.label}
                  </Badge>
                  <Badge variant="outline">{insight.sampleSize} mẫu</Badge>
                  <QualityBadge quality={insight.dataQuality} />
                </div>

                <h4 className="mt-3 text-base font-extrabold leading-6 text-foreground">
                  {insight.finding}
                </h4>

                <div className="mt-3 rounded-xl bg-muted p-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-foreground-muted">
                    Bằng chứng
                  </p>
                  <p className="mt-1 text-xs leading-5 text-foreground">
                    {insight.evidence}
                  </p>
                </div>

                <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-bold text-foreground-muted">Phạm vi áp dụng</dt>
                    <dd className="mt-1 leading-5 text-foreground">{insight.scope}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-foreground-muted">Kênh liên quan</dt>
                    <dd className="mt-1 flex flex-wrap gap-1">
                      {insight.relatedChannelIds.map((channelId) => (
                        <span
                          key={channelId}
                          className="rounded-md bg-primary-soft px-2 py-1 text-[11px] font-semibold text-amber-800"
                        >
                          {formatChannelId(channelId)}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-col gap-3 border-t border-primary-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold leading-5 text-foreground">
                    <Sparkles className="mr-1 inline size-3.5 text-primary" aria-hidden />
                    {insight.recommendedAction}
                  </p>
                  {onApplyInsight ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => onApplyInsight(insight)}
                    >
                      Tạo đề xuất
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Button>
                  ) : (
                    <Link
                      href="/campaign-planning"
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" }),
                        "shrink-0"
                      )}
                    >
                      Đưa vào kế hoạch
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function WorkspaceAnalyticsView({
  analytics,
  onNavigate,
  onApplyInsight,
}: WorkspaceAnalyticsViewProps) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <WorkspaceSectionHeading
        eyebrow="Dashboard theo mục tiêu"
        title="Tình hình tăng trưởng & chất lượng dữ liệu"
        description="Ưu tiên vấn đề cần xử lý trước, sau đó mới diễn giải KPI và insight. Dữ liệu ước tính không tự động thay đổi chiến lược khi chưa có xác nhận."
        action={
          <div className="inline-flex items-center gap-2 rounded-xl border border-primary-soft bg-card px-3 py-2 text-xs font-semibold text-foreground-muted">
            <CalendarDays className="size-4 text-primary" aria-hidden />
            {formatDate(analytics.dateRange.from)} – {formatDate(analytics.dateRange.to)}
          </div>
        }
      />

      <PriorityAndQuality analytics={analytics} onNavigate={onNavigate} />
      <KpiGrid analytics={analytics} />

      <WorkspaceAnalyticsCharts
        trend={analytics.trend}
        contentPillars={analytics.contentPillars}
      />

      <ChannelPerformanceTable analytics={analytics} />
      <FunnelOverview analytics={analytics} />
      <InsightList analytics={analytics} onApplyInsight={onApplyInsight} />
    </div>
  );
}
